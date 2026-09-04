import { Link, useLoaderData } from 'react-router-dom'

import { ProgressMetric } from '../components/ProgressMetric'
import type { Exercise } from '../domain/exercise/types'
import type { LearnerState } from '../domain/learning/types'

interface DashboardLoaderData {
  exercises: Exercise[]
  learnerState: LearnerState
}

export function DashboardPage() {
  const { exercises, learnerState } = useLoaderData() as DashboardLoaderData
  const nextExercise = exercises[0]

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 lg:px-10 lg:py-20">
      <section className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <p className="eyebrow">Today’s mission</p>
          <h1 className="mt-5 max-w-3xl text-5xl leading-[0.98] font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Learn to review code before you trust it.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-paper/65">
            Read the requirement, find the risk, explain your reasoning, and fix
            the code. Feedback comes after your own review.
          </p>

          {nextExercise ? (
            <Link
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-mint px-6 py-3.5 font-semibold text-ink transition hover:bg-[#92f0c3] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint"
              to={`/challenge/${nextExercise.id}`}
            >
              Start first challenge
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
          <dl className="mt-7 grid gap-6">
            <ProgressMetric
              label="Curriculum completion"
              value={`${learnerState.curriculumCompletion}%`}
            />
            <ProgressMetric
              label="Review mastery"
              value="Not enough data"
              muted
            />
            <ProgressMetric
              label="Current streak"
              value={`${learnerState.streak.currentDays} days`}
            />
          </dl>
          <p className="mt-7 border-t border-white/10 pt-5 font-mono text-xs text-paper/45">
            Today · {learnerState.dailyMission?.estimatedMinutes ?? 0} minutes
            planned
          </p>
        </aside>
      </section>

      {nextExercise && (
        <section className="mt-20 border-t border-white/10 pt-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Golden exercise · 01</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
                {nextExercise.title}
              </h2>
            </div>
            <p className="font-mono text-sm text-paper/45">
              {nextExercise.estimatedMinutes} min · {nextExercise.track} · level{' '}
              {nextExercise.difficulty}
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
