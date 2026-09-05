import type { Exercise } from '../domain/exercise/types'
import type { MissionState, Recommendation } from '../domain/learning/types'

export function buildDailyMission(
  exercises: Exercise[],
  recommendations: Recommendation[],
  date: Date,
): MissionState {
  const dateKey = date.toISOString().slice(0, 10)
  const selectedRecommendations = recommendations.slice(0, 3)
  const selectedIds = new Set(
    selectedRecommendations.map(({ exerciseId }) => exerciseId),
  )
  const selectedExercises = exercises.filter(({ id }) => selectedIds.has(id))

  return {
    date: dateKey,
    exerciseIds: selectedRecommendations.map(({ exerciseId }) => exerciseId),
    completedExerciseIds: [],
    estimatedMinutes: selectedExercises.reduce(
      (total, exercise) => total + exercise.estimatedMinutes,
      0,
    ),
    recommendations: selectedRecommendations,
  }
}
