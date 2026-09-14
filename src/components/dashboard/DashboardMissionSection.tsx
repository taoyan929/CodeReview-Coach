import { Link } from 'react-router-dom'

import type { Exercise } from '../../domain/exercise/types'
import type { LearnerState, Recommendation } from '../../domain/learning/types'
import { formatLabel } from '../../utils/formatLabel'

interface MissionItem {
  exercise: Exercise
  recommendation: Recommendation
}

interface DashboardMissionSectionProps {
  learnerState: LearnerState
  missionItems: MissionItem[]
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div
      aria-label={`${value}% complete`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={value}
      className="h-1.5 overflow-hidden rounded-full bg-white/10"
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-mint"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export function DashboardMissionSection({
  learnerState,
  missionItems,
}: DashboardMissionSectionProps) {
  const mission = learnerState.dailyMission
  const completed = mission?.completedExerciseIds.length ?? 0
  const total = mission?.exerciseIds.length ?? 0
  const progress = total ? Math.round((completed / total) * 100) : 0
  const remainingMinutes = missionItems.reduce(
    (sum, { exercise }) =>
      mission?.completedExerciseIds.includes(exercise.id)
        ? sum
        : sum + exercise.estimatedMinutes,
    0,
  )
  const isComplete = total > 0 && completed === total

  return (
    <section aria-labelledby="daily-mission-heading" className="mt-16">
      <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="eyebrow">Daily mission</p>
            <h2
              className="mt-3 text-2xl font-semibold"
              id="daily-mission-heading"
            >
              {total
                ? `${completed}/${total} reviews complete`
                : 'No mission scheduled'}
            </h2>
          </div>
          <span className="font-mono text-sm text-mint">
            {remainingMinutes} min left
          </span>
        </div>
        <div className="mt-6">
          <ProgressBar value={isComplete ? 100 : progress} />
        </div>

        {isComplete && (
          <div
            className="mt-5 rounded-2xl border border-mint/20 bg-mint/[0.06] p-5"
            role="status"
          >
            <p className="font-semibold text-mint">
              Today’s mission is complete.
            </p>
            <p className="mt-2 text-sm leading-6 text-paper/55">
              Your completion, mastery and streak are updated. A new mission
              will be prepared on your next local calendar day.
            </p>
          </div>
        )}

        {missionItems.length > 0 ? (
          <ol className="mt-5 grid gap-3 lg:grid-cols-3">
            {missionItems.map(({ exercise, recommendation }, index) => {
              const itemComplete = Boolean(
                mission?.completedExerciseIds.includes(exercise.id),
              )
              return (
                <li
                  className="rounded-2xl border border-white/10 bg-black/10 p-4"
                  key={exercise.id}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 font-mono text-[10px] ${itemComplete ? 'text-mint' : 'text-paper/35'}`}
                    >
                      {itemComplete ? 'DONE' : `0${index + 1}`}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        className="font-semibold transition hover:text-mint"
                        to={`/challenge/${exercise.id}`}
                      >
                        {exercise.title}
                      </Link>
                      <p className="mt-1 text-xs leading-5 text-paper/50">
                        {recommendation.reasonText}
                      </p>
                      <p className="mt-3 font-mono text-[9px] leading-5 text-paper/35 uppercase">
                        {formatLabel(exercise.missionType)} ·{' '}
                        {formatLabel(exercise.level)} ·{' '}
                        {formatLabel(exercise.track)}
                        {exercise.topics[0]
                          ? ` · ${formatLabel(exercise.topics[0])}`
                          : ''}{' '}
                        · {exercise.estimatedMinutes} min
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="mt-4 text-sm leading-6 text-paper/50">
            No eligible mission items are available yet.
          </p>
        )}
      </article>
    </section>
  )
}
