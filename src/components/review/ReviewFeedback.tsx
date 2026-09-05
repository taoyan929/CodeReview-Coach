import { Link } from 'react-router-dom'

import type { Exercise } from '../../domain/exercise/types'
import type { ExerciseAttempt } from '../../domain/learning/types'
import { FindingList } from './FindingList'

interface ReviewFeedbackProps {
  exercise: Exercise
  attempt: ExerciseAttempt
  onRetry: () => void
}

export function ReviewFeedback({
  exercise,
  attempt,
  onRetry,
}: ReviewFeedbackProps) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
      <p className="eyebrow">Review submitted</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
        Your review is ready for coaching.
      </h1>
      <p className="mt-5 max-w-2xl leading-7 text-paper/65">
        You submitted {attempt.findings.length}{' '}
        {attempt.findings.length === 1 ? 'finding' : 'findings'} for “
        {exercise.title}”. The reference answer remains hidden until the
        deterministic coaching step is introduced in TAO-21.
      </p>

      <section className="mt-10 rounded-3xl border border-mint/20 bg-mint/[0.07] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">First-feedback state</p>
            <h2 className="mt-2 text-xl font-semibold">Submission captured</h2>
          </div>
          <span className="font-mono text-xs text-mint">
            {attempt.hintsUsed.length} hints used
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-paper/60">
          Your findings are saved locally. Scoring, strong/partial finding
          classification, and missed-concept coaching belong to the next
          milestone.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold tracking-[0.14em] uppercase">
          Your review
        </h2>
        <div className="mt-4">
          <FindingList findings={attempt.findings} />
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          className="rounded-full bg-mint px-6 py-3 font-semibold text-ink transition hover:bg-[#92f0c3]"
          onClick={onRetry}
          type="button"
        >
          Retry exercise
        </button>
        <Link
          className="rounded-full border border-white/15 px-6 py-3 font-semibold text-paper transition hover:border-white/30 hover:bg-white/[0.04]"
          to="/"
        >
          Back to mission
        </Link>
      </div>
    </div>
  )
}
