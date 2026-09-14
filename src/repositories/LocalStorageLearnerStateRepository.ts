import {
  createInitialLearnerState,
  type LearnerState,
  type LearnerStateRepository,
} from '../domain/learning/types'
import {
  migrateLearnerState,
  parseLearnerState,
} from '../schemas/learnerStateSchema'

const DEFAULT_STORAGE_KEY = 'codereview-coach:learner-state'
const BACKUP_FORMAT_VERSION = 1

interface LearnerStateBackup {
  product: 'CodeReview Coach'
  formatVersion: typeof BACKUP_FORMAT_VERSION
  exportedAt: string
  learnerState: unknown
}

function isBackup(value: unknown): value is LearnerStateBackup {
  return (
    typeof value === 'object' &&
    value !== null &&
    'product' in value &&
    value.product === 'CodeReview Coach' &&
    'formatVersion' in value &&
    value.formatVersion === BACKUP_FORMAT_VERSION &&
    'learnerState' in value
  )
}

export class LocalStorageLearnerStateRepository implements LearnerStateRepository {
  constructor(
    private readonly storage: Storage = window.localStorage,
    private readonly storageKey = DEFAULT_STORAGE_KEY,
  ) {}

  async load(): Promise<LearnerState> {
    const storedValue = this.storage.getItem(this.storageKey)

    if (!storedValue) {
      const initialState = createInitialLearnerState()
      await this.save(initialState)
      return initialState
    }

    try {
      const migratedState = migrateLearnerState(JSON.parse(storedValue))
      await this.save(migratedState)
      return migratedState
    } catch (error) {
      throw new Error(
        'Learner state is invalid or requires an unsupported migration.',
        { cause: error },
      )
    }
  }

  async save(state: LearnerState): Promise<void> {
    const validatedState = parseLearnerState(state)
    this.storage.setItem(this.storageKey, JSON.stringify(validatedState))
  }

  async exportBackup(): Promise<string> {
    const learnerState = await this.load()
    return JSON.stringify(
      {
        product: 'CodeReview Coach',
        formatVersion: BACKUP_FORMAT_VERSION,
        exportedAt: new Date().toISOString(),
        learnerState,
      } satisfies LearnerStateBackup,
      null,
      2,
    )
  }

  async exportRawData(): Promise<string | null> {
    return this.storage.getItem(this.storageKey)
  }

  async restoreBackup(serializedBackup: string): Promise<LearnerState> {
    let decoded: unknown

    try {
      decoded = JSON.parse(serializedBackup)
    } catch {
      throw new Error('The selected file is not valid JSON.')
    }

    try {
      const restoredState = migrateLearnerState(
        isBackup(decoded) ? decoded.learnerState : decoded,
      )
      await this.save(restoredState)
      return restoredState
    } catch (error) {
      const detail =
        error instanceof Error && error.message ? ` ${error.message}` : ''
      throw new Error(
        `The backup does not contain valid learner data.${detail}`,
        { cause: error },
      )
    }
  }

  async reset(): Promise<void> {
    this.storage.removeItem(this.storageKey)
  }
}
