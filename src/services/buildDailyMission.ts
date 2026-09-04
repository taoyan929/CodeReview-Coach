import type { Exercise } from '../domain/exercise/types'
import type { MissionState } from '../domain/learning/types'

export function buildDailyMission(
  exercises: Exercise[],
  completedExerciseIds: string[],
  date: Date,
): MissionState {
  const dateKey = date.toISOString().slice(0, 10)
  const selectedExercises = exercises
    .filter((exercise) => !completedExerciseIds.includes(exercise.id))
    .slice(0, 3)

  return {
    date: dateKey,
    exerciseIds: selectedExercises.map((exercise) => exercise.id),
    completedExerciseIds: [],
    estimatedMinutes: selectedExercises.reduce(
      (total, exercise) => total + exercise.estimatedMinutes,
      0,
    ),
  }
}
