import { useState } from 'react'
import { Link, useLoaderData, useRevalidator } from 'react-router-dom'

import { ProgressMetric } from '../components/ProgressMetric'
import type { Exercise } from '../domain/exercise/types'
import type { LearnerState } from '../domain/learning/types'
import { learnerStateRepository } from '../repositories'
import type {
  LearningProgressSnapshot,
  ProgressStatus,
} from '../services/deriveLearningProgress'
import { formatLabel } from '../utils/formatLabel'

interface DashboardLoaderData {
  exercises: Exercise[]
  learnerState: LearnerState
  progress: LearningProgressSnapshot
}

const statusLabels: Record<ProgressStatus, string> = {
  locked: 'Locked',
  available: 'Available',
  'in-progress': 'In progress',
  complete: 'Complete',
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
        className="h-full rounded-full bg-mint transition-[width]"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDays(value: number) {
  return `${value} ${value === 1 ? 'day' : 'days'}`
}

export function DashboardPage() {
  const { exercises, learnerState, progress } =
    useLoaderData() as DashboardLoaderData
  const revalidator = useRevalidator()
  const [isConfirmingReset, setIsConfirmingReset] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const missionExercise = learnerState.dailyMission?.exerciseIds
    .filter(
      (id) => !learnerState.dailyMission?.completedExerciseIds.includes(id),
    )
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .find((exercise): exercise is Exercise => Boolean(exercise))
  const fallbackExercise =
    exercises.find(
      ({ id }) => !learnerState.completedExerciseIds.includes(id),
    ) ?? exercises[0]
  const nextExercise = missionExercise ?? fallbackExercise
  const hasIncompleteFallback = Boolean(
    fallbackExercise &&
    !learnerState.completedExerciseIds.includes(fallbackExercise.id),
  )
  const missionCompleted =
    learnerState.dailyMission?.completedExerciseIds.length ?? 0
  const missionTotal = learnerState.dailyMission?.exerciseIds.length ?? 0
  const missionProgress = missionTotal
    ? Math.round((missionCompleted / missionTotal) * 100)
    : progress.curriculumCompletion === 100
      ? 100
      : 0
  const missionHeadline = missionTotal
    ? `${missionCompleted}/${missionTotal} reviews complete`
    : progress.curriculumCompletion === 100
      ? 'All available work complete'
      : 'No mission scheduled'
  const remainingMissionMinutes = missionTotal
    ? Math.round(
        ((missionTotal - missionCompleted) / missionTotal) *
          (learnerState.dailyMission?.estimatedMinutes ?? 0),
      )
    : 0
  const weeklyProgress = Math.min(
    100,
    Math.round(
      (progress.weeklyGoal.completedExercises /
        progress.weeklyGoal.targetExercises) *
        100,
    ),
  )

  async function resetProgress() {
    if (!isConfirmingReset) {
      setIsConfirmingReset(true)
      return
    }

    setIsResetting(true)
    await learnerStateRepository.reset()
    setIsConfirmingReset(false)
    setIsResetting(false)
    await revalidator.revalidate()
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-16">
      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="eyebrow">Today’s mission</p>
          <h1 className="mt-5 max-w-3xl text-5xl leading-[0.98] font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Build judgement, one review at a time.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-paper/65">
            Completion shows how far you have travelled. Mastery shows how
            independently and accurately you are reviewing code.
          </p>

          {nextExercise ? (
            <Link
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-mint px-6 py-3.5 font-semibold text-ink transition hover:bg-[#92f0c3] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint"
              to={`/challenge/${nextExercise.id}`}
            >
              {missionExercise
                ? 'Continue today’s mission'
                : hasIncompleteFallback
                  ? 'Start next challenge'
                  : 'Review again'}
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <p className="mt-10 text-amber-300">
              No validated exercises are available yet.
            </p>
          )}
        </div>

        <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="eyebrow">Learning state</p>
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
        </aside>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="eyebrow">Daily mission</p>
              <h2 className="mt-3 text-2xl font-semibold">{missionHeadline}</h2>
            </div>
            <span className="font-mono text-sm text-mint">
              {remainingMissionMinutes} min left
            </span>
          </div>
          <div className="mt-6">
            <ProgressBar value={missionProgress} />
          </div>
          <p className="mt-4 text-sm leading-6 text-paper/50">
            {missionProgress === 100
              ? 'Mission complete. The next set will be prepared from your learning history.'
              : 'Finish the review and code-fix steps to complete a mission item.'}
          </p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="eyebrow">Weekly goal</p>
              <h2 className="mt-3 text-2xl font-semibold">
                {progress.weeklyGoal.completedExercises}/
                {progress.weeklyGoal.targetExercises} completed
              </h2>
            </div>
            <span className="font-mono text-sm text-paper/45">
              Week of {progress.weeklyGoal.weekStart}
            </span>
          </div>
          <div className="mt-6">
            <ProgressBar value={weeklyProgress} />
          </div>
          <p className="mt-4 text-sm leading-6 text-paper/50">
            Each completed fix counts toward the weekly goal. Retry attempts
            remain visible in your activity history.
          </p>
        </article>
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Track progress</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
              Coverage and mastery stay separate.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-paper/45">
            Locked tracks are part of the planned MVP curriculum and will open
            as validated exercises are added.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {progress.byTrack.map((track) => (
            <article
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
              key={track.id}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{formatLabel(track.id)}</h3>
                <span
                  className={`font-mono text-[9px] uppercase ${
                    track.status === 'locked' ? 'text-paper/30' : 'text-mint'
                  }`}
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
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <p className="eyebrow">Learning path</p>
          <div className="mt-6 space-y-3">
            {progress.byLevel.map((level, index) => (
              <div
                className="flex items-center gap-4 rounded-2xl border border-white/10 p-4"
                key={level.id}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-mono text-xs text-mint">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{formatLabel(level.id)}</h3>
                    <span className="font-mono text-[10px] text-paper/40 uppercase">
                      {statusLabels[level.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-paper/45">
                    {level.completedExercises}/{level.totalExercises} complete ·{' '}
                    {level.mastery === undefined
                      ? 'mastery pending'
                      : `${level.mastery}% mastery`}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-white/10 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-paper/30">
                ◆
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">Full-Stack Boss Review</h3>
                  <span className="font-mono text-[10px] text-paper/35 uppercase">
                    {statusLabels[progress.bossReviewStatus]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-paper/40">
                  Unlocks after sufficient curriculum coverage and mastery.
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <p className="eyebrow">Focus areas</p>
          {progress.weakConcepts.length > 0 ||
          progress.weakTracks.length > 0 ? (
            <div className="mt-6 space-y-5">
              {progress.weakConcepts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold">Weak concepts</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {progress.weakConcepts.map((item) => (
                      <span
                        className="rounded-full border border-amber-200/20 bg-amber-200/[0.06] px-3 py-1.5 text-xs text-amber-100/80"
                        key={item.concept}
                      >
                        {formatLabel(item.concept)} · missed {item.missCount}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {progress.weakTracks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold">Weak tracks</h3>
                  <p className="mt-2 text-sm leading-6 text-paper/55">
                    {progress.weakTracks.map(formatLabel).join(', ')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-mint/15 bg-mint/[0.05] p-5">
              <p className="font-semibold text-mint">No weak areas yet</p>
              <p className="mt-2 text-sm leading-6 text-paper/50">
                Submit more reviews to build a reliable mastery signal.
              </p>
            </div>
          )}
        </article>
      </section>

      <section className="mt-16 border-t border-white/10 pt-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">Recent activity</p>
            {progress.recentActivity.length > 0 ? (
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
                        {activity.completed
                          ? 'Fix complete'
                          : 'Review submitted'}
                      </p>
                    </div>
                    <div className="flex gap-5 font-mono text-xs text-paper/55">
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
          </div>

          <div className="lg:text-right">
            <p className="text-xs leading-5 text-paper/35">
              Progress is stored locally in this browser.
            </p>
            <button
              className={`mt-3 rounded-full border px-4 py-2 text-sm transition disabled:cursor-wait disabled:opacity-50 ${
                isConfirmingReset
                  ? 'border-red-300/40 bg-red-300/10 text-red-200'
                  : 'border-white/10 text-paper/50 hover:border-white/25 hover:text-paper'
              }`}
              disabled={isResetting}
              onBlur={() => setIsConfirmingReset(false)}
              onClick={resetProgress}
              type="button"
            >
              {isResetting
                ? 'Resetting…'
                : isConfirmingReset
                  ? 'Confirm reset'
                  : 'Reset progress'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
