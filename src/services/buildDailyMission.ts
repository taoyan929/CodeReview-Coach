import type { Exercise } from '../domain/exercise/types'
import type { MissionState, Recommendation } from '../domain/learning/types'
import { calendarDateKey } from '../utils/calendar'

export function buildDailyMission(
  exercises: Exercise[],
  recommendations: Recommendation[],
  date: Date,
  timeZone?: string,
): MissionState {
  const dateKey = calendarDateKey(date, timeZone)
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
