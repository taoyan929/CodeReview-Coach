import { useMemo, useState } from 'react'
import { Link, useLoaderData } from 'react-router-dom'

import { CodeReviewPanel } from '../components/review/CodeReviewPanel'
import {
  FindingComposer,
  type FindingDraft,
} from '../components/review/FindingComposer'
import { FindingList } from '../components/review/FindingList'
import { ReviewFeedback } from '../components/review/ReviewFeedback'
import type { CodeLocation, Exercise } from '../domain/exercise/types'
import type {
  ExerciseAttempt,
  HintUsage,
  LearnerFinding,
} from '../domain/learning/types'
import { learnerStateRepository } from '../repositories'
import { submitReviewAttempt } from '../services/submitReviewAttempt'
import { formatLabel } from '../utils/formatLabel'

interface ChallengeLoaderData {
  exercise: Exercise
}

export function ChallengePage() {
  const { exercise } = useLoaderData() as ChallengeLoaderData
  const [activeFileId, setActiveFileId] = useState(exercise.files[0]?.id ?? '')
  const [selection, setSelection] = useState<CodeLocation>()
  const [findings, setFindings] = useState<LearnerFinding[]>([])
  const [hintsUsed, setHintsUsed] = useState<HintUsage[]>([])
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString())
  const [submittedAttempt, setSubmittedAttempt] = useState<ExerciseAttempt>()
  const [submitError, setSubmitError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeFile = exercise.files.find(({ id }) => id === activeFileId)
  const progressiveHints = useMemo(() => {
    const findingHints = exercise.expectedFindings.flatMap(({ hints }) => hints)
    return findingHints.length > 0 ? findingHints : exercise.hints
  }, [exercise])
  const revealedHints = progressiveHints.slice(0, hintsUsed.length)
  const nextHint = progressiveHints[hintsUsed.length]

  if (!activeFile) {
    throw new Error('Validated exercise has no code file')
  }

  function addFinding(draft: FindingDraft) {
    if (!selection) {
      return
    }

    setFindings((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        fileId: activeFileId,
        location: selection,
        ...draft,
        createdAt: new Date().toISOString(),
      },
    ])
    setSelection(undefined)
    setSubmitError(undefined)
  }

  function requestHint() {
    if (!nextHint) {
      return
    }

    setHintsUsed((current) => [
      ...current,
      {
        expectedFindingId: exercise.expectedFindings[0]?.id,
        level: nextHint.level,
        usedAt: new Date().toISOString(),
      },
    ])
  }

  async function finishReview() {
    setSubmitError(undefined)
    setIsSubmitting(true)

    try {
      const attempt = await submitReviewAttempt(
        {
          exercise,
          startedAt,
          findings,
          hintsUsed,
        },
        learnerStateRepository,
      )
      setSubmittedAttempt(attempt)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Unable to submit review.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function retryExercise(nextHints = hintsUsed) {
    setActiveFileId(exercise.files[0]?.id ?? '')
    setSelection(undefined)
    setFindings([])
    setHintsUsed(nextHints)
    setStartedAt(new Date().toISOString())
    setSubmittedAttempt(undefined)
    setSubmitError(undefined)
  }

  function retryWithHint() {
    if (!nextHint) {
      return
    }

    retryExercise([
      ...hintsUsed,
      {
        expectedFindingId: exercise.expectedFindings[0]?.id,
        level: nextHint.level,
        usedAt: new Date().toISOString(),
      },
    ])
  }

  if (submittedAttempt) {
    return (
      <ReviewFeedback
        attempt={submittedAttempt}
        canRequestHint={Boolean(nextHint)}
        exercise={exercise}
        onRetry={retryExercise}
        onRetryWithHint={retryWithHint}
      />
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          className="text-sm text-paper/55 underline-offset-4 hover:text-paper hover:underline"
          to="/"
        >
          ← Back to mission
        </Link>
        <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase text-paper/55">
          <span className="rounded-full border border-white/10 px-3 py-1.5">
            {formatLabel(exercise.track)}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5">
            {formatLabel(exercise.level)}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5">
            Difficulty {exercise.difficulty}/5
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5">
            {exercise.estimatedMinutes} min
          </span>
        </div>
      </div>

      <header className="mt-8 border-b border-white/10 pb-8">
        <p className="eyebrow">{formatLabel(exercise.missionType)}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
          {exercise.title}
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-paper/65">
          {exercise.requirement.description}
        </p>
      </header>

      <div className="mt-8 grid min-w-0 gap-6 xl:grid-cols-[0.68fr_1.35fr_0.82fr]">
        <aside className="min-w-0 space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="eyebrow">Requirement</p>
            <h2 className="mt-3 text-lg font-semibold">
              {exercise.requirement.summary}
            </h2>

            <h3 className="mt-7 text-xs font-semibold tracking-[0.12em] uppercase">
              Acceptance criteria
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-paper/60">
              {exercise.requirement.acceptanceCriteria?.map((criterion) => (
                <li className="flex gap-3" key={criterion}>
                  <span className="text-mint" aria-hidden="true">
                    □
                  </span>
                  {criterion}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">Progressive hints</p>
              <span className="font-mono text-[10px] text-paper/35">
                {hintsUsed.length}/{progressiveHints.length}
              </span>
            </div>
            {revealedHints.length > 0 ? (
              <ol className="mt-4 space-y-3">
                {revealedHints.map((hint, index) => (
                  <li
                    className="rounded-xl border border-amber-200/15 bg-amber-200/[0.06] p-3 text-sm leading-6 text-amber-100/75"
                    key={`${hint.level}-${hint.text}`}
                  >
                    <span className="font-mono text-[10px] text-amber-200/60 uppercase">
                      Hint {index + 1}
                    </span>
                    <p className="mt-1">{hint.text}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm leading-6 text-paper/45">
                Try reviewing independently first. Hints guide your attention
                without revealing the reference answer.
              </p>
            )}
            <button
              className="mt-5 w-full rounded-full border border-amber-200/20 px-4 py-2.5 text-sm font-medium text-amber-100/80 transition enabled:hover:border-amber-200/40 enabled:hover:bg-amber-200/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!nextHint}
              onClick={requestHint}
              type="button"
            >
              {nextHint ? `Get hint ${hintsUsed.length + 1}` : 'All hints used'}
            </button>
          </section>
        </aside>

        <main className="min-w-0">
          <div
            aria-label="Exercise files"
            className="mb-3 flex gap-2 overflow-x-auto"
            role="tablist"
          >
            {exercise.files.map((file) => (
              <button
                aria-selected={file.id === activeFile.id}
                className={`shrink-0 rounded-full px-4 py-2 font-mono text-xs transition ${
                  file.id === activeFile.id
                    ? 'bg-paper text-ink'
                    : 'border border-white/10 text-paper/50 hover:text-paper'
                }`}
                key={file.id}
                onClick={() => {
                  setActiveFileId(file.id)
                  setSelection(undefined)
                }}
                role="tab"
                type="button"
              >
                {file.path}
              </button>
            ))}
          </div>
          <CodeReviewPanel
            file={activeFile}
            findings={findings}
            onSelect={setSelection}
            selection={selection}
          />
          <p className="mt-3 text-xs leading-5 text-paper/35">
            Select one line, then another to extend the review range.
            Double-click any code line to clear the selection. Added comments
            appear as markers beside their starting line.
          </p>
        </main>

        <aside className="min-w-0 space-y-6">
          <FindingComposer onAdd={addFinding} selection={selection} />

          <section>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold tracking-[0.14em] uppercase">
                Review findings
              </h2>
              <span className="font-mono text-xs text-paper/40">
                {findings.length} added
              </span>
            </div>
            <div className="mt-4">
              <FindingList
                findings={findings}
                onRemove={(id) =>
                  setFindings((current) =>
                    current.filter((finding) => finding.id !== id),
                  )
                }
              />
            </div>

            {submitError && (
              <p className="mt-4 text-sm text-red-300" role="alert">
                {submitError}
              </p>
            )}
            <button
              className="mt-5 w-full rounded-full bg-mint px-5 py-3.5 font-semibold text-ink transition enabled:hover:bg-[#92f0c3] disabled:cursor-not-allowed disabled:opacity-35"
              disabled={findings.length === 0 || isSubmitting}
              onClick={finishReview}
              type="button"
            >
              {isSubmitting
                ? 'Submitting…'
                : `Finish review · ${findings.length}`}
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}
