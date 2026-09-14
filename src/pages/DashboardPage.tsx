import { Link, useLoaderData } from 'react-router-dom'

import { DashboardActivitySection } from '../components/dashboard/DashboardActivitySection'
import { DashboardDataControls } from '../components/dashboard/DashboardDataControls'
import { DashboardLearningPathSection } from '../components/dashboard/DashboardLearningPathSection'
import { DashboardMissionSection } from '../components/dashboard/DashboardMissionSection'
import { DashboardProgressSection } from '../components/dashboard/DashboardProgressSection'
import type { Exercise } from '../domain/exercise/types'
import type { LearnerState } from '../domain/learning/types'
import type { LearningProgressSnapshot } from '../services/deriveLearningProgress'

interface DashboardLoaderData {
  exercises: Exercise[]
  learnerState: LearnerState
  progress: LearningProgressSnapshot
}

export function DashboardPage() {
  const { exercises, learnerState, progress } =
    useLoaderData() as DashboardLoaderData
  const missionItems = (
    learnerState.dailyMission?.recommendations ?? []
  ).flatMap((recommendation) => {
    const exercise = exercises.find(
      ({ id }) => id === recommendation.exerciseId,
    )
    return exercise ? [{ exercise, recommendation }] : []
  })
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10 lg:py-16">
      <header className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
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
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-mint px-6 py-3.5 font-semibold text-ink transition hover:bg-[#92f0c3]"
              to={`/challenge/${nextExercise.id}`}
            >
              {missionExercise
                ? 'Continue today’s mission'
                : 'Start next challenge'}
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <p className="mt-10 text-amber-300">
              No validated exercises are available yet.
            </p>
          )}
        </div>
        <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="eyebrow">At a glance</p>
          <p className="mt-5 text-4xl font-semibold text-mint">
            {progress.curriculumCompletion}%
          </p>
          <p className="mt-2 text-sm text-paper/55">curriculum complete</p>
          <p className="mt-7 text-sm leading-6 text-paper/50">
            Your private learner state stays in this browser until you export or
            reset it.
          </p>
        </aside>
      </header>

      <DashboardMissionSection
        learnerState={learnerState}
        missionItems={missionItems}
      />
      <DashboardProgressSection
        learnerState={learnerState}
        progress={progress}
      />
      <DashboardLearningPathSection progress={progress} />
      <DashboardActivitySection progress={progress} />
      <DashboardDataControls learnerState={learnerState} />
    </div>
  )
}
