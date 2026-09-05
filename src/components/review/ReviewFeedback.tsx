import { useState } from 'react'
import { Link } from 'react-router-dom'

import type { Exercise } from '../../domain/exercise/types'
import type {
  ExerciseAttempt,
  FindingEvaluation,
} from '../../domain/learning/types'
import { formatLabel } from '../../utils/formatLabel'

interface ReviewFeedbackProps {
  exercise: Exercise
  attempt: ExerciseAttempt
  canRequestHint: boolean
  onRetry: () => void
  onRetryWithHint: () => void
}

const dimensionLabels = {
  detection: 'Detection',
  category: 'Category',
  diagnosis: 'Diagnosis',
  reasoning: 'Reasoning',
  fix: 'Suggested fix',
} as const

function statusLabel(status: FindingEvaluation['status']) {
  return status === 'strong'
    ? 'Strong finding'
    : status === 'partial'
      ? 'Needs another look'
      : status === 'missed'
        ? 'Missed'
        : 'Not matched'
}

export function ReviewFeedback({
  exercise,
  attempt,
  canRequestHint,
  onRetry,
  onRetryWithHint,
}: ReviewFeedbackProps) {
  const [showFinalFeedback, setShowFinalFeedback] = useState(false)
  const evaluation = attempt.evaluation

  if (!evaluation) {
    throw new Error('Submitted review has no deterministic evaluation')
  }

  const learnerResults = evaluation.findingResults.filter(
    ({ learnerFindingId }) => learnerFindingId,
  )
  const missedResults = evaluation.findingResults.filter(
    ({ status }) => status === 'missed',
  )
  const strongCount = learnerResults.filter(
    ({ status }) => status === 'strong',
  ).length
  const needsWorkCount = learnerResults.length - strongCount

  if (!showFinalFeedback) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
        <p className="eyebrow">First feedback</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Your review has been evaluated.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-paper/65">
          Start with the signal, not the answer. You can retry independently,
          ask for another hint, or reveal the full breakdown when you are ready.
        </p>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <FeedbackMetric
            label="Strong findings"
            value={strongCount}
            tone="mint"
          />
          <FeedbackMetric label="Needs another look" value={needsWorkCount} />
          <FeedbackMetric
            label="More issues may remain"
            value={missedResults.length > 0 ? 'Yes' : 'No'}
          />
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold tracking-[0.14em] uppercase">
            Finding-level feedback
          </h2>
          <ol className="mt-4 space-y-3">
            {attempt.findings.map((finding, index) => {
              const result = learnerResults.find(
                ({ learnerFindingId }) => learnerFindingId === finding.id,
              )
              const strong = result?.status === 'strong'

              return (
                <li
                  className={`rounded-2xl border p-5 ${
                    strong
                      ? 'border-mint/20 bg-mint/[0.06]'
                      : 'border-amber-200/15 bg-amber-200/[0.05]'
                  }`}
                  key={finding.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[10px] text-paper/40 uppercase">
                      Finding {index + 1} · line {finding.location.startLine}
                    </span>
                    <span
                      className={`font-mono text-[10px] uppercase ${
                        strong ? 'text-mint' : 'text-amber-200/75'
                      }`}
                    >
                      {result
                        ? statusLabel(result.status)
                        : 'Needs another look'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-paper/75">
                    {finding.diagnosis}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-paper/45">
                    {strong
                      ? 'The deterministic signals align strongly with an expected issue.'
                      : 'Re-check the selected location, technical concept, consequence, and proposed fix.'}
                  </p>
                </li>
              )
            })}
          </ol>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-mint px-6 py-3 font-semibold text-ink transition hover:bg-[#92f0c3]"
            onClick={onRetry}
            type="button"
          >
            Try again
          </button>
          <button
            className="rounded-full border border-amber-200/25 px-6 py-3 font-semibold text-amber-100/80 transition enabled:hover:bg-amber-200/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!canRequestHint}
            onClick={onRetryWithHint}
            type="button"
          >
            {canRequestHint ? 'Get hint & retry' : 'All hints used'}
          </button>
          <button
            className="rounded-full border border-white/15 px-6 py-3 font-semibold text-paper transition hover:border-white/30 hover:bg-white/[0.04]"
            onClick={() => setShowFinalFeedback(true)}
            type="button"
          >
            Finish & reveal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
      <p className="eyebrow">Final feedback</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
        Review breakdown
      </h1>
      <p className="mt-5 max-w-2xl leading-7 text-paper/65">
        Technical understanding and communication are reported separately.
        Communication quality never lowers the technical score.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <FeedbackMetric
          label="Technical review"
          tone="mint"
          value={`${evaluation.technicalScore}%`}
        />
        <FeedbackMetric
          label="Communication"
          value={`${evaluation.communicationScore ?? 0}%`}
        />
        <FeedbackMetric
          label="Completion"
          value={evaluation.completed ? 'Complete' : 'Fix pending'}
        />
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold tracking-[0.14em] uppercase">
          Issue breakdown
        </h2>
        <div className="mt-5 space-y-5">
          {evaluation.findingResults
            .filter(({ expectedFindingId }) => expectedFindingId)
            .map((result) => {
              const expectedFinding = exercise.expectedFindings.find(
                ({ id }) => id === result.expectedFindingId,
              )
              const learnerFinding = attempt.findings.find(
                ({ id }) => id === result.learnerFindingId,
              )

              if (!expectedFinding) {
                return null
              }

              return (
                <article
                  className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"
                  key={expectedFinding.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="eyebrow">
                      {result.status === 'missed'
                        ? 'Missed finding'
                        : statusLabel(result.status)}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] text-paper/50 uppercase">
                      {formatLabel(expectedFinding.severity)} ·{' '}
                      {formatLabel(expectedFinding.category)}
                    </span>
                  </div>

                  {learnerFinding && (
                    <p className="mt-4 border-l-2 border-white/10 pl-4 text-sm leading-6 text-paper/60">
                      {learnerFinding.diagnosis}
                    </p>
                  )}

                  <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {Object.entries(dimensionLabels).map(([key, label]) => (
                      <div
                        className="rounded-xl border border-white/8 bg-ink/50 p-3"
                        key={key}
                      >
                        <dt className="font-mono text-[9px] text-paper/35 uppercase">
                          {label}
                        </dt>
                        <dd className="mt-1 text-lg font-semibold">
                          {Math.round(
                            result[key as keyof typeof dimensionLabels] * 100,
                          )}
                          %
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <div>
                      <h3 className="text-xs font-semibold tracking-[0.12em] uppercase">
                        Why it matters
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-paper/60">
                        {expectedFinding.explanation}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold tracking-[0.12em] uppercase">
                        Senior review example
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-paper/60">
                        {expectedFinding.referenceComment}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-white/10 p-6">
        <h2 className="text-sm font-semibold tracking-[0.14em] uppercase">
          Concepts
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {evaluation.conceptsFound.map((concept) => (
            <span
              className="rounded-full border border-mint/25 bg-mint/[0.06] px-3 py-1.5 font-mono text-xs text-mint"
              key={concept}
            >
              Found · {formatLabel(concept)}
            </span>
          ))}
          {evaluation.conceptsMissed.map((concept) => (
            <span
              className="rounded-full border border-amber-200/20 bg-amber-200/[0.05] px-3 py-1.5 font-mono text-xs text-amber-100/70"
              key={concept}
            >
              Review · {formatLabel(concept)}
            </span>
          ))}
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

interface FeedbackMetricProps {
  label: string
  value: string | number
  tone?: 'mint'
}

function FeedbackMetric({ label, value, tone }: FeedbackMetricProps) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        tone === 'mint'
          ? 'border-mint/20 bg-mint/[0.06]'
          : 'border-white/10 bg-white/[0.035]'
      }`}
    >
      <p className="font-mono text-[10px] text-paper/40 uppercase">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tone ? 'text-mint' : ''}`}>
        {value}
      </p>
    </div>
  )
}
