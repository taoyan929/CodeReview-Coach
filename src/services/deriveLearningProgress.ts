import { learningRules } from '../config/learningRules'
import {
  learningLevels,
  tracks,
  type Curriculum,
  type Exercise,
} from '../domain/exercise/types'
import type { LearnerState } from '../domain/learning/types'
import { buildRecentActivity } from './learningProgress/activity'
import {
  calculateStreak,
  calculateWeeklyGoal,
} from './learningProgress/calendarProgress'
import {
  average,
  buildWeakConcepts,
  calculateAttemptMastery,
  calculateCompletion,
  progressStatus,
  round,
  scoredAttempts,
  trackMatches,
} from './learningProgress/mastery'
import type {
  LearningProgressSnapshot,
  ProgressBreakdown,
  ProgressStatus,
  RecentLearningActivity,
} from './learningProgress/types'
import { collectUnlocks } from './learningProgress/unlocks'

export type {
  LearningProgressSnapshot,
  ProgressBreakdown,
  ProgressStatus,
  RecentLearningActivity,
}
export { calculateAttemptMastery }

export function deriveLearningProgress(
  learnerState: LearnerState,
  exercises: Exercise[],
  curriculum: Curriculum,
  now = new Date(),
  timeZone?: string,
): LearningProgressSnapshot {
  const completedIds = new Set(learnerState.completedExerciseIds)
  const scored = scoredAttempts(learnerState.attempts, exercises)
  const completedWeight = exercises.reduce(
    (total, exercise) =>
      completedIds.has(exercise.id) ? total + exercise.curriculumWeight : total,
    0,
  )
  const curriculumCompletion = curriculum.totalWeight
    ? Math.min(100, round((completedWeight / curriculum.totalWeight) * 100))
    : 0
  const reviewMastery = average(scored.map(({ masteryScore }) => masteryScore))

  const rawByTrack = tracks.map((track) => {
    const trackExercises = exercises.filter((exercise) =>
      trackMatches(exercise, track),
    )
    const completion = calculateCompletion(trackExercises, completedIds)
    return {
      id: track,
      completion,
      mastery: average(
        scored
          .filter(({ exercise }) => trackMatches(exercise, track))
          .map(({ masteryScore }) => masteryScore),
      ),
      completedExercises: trackExercises.filter(({ id }) =>
        completedIds.has(id),
      ).length,
      totalExercises: trackExercises.length,
      status: progressStatus(trackExercises.length, completion),
    }
  })

  const rawByLevel = learningLevels.map((level) => {
    const levelExercises = exercises.filter(
      (exercise) => exercise.level === level,
    )
    const completion = calculateCompletion(levelExercises, completedIds)
    return {
      id: level,
      completion,
      mastery: average(
        scored
          .filter(({ exercise }) => exercise.level === level)
          .map(({ masteryScore }) => masteryScore),
      ),
      completedExercises: levelExercises.filter(({ id }) =>
        completedIds.has(id),
      ).length,
      totalExercises: levelExercises.length,
      status: progressStatus(levelExercises.length, completion),
    }
  })

  const weakConcepts = buildWeakConcepts(scored)
  const unlocks = collectUnlocks(
    exercises,
    rawByLevel,
    scored,
    curriculumCompletion,
    reviewMastery,
  )
  const statusFor = (
    kind: 'level' | 'track',
    id: string,
    completion: number,
  ) =>
    completion === 100
      ? ('complete' as const)
      : completion > 0
        ? ('in-progress' as const)
        : unlocks.includes(`${kind}:${id}`)
          ? ('available' as const)
          : ('locked' as const)
  const byLevel = rawByLevel.map((item) => ({
    ...item,
    status: statusFor('level', item.id, item.completion),
  }))
  const byTrack = rawByTrack.map((item) => ({
    ...item,
    status: statusFor('track', item.id, item.completion),
  }))

  return {
    curriculumCompletion,
    reviewMastery,
    byTrack,
    byLevel,
    weakConcepts,
    weakTracks: byTrack
      .filter(
        ({ mastery }) =>
          mastery !== undefined && mastery < learningRules.weakMasteryThreshold,
      )
      .map(({ id }) => id),
    recentActivity: buildRecentActivity(scored),
    streak: calculateStreak(learnerState.attempts, now, timeZone),
    weeklyGoal: calculateWeeklyGoal(
      learnerState.attempts,
      now,
      learnerState.weeklyGoal,
      timeZone,
    ),
    unlocks,
    bossReviewStatus: unlocks.includes('mission:boss-review')
      ? 'available'
      : 'locked',
  }
}

export function synchroniseLearnerProgress(
  learnerState: LearnerState,
  exercises: Exercise[],
  curriculum: Curriculum,
  now = new Date(),
  timeZone?: string,
): LearnerState {
  const progress = deriveLearningProgress(
    learnerState,
    exercises,
    curriculum,
    now,
    timeZone,
  )
  const byTrack = Object.fromEntries(
    progress.byTrack.flatMap(({ id, mastery }) =>
      mastery === undefined ? [] : [[id, mastery]],
    ),
  )
  const byLevel = Object.fromEntries(
    progress.byLevel.flatMap(({ id, mastery }) =>
      mastery === undefined ? [] : [[id, mastery]],
    ),
  )
  const byConcept: Record<string, number | undefined> = {}
  for (const { attempt, masteryScore } of scoredAttempts(
    learnerState.attempts,
    exercises,
  )) {
    for (const concept of attempt.evaluation?.conceptsFound ?? []) {
      byConcept[concept] = masteryScore
    }
    for (const concept of attempt.evaluation?.conceptsMissed ?? []) {
      byConcept[concept] = Math.min(40, masteryScore)
    }
  }

  return {
    ...learnerState,
    curriculumCompletion: progress.curriculumCompletion,
    mastery: { overall: progress.reviewMastery, byTrack, byLevel, byConcept },
    weakConcepts: progress.weakConcepts,
    streak: progress.streak,
    weeklyGoal: progress.weeklyGoal,
    unlocks: progress.unlocks,
    updatedAt: now.toISOString(),
  }
}
