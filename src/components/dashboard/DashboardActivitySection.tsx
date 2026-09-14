import type { LearningProgressSnapshot } from '../../services/deriveLearningProgress'
import { formatLabel } from '../../utils/formatLabel'

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function DashboardActivitySection({
  progress,
}: {
  progress: LearningProgressSnapshot
}) {
  return (
    <section
      aria-labelledby="activity-heading"
      className="mt-16 border-t border-white/10 pt-10"
    >
      <p className="eyebrow">Recent activity</p>
      <h2 className="sr-only" id="activity-heading">
        Recent learning activity
      </h2>
      {progress.recentActivity.length ? (
        <ol className="mt-5 divide-y divide-white/10">
          {progress.recentActivity.map((activity) => (
            <li
              className="flex flex-wrap items-center justify-between gap-4 py-4"
              key={activity.attemptId}
            >
              <div>
                <p className="font-semibold">{activity.exerciseTitle}</p>
                <p className="mt-1 text-xs text-paper/40">
                  {formatActivityDate(activity.occurredAt)} ·{' '}
                  {formatLabel(activity.track)} ·{' '}
                  {activity.completed ? 'Fix complete' : 'Review submitted'}
                </p>
              </div>
              <div className="flex flex-wrap gap-5 font-mono text-xs text-paper/55">
                <span>{activity.technicalScore}% technical</span>
                <span>{activity.masteryScore}% mastery</span>
                <span>{activity.hintsUsed} hints</span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 text-sm text-paper/45">
          Your submitted reviews will appear here.
        </p>
      )}
    </section>
  )
}
