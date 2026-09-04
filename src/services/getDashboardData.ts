import type { Exercise } from '../domain/exercise/types'
import type {
  ExerciseRepository,
  LearnerState,
  LearnerStateRepository,
} from '../domain/learning/types'
import { buildDailyMission } from './buildDailyMission'

export interface DashboardData {
  exercises: Exercise[]
  learnerState: LearnerState
}

export async function getDashboardData(
  exerciseRepository: ExerciseRepository,
  learnerStateRepository: LearnerStateRepository,
  now = new Date(),
): Promise<DashboardData> {
  const [exercises, learnerState] = await Promise.all([
    exerciseRepository.listExercises(),
    learnerStateRepository.load(),
  ])
  const dateKey = now.toISOString().slice(0, 10)

  if (learnerState.dailyMission?.date === dateKey) {
    return { exercises, learnerState }
  }

  const updatedState: LearnerState = {
    ...learnerState,
    dailyMission: buildDailyMission(
      exercises,
      learnerState.completedExerciseIds,
      now,
    ),
    updatedAt: now.toISOString(),
  }

  await learnerStateRepository.save(updatedState)

  return { exercises, learnerState: updatedState }
}
