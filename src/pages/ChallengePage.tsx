import { useMemo, useReducer } from 'react'
import { Link, useLoaderData } from 'react-router-dom'

import { CodeReviewPanel } from '../components/review/CodeReviewPanel'
import { FixCodeStep } from '../components/review/FixCodeStep'
import {
  FindingComposer,
  type FindingDraft,
} from '../components/review/FindingComposer'
import { FindingList } from '../components/review/FindingList'
import { ReviewFeedback } from '../components/review/ReviewFeedback'
import type { AnswerMode, Curriculum, Exercise } from '../domain/exercise/types'
import type {
  ExerciseAttempt,
  HintUsage,
  LearnerFinding,
} from '../domain/learning/types'
import { learnerStateRepository } from '../repositories'
import { submitReviewAttempt } from '../services/submitReviewAttempt'
import { completeExerciseAttempt } from '../services/completeExerciseAttempt'
import { formatLabel } from '../utils/formatLabel'

interface ChallengeLoaderData {
  exercise: Exercise
  exercises: Exercise[]
  curriculum: Curriculum
  existingAttempt?: ExerciseAttempt
}

type SessionPhase = 'reviewing' | 'feedback' | 'fixing' | 'complete'

interface ReviewSessionState {
  phase: SessionPhase
  answerMode: AnswerMode
  activeFileId: string
  selectedLines: number[]
  findings: LearnerFinding[]
  hintsUsed: HintUsage[]
  startedAt: string
  submittedAttempt?: ExerciseAttempt
  submitError?: string
  isSubmitting: boolean
}

type ReviewSessionAction =
  | { type: 'select-file'; fileId: string }
  | { type: 'set-answer-mode'; answerMode: AnswerMode }
  | { type: 'select-lines'; lines: number[] }
  | { type: 'add-finding'; finding: LearnerFinding }
  | { type: 'remove-finding'; findingId: string }
  | { type: 'use-hint'; hint: HintUsage }
  | { type: 'submit-started' }
  | { type: 'submit-succeeded'; attempt: ExerciseAttempt }
  | { type: 'submit-failed'; message: string }
  | {
      type: 'retry'
      fileId: string
      hintsUsed: HintUsage[]
      startedAt: string
    }
  | { type: 'start-fix' }
  | { type: 'fix-completed'; attempt: ExerciseAttempt }

function reviewSessionReducer(
  state: ReviewSessionState,
  action: ReviewSessionAction,
): ReviewSessionState {
  switch (action.type) {
    case 'select-file':
      return { ...state, activeFileId: action.fileId, selectedLines: [] }
    case 'set-answer-mode':
      return state.findings.length > 0
        ? state
        : { ...state, answerMode: action.answerMode }
    case 'select-lines':
      return { ...state, selectedLines: action.lines }
    case 'add-finding':
      return {
        ...state,
        findings: [...state.findings, action.finding],
        selectedLines: [],
        submitError: undefined,
      }
    case 'remove-finding':
      return {
        ...state,
        findings: state.findings.filter(({ id }) => id !== action.findingId),
      }
    case 'use-hint':
      return { ...state, hintsUsed: [...state.hintsUsed, action.hint] }
    case 'submit-started':
      return { ...state, submitError: undefined, isSubmitting: true }
    case 'submit-succeeded':
      return {
        ...state,
        phase: 'feedback',
        submittedAttempt: action.attempt,
        isSubmitting: false,
      }
    case 'submit-failed':
      return { ...state, submitError: action.message, isSubmitting: false }
    case 'retry':
      return {
        phase: 'reviewing',
        answerMode: state.answerMode,
        activeFileId: action.fileId,
        selectedLines: [],
        findings: [],
        hintsUsed: action.hintsUsed,
        startedAt: action.startedAt,
        submittedAttempt: undefined,
        submitError: undefined,
        isSubmitting: false,
      }
    case 'start-fix':
      return { ...state, phase: 'fixing' }
    case 'fix-completed':
      return { ...state, phase: 'complete', submittedAttempt: action.attempt }
  }
}

