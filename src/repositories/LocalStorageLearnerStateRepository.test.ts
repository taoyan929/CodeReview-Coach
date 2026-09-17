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

  it('migrates version 2 finding locations into discrete selections', async () => {
    const currentState = createInitialLearnerState(
      new Date('2026-09-05T00:00:00.000Z'),
    )
    const legacyState = {
      ...currentState,
      schemaVersion: 2,
      attempts: [
        {
          id: 'attempt-1',
          exerciseId: 'react-derived-state-01',
          startedAt: '2026-09-05T00:00:00.000Z',
          findings: [
            {
              id: 'finding-1',
              fileId: 'task-list',
              location: { startLine: 15, endLine: 17 },
              category: 'logic',
              diagnosis: 'Derived state becomes stale.',
              createdAt: '2026-09-05T00:01:00.000Z',
            },
          ],
          hintsUsed: [],
        },
      ],
    }
    window.localStorage.setItem('test-state', JSON.stringify(legacyState))
    const repository = new LocalStorageLearnerStateRepository(
      window.localStorage,
      'test-state',
    )

    const migratedState = await repository.load()

    expect(migratedState.schemaVersion).toBe(LEARNER_STATE_SCHEMA_VERSION)
    expect(migratedState.attempts[0]?.findings[0]?.locations).toEqual([
      { startLine: 15, endLine: 17 },
    ])
  })

  it('migrates version 3 missions to explainable recommendations', async () => {
    const currentState = createInitialLearnerState(
      new Date('2026-09-05T00:00:00.000Z'),
    )
    const legacyState = {
      ...currentState,
      schemaVersion: 3,
      dailyMission: {
        date: '2026-09-05',
        exerciseIds: ['react-derived-state-01'],
        completedExerciseIds: [],
        estimatedMinutes: 12,
      },
    }
    window.localStorage.setItem('test-state', JSON.stringify(legacyState))
    const repository = new LocalStorageLearnerStateRepository(
      window.localStorage,
      'test-state',
    )

    const migratedState = await repository.load()

    expect(migratedState.schemaVersion).toBe(LEARNER_STATE_SCHEMA_VERSION)
    expect(migratedState.dailyMission?.recommendations).toEqual([
      expect.objectContaining({
        exerciseId: 'react-derived-state-01',
        reasonCode: 'legacy-mission',
      }),
    ])
  })

  it('migrates version 4 attempts to full review mode', async () => {
    const currentState = createInitialLearnerState(
      new Date('2026-09-05T00:00:00.000Z'),
    )
    const legacyState = {
      ...currentState,
      schemaVersion: 4,
      attempts: [
        {
          id: 'attempt-1',
          exerciseId: 'react-derived-state-01',
          startedAt: '2026-09-05T00:00:00.000Z',
          findings: [],
          hintsUsed: [],
        },
      ],
    }
    window.localStorage.setItem('test-state', JSON.stringify(legacyState))
    const repository = new LocalStorageLearnerStateRepository(
      window.localStorage,
      'test-state',
    )

    const migratedState = await repository.load()

    expect(migratedState.schemaVersion).toBe(LEARNER_STATE_SCHEMA_VERSION)
    expect(migratedState.attempts[0]?.answerMode).toBe('full-review')
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

  it('exports and restores a validated backup', async () => {
    const repository = new LocalStorageLearnerStateRepository(
      window.localStorage,
      'test-state',
    )
    const state = createInitialLearnerState(
      new Date('2026-09-14T00:00:00.000Z'),
    )
    state.profile.preferredTracks = ['react']
    await repository.save(state)
    const backup = await repository.exportBackup()

    await repository.reset()
    const restored = await repository.restoreBackup(backup)

    expect(restored.profile.preferredTracks).toEqual(['react'])
    expect(await repository.load()).toEqual(restored)
  })

  it('keeps current state when a backup fails validation', async () => {
    const repository = new LocalStorageLearnerStateRepository(
      window.localStorage,
      'test-state',
    )
    const state = createInitialLearnerState(
      new Date('2026-09-14T00:00:00.000Z'),
    )
    await repository.save(state)
    const before = await repository.exportRawData()

    await expect(
      repository.restoreBackup('{"schemaVersion":0}'),
    ).rejects.toThrow(/does not contain valid learner data/)
    expect(await repository.exportRawData()).toBe(before)
  })
})
