import type { LearningLevel, Track } from '../../domain/exercise/types'
import type {
  ExerciseAttempt,
  StreakState,
  WeakConceptState,
  WeeklyGoalState,
} from '../../domain/learning/types'
import type { Exercise } from '../../domain/exercise/types'

export type ProgressStatus = 'locked' | 'available' | 'in-progress' | 'complete'

export interface ProgressBreakdown<T extends string> {
  id: T
  completion: number
  mastery?: number
  completedExercises: number
  totalExercises: number
  status: ProgressStatus
}

export interface RecentLearningActivity {
  attemptId: string
  exerciseId: string
  exerciseTitle: string
  track: Track
  occurredAt: string
  technicalScore: number
  masteryScore: number
  hintsUsed: number
  completed: boolean
}

export interface LearningProgressSnapshot {
  curriculumCompletion: number
  reviewMastery?: number
  byTrack: ProgressBreakdown<Track>[]
  byLevel: ProgressBreakdown<LearningLevel>[]
  weakConcepts: WeakConceptState[]
  weakTracks: Track[]
  recentActivity: RecentLearningActivity[]
  streak: StreakState
  weeklyGoal: WeeklyGoalState
  unlocks: string[]
  bossReviewStatus: ProgressStatus
}

export interface ScoredAttempt {
  attempt: ExerciseAttempt
  exercise: Exercise
  masteryScore: number
}