export function ChallengePage() {
  const { exercise, exercises, curriculum, existingAttempt } =
    useLoaderData() as ChallengeLoaderData
  const [session, dispatch] = useReducer(reviewSessionReducer, {
    phase: existingAttempt ? 'feedback' : 'reviewing',
    answerMode:
      existingAttempt?.answerMode ??
      (exercise.level === 'literacy' ? 'language-assist' : 'full-review'),
    activeFileId: exercise.files[0]?.id ?? '',
    selectedLines: [],
    findings: existingAttempt?.findings ?? [],
    hintsUsed: existingAttempt?.hintsUsed ?? [],
    startedAt: existingAttempt?.startedAt ?? new Date().toISOString(),
    submittedAttempt: existingAttempt,
    isSubmitting: false,
  })
  const {
    activeFileId,
    answerMode,
    selectedLines,
    findings,
    hintsUsed,
    startedAt,
    submittedAttempt,
    submitError,
    isSubmitting,
  } = session

  const activeFile = exercise.files.find(({ id }) => id === activeFileId)
  const impactOptionFindingIndex = exercise.expectedFindings.findIndex(
    (finding) =>
      finding.fileId === activeFileId &&
      selectedLines.some((line) =>
        finding.acceptedLocations.some(
          ({ startLine, endLine = startLine }) =>
            line >= startLine && line <= endLine,
        ),
      ),
  )
  const impactOptionStart = Math.max(0, impactOptionFindingIndex) * 3
  const visibleImpactOptions =
    exercise.answerSupport?.impactOptions.slice(
      impactOptionStart,
      impactOptionStart + 3,
    ) ?? []
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
    if (selectedLines.length === 0) {
      return
    }

    dispatch({
      type: 'add-finding',
      finding: {
        id: crypto.randomUUID(),
        fileId: activeFileId,
        locations: selectedLines.map((startLine) => ({ startLine })),
        ...draft,
        createdAt: new Date().toISOString(),
      },
    })
  }

  function requestHint() {
    if (!nextHint) {
      return
    }

    dispatch({
      type: 'use-hint',
      hint: {
        expectedFindingId: exercise.expectedFindings[0]?.id,
        level: nextHint.level,
        usedAt: new Date().toISOString(),
      },
    })
  }

  async function finishReview() {
    dispatch({ type: 'submit-started' })

    try {
      const attempt = await submitReviewAttempt(
        {
          exercise,
          startedAt,
          findings,
          hintsUsed,
          answerMode,
        },
        learnerStateRepository,
      )
      dispatch({ type: 'submit-succeeded', attempt })
    } catch (error) {
      dispatch({
        type: 'submit-failed',
        message:
          error instanceof Error ? error.message : 'Unable to submit review.',
      })
    }
  }

  function retryExercise(nextHints: HintUsage[]) {
    dispatch({
      type: 'retry',
      fileId: exercise.files[0]?.id ?? '',
      hintsUsed: nextHints,
      startedAt: new Date().toISOString(),
    })
  }

  function retryWithoutHint() {
    retryExercise(hintsUsed)
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

  if (
    submittedAttempt &&
    (session.phase === 'fixing' || session.phase === 'complete')
  ) {
    return (
      <FixCodeStep
        attempt={submittedAttempt}
        exercise={exercise}
        onSubmit={async (files) => {
          const completedAttempt = await completeExerciseAttempt(
            {
              attemptId: submittedAttempt.id,
              exercise,
              files,
              exercises,
              curriculum,
            },
            learnerStateRepository,
          )
          dispatch({ type: 'fix-completed', attempt: completedAttempt })
          return completedAttempt
        }}
      />
    )
  }

  if (submittedAttempt) {
    return (
      <ReviewFeedback
        attempt={submittedAttempt}
        canRequestHint={Boolean(nextHint)}
        exercise={exercise}
        onRetry={retryWithoutHint}
        onRetryWithHint={retryWithHint}
        onStartFix={() => dispatch({ type: 'start-fix' })}
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
              aria-describedby={
                !nextHint ? 'hint-unavailable-reason' : undefined
              }
              className="mt-5 w-full rounded-full border border-amber-200/20 px-4 py-2.5 text-sm font-medium text-amber-100/80 transition enabled:hover:border-amber-200/40 enabled:hover:bg-amber-200/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!nextHint}
              onClick={requestHint}
              type="button"
            >
              {nextHint ? `Get hint ${hintsUsed.length + 1}` : 'All hints used'}
            </button>
            {!nextHint && (
              <p className="sr-only" id="hint-unavailable-reason">
                No more hints are available for this exercise.
              </p>
            )}
          </section>
        </aside>

        <section aria-label="Code review workspace" className="min-w-0">
          <div
            aria-label="Exercise files"
            className="mb-3 flex gap-2 overflow-x-auto"
            role="tablist"
          >
            {exercise.files.map((file) => (
              <button
                aria-controls={`exercise-panel-${file.id}`}
                aria-selected={file.id === activeFile.id}
                className={`shrink-0 rounded-full px-4 py-2 font-mono text-xs transition ${
                  file.id === activeFile.id
                    ? 'bg-paper text-ink'
                    : 'border border-white/10 text-paper/50 hover:text-paper'
                }`}
                key={file.id}
                id={`exercise-tab-${file.id}`}
                onClick={() => {
                  dispatch({ type: 'select-file', fileId: file.id })
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
            id={`exercise-panel-${activeFile.id}`}
            labelledBy={`exercise-tab-${activeFile.id}`}
            onSelect={(lines) => dispatch({ type: 'select-lines', lines })}
            selectedLines={selectedLines}
          />
          <p className="mt-3 text-xs leading-5 text-paper/35">
            Click lines to add them individually, including non-adjacent lines.
            Double-click a selected line to remove only that line. Added
            comments appear as markers beside every selected line.
          </p>
        </section>

        <aside className="min-w-0 space-y-6">
          <FindingComposer
            answerMode={answerMode}
            impactOptions={visibleImpactOptions}
            key={answerMode}
            modeLocked={findings.length > 0}
            onAdd={addFinding}
            onAnswerModeChange={(nextAnswerMode) =>
              dispatch({
                type: 'set-answer-mode',
                answerMode: nextAnswerMode,
              })
            }
            selectedLines={selectedLines}
          />

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
                onRemove={(findingId) =>
                  dispatch({ type: 'remove-finding', findingId })
                }
              />
            </div>

            {submitError && (
              <p className="mt-4 text-sm text-red-300" role="alert">
                {submitError}
              </p>
            )}
            <button
              aria-describedby={
                findings.length === 0 ? 'finish-review-reason' : undefined
              }
              className="mt-5 w-full rounded-full bg-mint px-5 py-3.5 font-semibold text-ink transition enabled:hover:bg-[#92f0c3] disabled:cursor-not-allowed disabled:opacity-35"
              disabled={findings.length === 0 || isSubmitting}
              onClick={finishReview}
              type="button"
            >
              {isSubmitting
                ? 'Submitting…'
                : `Finish review · ${findings.length}`}
            </button>
            {findings.length === 0 && (
              <p className="sr-only" id="finish-review-reason">
                Finish review is unavailable. Add at least one finding first.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
