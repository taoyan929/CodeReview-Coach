import type { ScoredAttempt, RecentLearningActivity } from './types'

export function buildRecentActivity(
  scored: ScoredAttempt[],
): RecentLearningActivity[] {
  return scored
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
    }))
}
