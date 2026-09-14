import { describe, expect, it, vi } from 'vitest'

import { createInitialLearnerState } from '../domain/learning/types'
import type { LearnerStateRepository } from '../domain/learning/types'
import { updateLearnerPreferences } from './updateLearnerPreferences'

function repositoryWith(
  completedExerciseIds: string[],
): LearnerStateRepository {
  const state = {
    ...createInitialLearnerState(new Date('2026-09-14T00:00:00.000Z')),
    dailyMission: {
      date: '2026-09-14',
      exerciseIds: ['exercise-1'],
      completedExerciseIds,
      estimatedMinutes: 10,
      recommendations: [],
    },
  }
  return {
    load: vi.fn().mockResolvedValue(state),
    save: vi.fn(),
    exportBackup: vi.fn(),
    exportRawData: vi.fn(),
    restoreBackup: vi.fn(),
    reset: vi.fn(),
  }
}

describe('updateLearnerPreferences', () => {
  it('regenerates an unstarted daily mission', async () => {
    const repository = repositoryWith([])
    const state = await updateLearnerPreferences(repository, {
      preferredTracks: ['react'],
      dailyTargetMinutes: 10,
    })
    expect(state.dailyMission).toBeUndefined()
  })

  it('keeps an in-progress daily mission until the next day', async () => {
    const repository = repositoryWith(['exercise-1'])
    const state = await updateLearnerPreferences(repository, {
      preferredTracks: ['react'],
      dailyTargetMinutes: 30,
    })
    expect(state.dailyMission?.completedExerciseIds).toEqual(['exercise-1'])
  })
})
