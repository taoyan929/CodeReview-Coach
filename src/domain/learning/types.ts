import type {
  CodeFile,
  CodeLocation,
  Curriculum,
  Exercise,
  IssueCategory,
  LearningLevel,
  Track,
} from '../exercise/types'

export interface LearnerProfile {
  id: string
  createdAt: string
  preferredTracks: Track[]
  dailyTargetMinutes: number
}

export interface LearnerFinding {
  id: string
  fileId: string
  locations: CodeLocation[]
  category?: IssueCategory
  diagnosis: string
  impact?: string
  suggestedFix?: string
  createdAt: string
}

export interface HintUsage {
  expectedFindingId?: string
  level: 1 | 2 | 3
  usedAt: string
}

export interface FixSubmission {
  files: CodeFile[]
  submittedAt: string
}

export interface FindingEvaluation {
  learnerFindingId?: string
  expectedFindingId?: string
  detection: number
  category: number
  diagnosis: number
  reasoning: number
  fix: number
  communication?: number
  status: 'strong' | 'partial' | 'missed' | 'incorrect'
}

export interface EvaluationResult {
  technicalScore: number
  communicationScore?: number
  findingResults: FindingEvaluation[]
  conceptsFound: string[]
  conceptsMissed: string[]
  assistanceLevel: number
  completed: boolean
}

export interface ExerciseAttempt {
  id: string
  exerciseId: Exercise['id']
  startedAt: string
  submittedAt?: string
  completedAt?: string
  findings: LearnerFinding[]
  overallDecision?: 'approve' | 'comment' | 'request-changes'
  hintsUsed: HintUsage[]
  evaluation?: EvaluationResult
  fixSubmission?: FixSubmission
}

export interface MasteryState {
  overall?: number
  byTrack: Partial<Record<Track, number>>
  byLevel: Partial<Record<LearningLevel, number>>
  byConcept: Record<string, number | undefined>
}

export interface WeakConceptState {
  concept: string
  missCount: number
  priority: number
  lastPractisedAt?: string
}

export interface StreakState {
  currentDays: number
  longestDays: number
  lastActiveDate?: string
  activityDates: string[]
}

export interface MissionState {
  date: string
  exerciseIds: string[]
  completedExerciseIds: string[]
  estimatedMinutes: number
}

export interface WeeklyGoalState {
  weekStart: string
  targetExercises: number
  completedExercises: number
}

export interface LearnerState {
  schemaVersion: number
  profile: LearnerProfile
  attempts: ExerciseAttempt[]
  completedExerciseIds: string[]
  curriculumCompletion: number
  mastery: MasteryState
  weakConcepts: WeakConceptState[]
  streak: StreakState
  dailyMission?: MissionState
  weeklyGoal?: WeeklyGoalState
  unlocks: string[]
  updatedAt: string
}

export interface Recommendation {
  exerciseId: Exercise['id']
  score: number
  reasonCode: string
  reasonText: string
}

export interface StructuredAiAssessment {
  semanticMatches: Array<{
    expectedFindingId: string
    learnerFindingId: string
    confidence: number
    diagnosisMatch: number
    reasoningQuality: number
    fixQuality: number
  }>
  communication?: {
    clarity: number
    specificity: number
    suggestedRewrite?: string
  }
  confidence: number
}

export interface ExerciseRepository {
  getExercise(id: string): Promise<Exercise | null>
  listExercises(
    filters?: import('../exercise/types').ExerciseFilters,
  ): Promise<Exercise[]>
  getCurriculum(): Promise<Curriculum>
}

export interface LearnerStateRepository {
  load(): Promise<LearnerState>
  save(state: LearnerState): Promise<void>
  reset(): Promise<void>
}

export const LEARNER_STATE_SCHEMA_VERSION = 3

export function createInitialLearnerState(now = new Date()): LearnerState {
  const timestamp = now.toISOString()

  return {
    schemaVersion: LEARNER_STATE_SCHEMA_VERSION,
    profile: {
      id: crypto.randomUUID(),
      createdAt: timestamp,
      preferredTracks: [],
      dailyTargetMinutes: 20,
    },
    attempts: [],
    completedExerciseIds: [],
    curriculumCompletion: 0,
    mastery: {
      byTrack: {},
      byLevel: {},
      byConcept: {},
    },
    weakConcepts: [],
    streak: {
      currentDays: 0,
      longestDays: 0,
      activityDates: [],
    },
    unlocks: [],
    updatedAt: timestamp,
  }
}
