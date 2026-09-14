import { ProgressMetric } from '../ProgressMetric'
import type { LearnerState } from '../../domain/learning/types'
import type {
  LearningProgressSnapshot,
  ProgressStatus,
} from '../../services/deriveLearningProgress'
import { formatLabel } from '../../utils/formatLabel'

const statusLabels: Record<ProgressStatus, string> = {
  locked: 'Locked',
  available: 'Available',
  'in-progress': 'In progress',
  complete: 'Complete',
}

function formatDays(value: number) {
  return `${value} ${value === 1 ? 'day' : 'days'}`
}

export function DashboardProgressSection({
  learnerState,
  progress,
}: {
  learnerState: LearnerState
  progress: LearningProgressSnapshot
}) {
  const weeklyProgress = Math.min(
    100,
    Math.round(
      (progress.weeklyGoal.completedExercises /
        progress.weeklyGoal.targetExercises) *
        100,
    ),
  )
  return (
    <section aria-labelledby="progress-heading" className="mt-16 space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="eyebrow">Learning state</p>
          <h2 className="sr-only" id="progress-heading">
            Learning progress
          </h2>
          <dl className="mt-7 grid grid-cols-2 gap-6">
            <ProgressMetric
              label="Curriculum completion"
              value={`${progress.curriculumCompletion}%`}
            />
            <ProgressMetric
              label="Review mastery"
              muted={progress.reviewMastery === undefined}
              value={
                progress.reviewMastery === undefined
                  ? 'Not enough data'
                  : `${progress.reviewMastery}%`
              }
            />
            <ProgressMetric
              label="Current streak"
              value={formatDays(progress.streak.currentDays)}
            />
            <ProgressMetric
              label="Longest streak"
              value={formatDays(progress.streak.longestDays)}
            />
          </dl>
          <p className="mt-7 border-t border-white/10 pt-5 font-mono text-xs text-paper/45">
            Updated from {learnerState.attempts.length} review{' '}
            {learnerState.attempts.length === 1 ? 'attempt' : 'attempts'}
          </p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <p className="eyebrow">Weekly goal</p>
          <h2 className="mt-3 text-2xl font-semibold">
            {progress.weeklyGoal.completedExercises}/
            {progress.weeklyGoal.targetExercises} completed
          </h2>
          <p className="mt-2 font-mono text-xs text-paper/45">
            Week of {progress.weeklyGoal.weekStart}
          </p>
          <div
            className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="Weekly goal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={weeklyProgress}
          >
            <div
              className="h-full rounded-full bg-mint"
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-paper/50">
            Each completed fix counts toward the weekly goal.
          </p>
        </article>
      </div>
      <div>
        <p className="eyebrow">Track progress</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {progress.byTrack.map((track) => (
            <article
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
              key={track.id}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{formatLabel(track.id)}</h3>
                <span
                  className={`font-mono text-[9px] uppercase ${track.status === 'locked' ? 'text-paper/30' : 'text-mint'}`}
                >
                  {statusLabels[track.status]}
                </span>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-[11px] text-paper/40">Completion</dt>
                  <dd className="mt-1 font-mono text-lg">
                    {track.completion}%
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-paper/40">Mastery</dt>
                  <dd className="mt-1 font-mono text-lg">
                    {track.mastery === undefined ? '—' : `${track.mastery}%`}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
