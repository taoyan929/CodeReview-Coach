import type { Exercise } from '../domain/exercise/types'
import type {
  ExerciseRepository,
  LearnerState,
  LearnerStateRepository,
} from '../domain/learning/types'
import { buildDailyMission } from './buildDailyMission'
import {
  deriveLearningProgress,
  synchroniseLearnerProgress,
  type LearningProgressSnapshot,
} from './deriveLearningProgress'
import { recommendExercises } from './recommendExercises'
import { calendarDateKey } from '../utils/calendar'

export interface DashboardData {
  exercises: Exercise[]
  learnerState: LearnerState
  progress: LearningProgressSnapshot
}

export async function getDashboardData(
  exerciseRepository: ExerciseRepository,
  learnerStateRepository: LearnerStateRepository,
  now = new Date(),
  timeZone?: string,
): Promise<DashboardData> {
  const [exercises, curriculum, learnerState] = await Promise.all([
    exerciseRepository.listExercises(),
    exerciseRepository.getCurriculum(),
    learnerStateRepository.load(),
  ])
  const dateKey = calendarDateKey(now, timeZone)
  const synchronisedState = synchroniseLearnerProgress(
    learnerState,
    exercises,
    curriculum,
    now,
    timeZone,
  )
  const progress = deriveLearningProgress(
    synchronisedState,
    exercises,
    curriculum,
    now,
    timeZone,
  )
  const hasCurrentRecommendations =
    synchronisedState.dailyMission?.date === dateKey &&
    synchronisedState.dailyMission.recommendations.length > 0 &&
    synchronisedState.dailyMission.recommendations.every(
      ({ reasonCode }) => reasonCode !== 'legacy-mission',
    )
  const stateWithMission: LearnerState = hasCurrentRecommendations
    ? synchronisedState
    : {
        ...synchronisedState,
        dailyMission: buildDailyMission(
          exercises,
          recommendExercises({
            exercises,
            learnerState: synchronisedState,
            progress,
            now,
          }),
          now,
          timeZone,
        ),
      }
  const updatedState = synchroniseLearnerProgress(
    stateWithMission,
    exercises,
    curriculum,
    now,
    timeZone,
  )

  await learnerStateRepository.save(updatedState)

  return {
    exercises,
    learnerState: updatedState,
    progress: deriveLearningProgress(
      updatedState,
      exercises,
      curriculum,
      now,
      timeZone,
    ),
  }
}
