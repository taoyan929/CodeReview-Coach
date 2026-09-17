import { learningRules } from '../../config/learningRules'
import type { Exercise, Track } from '../../domain/exercise/types'
import type {
  ExerciseAttempt,
  WeakConceptState,
} from '../../domain/learning/types'
import type { ProgressStatus, ScoredAttempt } from './types'

export function round(value: number) {
  return Math.round(value)
}
export function average(values: number[]) {
  return values.length
    ? round(values.reduce((total, value) => total + value, 0) / values.length)
    : undefined
}

export function calculateAttemptMastery(attempt: ExerciseAttempt) {
  if (!attempt.evaluation) return undefined
  const answerModeMultiplier =
    attempt.answerMode === 'language-assist'
      ? learningRules.answerModes.languageAssistMasteryMultiplier
      : 1
  return Math.max(
    0,
    Math.min(
      100,
      round(
        (attempt.evaluation.technicalScore * 0.75 +
          (1 - attempt.evaluation.assistanceLevel) * 10 +
          (attempt.fixSubmission && attempt.completedAt ? 15 : 0)) *
          answerModeMultiplier,
      ),
    ),
  )
}

export function scoredAttempts(
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

export function trackMatches(exercise: Exercise, track: Track) {
  return exercise.track === track || exercise.secondaryTracks?.includes(track)
}
export function calculateCompletion(
  exercises: Exercise[],
  completedIds: Set<string>,
) {
  const total = exercises.reduce(
    (sum, exercise) => sum + exercise.curriculumWeight,
    0,
  )
  const completed = exercises.reduce(
    (sum, exercise) =>
      completedIds.has(exercise.id) ? sum + exercise.curriculumWeight : sum,
    0,
  )
  return total ? round((completed / total) * 100) : 0
}
export function progressStatus(
  total: number,
  completion: number,
): ProgressStatus {
  if (!total) return 'locked'
  if (completion === 100) return 'complete'
  if (completion > 0) return 'in-progress'
  return 'available'
}

export function buildWeakConcepts(scored: ScoredAttempt[]): WeakConceptState[] {
  const signals = new Map<
    string,
    { scores: number[]; missCount: number; lastPractisedAt?: string }
  >()
  for (const { attempt, masteryScore } of scored) {
    const occurredAt = attempt.completedAt ?? attempt.submittedAt
    const found = new Set(attempt.evaluation?.conceptsFound ?? [])
    const missed = new Set(attempt.evaluation?.conceptsMissed ?? [])
    for (const concept of new Set([...found, ...missed])) {
      const signal = signals.get(concept) ?? { scores: [], missCount: 0 }
      signal.scores.push(
        missed.has(concept) ? Math.min(40, masteryScore) : masteryScore,
      )
      signal.missCount += missed.has(concept) ? 1 : 0
      if (
        occurredAt &&
        (!signal.lastPractisedAt || occurredAt > signal.lastPractisedAt)
      )
        signal.lastPractisedAt = occurredAt
      signals.set(concept, signal)
    }
  }
  return [...signals.entries()]
    .flatMap(([concept, signal]) => {
      const mastery = average(signal.scores) ?? 0
      if (!signal.missCount || mastery >= learningRules.weakMasteryThreshold)
        return []
      return [
        {
          concept,
          missCount: signal.missCount,
          priority: round(
            learningRules.weakMasteryThreshold -
              mastery +
              signal.missCount * 10,
          ),
          lastPractisedAt: signal.lastPractisedAt,
        },
      ]
    })
    .sort((left, right) => right.priority - left.priority)
}
