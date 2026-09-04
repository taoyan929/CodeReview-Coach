import {
  createInitialLearnerState,
  LEARNER_STATE_SCHEMA_VERSION,
} from '../domain/learning/types'
import { LocalStorageLearnerStateRepository } from './LocalStorageLearnerStateRepository'

describe('LocalStorageLearnerStateRepository', () => {
  it('creates and persists versioned initial state', async () => {
    const repository = new LocalStorageLearnerStateRepository(
      window.localStorage,
      'test-state',
    )

    const state = await repository.load()

    expect(state.schemaVersion).toBe(LEARNER_STATE_SCHEMA_VERSION)
    expect(state.mastery.overall).toBeUndefined()
    expect(window.localStorage.getItem('test-state')).not.toBeNull()
  })

  it('round-trips valid learner state', async () => {
    const repository = new LocalStorageLearnerStateRepository(
      window.localStorage,
      'test-state',
    )
    const state = createInitialLearnerState(
      new Date('2026-09-04T00:00:00.000Z'),
    )

    await repository.save(state)

    await expect(repository.load()).resolves.toEqual(state)
  })

  it('migrates version 1 streak state without losing learner data', async () => {
    const currentState = createInitialLearnerState(
      new Date('2026-09-04T00:00:00.000Z'),
    )
    const legacyState = {
      ...currentState,
      schemaVersion: 1,
      completedExerciseIds: ['react-derived-state-01'],
      streak: {
        currentDays: currentState.streak.currentDays,
        longestDays: currentState.streak.longestDays,
      },
    }
    window.localStorage.setItem('test-state', JSON.stringify(legacyState))
    const repository = new LocalStorageLearnerStateRepository(
      window.localStorage,
      'test-state',
    )

    const migratedState = await repository.load()

    expect(migratedState.schemaVersion).toBe(LEARNER_STATE_SCHEMA_VERSION)
    expect(migratedState.completedExerciseIds).toEqual([
      'react-derived-state-01',
    ])
    expect(migratedState.streak.activityDates).toEqual([])
  })

  it('rejects unsupported state instead of silently resetting it', async () => {
    window.localStorage.setItem(
      'test-state',
      JSON.stringify({ schemaVersion: 0 }),
    )
    const repository = new LocalStorageLearnerStateRepository(
      window.localStorage,
      'test-state',
    )

    await expect(repository.load()).rejects.toThrow(/unsupported migration/)
  })
})
