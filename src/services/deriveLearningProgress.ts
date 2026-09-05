import {
  learningLevels,
  tracks,
  type Curriculum,
  type Exercise,
  type LearningLevel,
  type Track,
} from '../domain/exercise/types'
import type {
  ExerciseAttempt,
  LearnerState,
  StreakState,
  WeakConceptState,
  WeeklyGoalState,
} from '../domain/learning/types'

const DEFAULT_WEEKLY_TARGET = 5
const WEAK_MASTERY_THRESHOLD = 70

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

interface ScoredAttempt {
  attempt: ExerciseAttempt
  exercise: Exercise
  masteryScore: number
}

function round(value: number) {
  return Math.round(value)
}

function average(values: number[]) {
  return values.length
    ? round(values.reduce((total, value) => total + value, 0) / values.length)
    : undefined
}

function dateKey(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10)
}

function dateFromKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

function daysBetween(later: string, earlier: string) {
  const milliseconds =
    dateFromKey(later).getTime() - dateFromKey(earlier).getTime()
  return Math.round(milliseconds / 86_400_000)
}

function calculateStreak(attempts: ExerciseAttempt[], now: Date): StreakState {
  const activityDates = [
    ...new Set(
      attempts
        .map(({ completedAt }) => completedAt && dateKey(completedAt))
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort()

  if (activityDates.length === 0) {
    return { currentDays: 0, longestDays: 0, activityDates: [] }
  }

  let longestDays = 1
  let currentRun = 1

  for (let index = 1; index < activityDates.length; index += 1) {
    if (daysBetween(activityDates[index]!, activityDates[index - 1]!) === 1) {
      currentRun += 1
      longestDays = Math.max(longestDays, currentRun)
    } else {
      currentRun = 1
    }
  }

  const lastActiveDate = activityDates.at(-1)
  const today = dateKey(now)
  const currentDays =
    lastActiveDate && daysBetween(today, lastActiveDate) <= 1 ? currentRun : 0

  return {
    currentDays,
    longestDays,
    lastActiveDate,
    activityDates,
  }
}

function weekStartKey(now: Date) {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  const day = start.getUTCDay()
  start.setUTCDate(start.getUTCDate() - (day === 0 ? 6 : day - 1))
  return dateKey(start)
}

function calculateWeeklyGoal(
  attempts: ExerciseAttempt[],
  now: Date,
  existingGoal?: WeeklyGoalState,
): WeeklyGoalState {
  const weekStart = weekStartKey(now)
  const completedExercises = attempts.filter(
    ({ completedAt }) => completedAt && dateKey(completedAt) >= weekStart,
  ).length

  return {
    weekStart,
    targetExercises:
      existingGoal?.weekStart === weekStart
        ? existingGoal.targetExercises
        : DEFAULT_WEEKLY_TARGET,
    completedExercises,
  }
}

export function calculateAttemptMastery(attempt: ExerciseAttempt) {
  if (!attempt.evaluation) {
    return undefined
  }

  const technicalContribution = attempt.evaluation.technicalScore * 0.75
  const independenceContribution = (1 - attempt.evaluation.assistanceLevel) * 10
  const fixContribution = attempt.fixSubmission && attempt.completedAt ? 15 : 0

  return Math.max(
    0,
    Math.min(
      100,
      round(technicalContribution + independenceContribution + fixContribution),
    ),
  )
}

function scoredAttempts(
  attempts: ExerciseAttempt[],
  exercises: Exercise[],
): ScoredAttempt[] {
  const exerciseMap = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  )

  return attempts.flatMap((attempt) => {
    const exercise = exerciseMap.get(attempt.exerciseId)
    const masteryScore = calculateAttemptMastery(attempt)

    return exercise && masteryScore !== undefined
      ? [{ attempt, exercise, masteryScore }]
      : []
  })
}

function trackMatches(exercise: Exercise, track: Track) {
  return exercise.track === track || exercise.secondaryTracks?.includes(track)
}

function calculateCompletion(
  exercises: Exercise[],
  completedExerciseIds: Set<string>,
) {
  const totalWeight = exercises.reduce(
    (total, exercise) => total + exercise.curriculumWeight,
    0,
  )
  const completedWeight = exercises.reduce(
    (total, exercise) =>
      completedExerciseIds.has(exercise.id)
        ? total + exercise.curriculumWeight
        : total,
    0,
  )

  return totalWeight > 0 ? round((completedWeight / totalWeight) * 100) : 0
}

function progressStatus(
  totalExercises: number,
  completion: number,
): ProgressStatus {
  if (totalExercises === 0) return 'locked'
  if (completion === 100) return 'complete'
  if (completion > 0) return 'in-progress'
  return 'available'
}

function buildWeakConcepts(scored: ScoredAttempt[]): WeakConceptState[] {
  const conceptSignals = new Map<
    string,
    { scores: number[]; missCount: number; lastPractisedAt?: string }
  >()

  for (const { attempt, masteryScore } of scored) {
    const occurredAt = attempt.completedAt ?? attempt.submittedAt
    const found = new Set(attempt.evaluation?.conceptsFound ?? [])
    const missed = new Set(attempt.evaluation?.conceptsMissed ?? [])

    for (const concept of new Set([...found, ...missed])) {
      const signal = conceptSignals.get(concept) ?? {
        scores: [],
        missCount: 0,
      }
      signal.scores.push(
        missed.has(concept) ? Math.min(40, masteryScore) : masteryScore,
      )
      signal.missCount += missed.has(concept) ? 1 : 0
      if (
        occurredAt &&
        (!signal.lastPractisedAt || occurredAt > signal.lastPractisedAt)
      ) {
        signal.lastPractisedAt = occurredAt
      }
      conceptSignals.set(concept, signal)
    }
  }

  return [...conceptSignals.entries()]
    .flatMap(([concept, signal]) => {
      const mastery = average(signal.scores) ?? 0
      if (signal.missCount === 0 || mastery >= WEAK_MASTERY_THRESHOLD) {
        return []
      }

      return [
        {
          concept,
          missCount: signal.missCount,
          priority: round(
            WEAK_MASTERY_THRESHOLD - mastery + signal.missCount * 10,
          ),
          lastPractisedAt: signal.lastPractisedAt,
        },
      ]
    })
    .sort((left, right) => right.priority - left.priority)
}

function collectUnlocks(
  exercises: Exercise[],
  curriculumCompletion: number,
  reviewMastery?: number,
) {
  const unlocks = new Set<string>(['level:literacy'])

  for (const exercise of exercises) {
    unlocks.add(`level:${exercise.level}`)
    unlocks.add(`track:${exercise.track}`)
    exercise.secondaryTracks?.forEach((track) => unlocks.add(`track:${track}`))
  }

  const hasBossReview = exercises.some(
    ({ missionType }) => missionType === 'boss-review',
  )
  if (
    hasBossReview &&
    curriculumCompletion >= 50 &&
    (reviewMastery ?? 0) >= 70
  ) {
    unlocks.add('mission:boss-review')
  }

  return [...unlocks].sort()
}

export function deriveLearningProgress(
  learnerState: LearnerState,
  exercises: Exercise[],
  curriculum: Curriculum,
  now = new Date(),
): LearningProgressSnapshot {
  const completedExerciseIds = new Set(learnerState.completedExerciseIds)
  const scored = scoredAttempts(learnerState.attempts, exercises)
  const completedWeight = exercises.reduce(
    (total, exercise) =>
      completedExerciseIds.has(exercise.id)
        ? total + exercise.curriculumWeight
        : total,
    0,
  )
  const curriculumCompletion =
    curriculum.totalWeight > 0
      ? Math.min(100, round((completedWeight / curriculum.totalWeight) * 100))
      : 0
  const reviewMastery = average(scored.map(({ masteryScore }) => masteryScore))

  const byTrack = tracks.map((track) => {
    const trackExercises = exercises.filter((exercise) =>
      trackMatches(exercise, track),
    )
    const completion = calculateCompletion(trackExercises, completedExerciseIds)
    const mastery = average(
      scored
        .filter(({ exercise }) => trackMatches(exercise, track))
        .map(({ masteryScore }) => masteryScore),
    )

    return {
      id: track,
      completion,
      mastery,
      completedExercises: trackExercises.filter(({ id }) =>
        completedExerciseIds.has(id),
      ).length,
      totalExercises: trackExercises.length,
      status: progressStatus(trackExercises.length, completion),
    }
  })

  const byLevel = learningLevels.map((level) => {
    const levelExercises = exercises.filter(
      (exercise) => exercise.level === level,
    )
    const completion = calculateCompletion(levelExercises, completedExerciseIds)
    const mastery = average(
      scored
        .filter(({ exercise }) => exercise.level === level)
        .map(({ masteryScore }) => masteryScore),
    )

    return {
      id: level,
      completion,
      mastery,
      completedExercises: levelExercises.filter(({ id }) =>
        completedExerciseIds.has(id),
      ).length,
      totalExercises: levelExercises.length,
      status:
        level === 'literacy' && levelExercises.length === 0
          ? 'available'
          : progressStatus(levelExercises.length, completion),
    }
  })

  const weakConcepts = buildWeakConcepts(scored)
  const weakTracks = byTrack
    .filter(
      ({ mastery }) =>
        mastery !== undefined && mastery < WEAK_MASTERY_THRESHOLD,
    )
    .map(({ id }) => id)
  const unlocks = collectUnlocks(exercises, curriculumCompletion, reviewMastery)
  const bossReviewStatus = unlocks.includes('mission:boss-review')
    ? 'available'
    : 'locked'

  return {
    curriculumCompletion,
    reviewMastery,
    byTrack,
    byLevel,
    weakConcepts,
    weakTracks,
    recentActivity: scored
      .filter(({ attempt }) => attempt.submittedAt)
      .sort((left, right) =>
        (
          right.attempt.completedAt ??
          right.attempt.submittedAt ??
          ''
        ).localeCompare(
          left.attempt.completedAt ?? left.attempt.submittedAt ?? '',
        ),
      )
      .slice(0, 5)
      .map(({ attempt, exercise, masteryScore }) => ({
        attemptId: attempt.id,
        exerciseId: exercise.id,
        exerciseTitle: exercise.title,
        track: exercise.track,
        occurredAt: attempt.completedAt ?? attempt.submittedAt!,
        technicalScore: attempt.evaluation!.technicalScore,
        masteryScore,
        hintsUsed: attempt.hintsUsed.length,
        completed: Boolean(attempt.completedAt),
      })),
    streak: calculateStreak(learnerState.attempts, now),
    weeklyGoal: calculateWeeklyGoal(
      learnerState.attempts,
      now,
      learnerState.weeklyGoal,
    ),
    unlocks,
    bossReviewStatus,
  }
}

export function synchroniseLearnerProgress(
  learnerState: LearnerState,
  exercises: Exercise[],
  curriculum: Curriculum,
  now = new Date(),
): LearnerState {
  const progress = deriveLearningProgress(
    learnerState,
    exercises,
    curriculum,
    now,
  )
  const masteryByTrack = Object.fromEntries(
    progress.byTrack.flatMap(({ id, mastery }) =>
      mastery === undefined ? [] : [[id, mastery]],
    ),
  )
  const masteryByLevel = Object.fromEntries(
    progress.byLevel.flatMap(({ id, mastery }) =>
      mastery === undefined ? [] : [[id, mastery]],
    ),
  )
  const masteryByConcept: Record<string, number | undefined> = {}

  for (const { attempt, masteryScore } of scoredAttempts(
    learnerState.attempts,
    exercises,
  )) {
    for (const concept of attempt.evaluation?.conceptsFound ?? []) {
      masteryByConcept[concept] = masteryScore
    }
    for (const concept of attempt.evaluation?.conceptsMissed ?? []) {
      masteryByConcept[concept] = Math.min(40, masteryScore)
    }
  }

  return {
    ...learnerState,
    curriculumCompletion: progress.curriculumCompletion,
    mastery: {
      overall: progress.reviewMastery,
      byTrack: masteryByTrack,
      byLevel: masteryByLevel,
      byConcept: masteryByConcept,
    },
    weakConcepts: progress.weakConcepts,
    streak: progress.streak,
    weeklyGoal: progress.weeklyGoal,
    unlocks: progress.unlocks,
    updatedAt: now.toISOString(),
  }
}
