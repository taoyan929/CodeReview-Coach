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

  async reset(): Promise<void> {
    this.storage.removeItem(this.storageKey)
  }
}
