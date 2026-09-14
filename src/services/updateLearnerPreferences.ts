import type { Track } from '../domain/exercise/types'
import type { LearnerStateRepository } from '../domain/learning/types'

export interface LearnerPreferences {
  preferredTracks: Track[]
  dailyTargetMinutes: 10 | 20 | 30
}

export async function updateLearnerPreferences(
  repository: LearnerStateRepository,
  preferences: LearnerPreferences,
) {
  const state = await repository.load()
  const missionHasProgress = Boolean(
    state.dailyMission?.completedExerciseIds.length,
  )
  const updatedState = {
    ...state,
    profile: { ...state.profile, ...preferences },
    dailyMission: missionHasProgress ? state.dailyMission : undefined,
    updatedAt: new Date().toISOString(),
  }

  await repository.save(updatedState)
  return updatedState
}
