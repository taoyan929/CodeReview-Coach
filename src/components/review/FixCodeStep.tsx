import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import type { CodeFile, Exercise } from '../../domain/exercise/types'
import type { ExerciseAttempt } from '../../domain/learning/types'

interface FixCodeStepProps {
  exercise: Exercise
  attempt: ExerciseAttempt
  onSubmit: (files: CodeFile[]) => Promise<ExerciseAttempt>
}

export function FixCodeStep({ exercise, attempt, onSubmit }: FixCodeStepProps) {
  const [activeFileId, setActiveFileId] = useState(exercise.files[0]?.id ?? '')
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(exercise.files.map((file) => [file.id, file.content])),
  )
  const [completedAttempt, setCompletedAttempt] = useState<ExerciseAttempt>()
  const [submitError, setSubmitError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const activeFile = exercise.files.find(({ id }) => id === activeFileId)
  const hasChanges = useMemo(
    () =>
      exercise.files.some(
        (file) =>
          (drafts[file.id] ?? file.content).trim() !== file.content.trim(),
      ),
    [drafts, exercise.files],
  )

  if (!activeFile) {
    throw new Error('Validated exercise has no editable file')
  }

  async function submitFix() {
    setSubmitError(undefined)
    setIsSubmitting(true)

    try {
      const fixedFiles = exercise.files.map((file) => ({
        ...file,
        content: drafts[file.id] ?? file.content,
      }))
      setCompletedAttempt(await onSubmit(fixedFiles))
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Unable to submit the fix.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (completedAttempt?.fixSubmission) {
    return (
      <FixComparison
        attempt={completedAttempt}
        exercise={exercise}
        initialFileId={activeFileId}
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-16">
      <p className="eyebrow">Fix the code</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
        Turn the review into a working change.
      </h1>
      <p className="mt-5 max-w-2xl leading-7 text-paper/65">
        Edit the original snippet using what you learned from the review. The
        reference implementation stays hidden until you submit your own fix.
      </p>

      <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f13]">
        <div
          aria-label="Files to fix"
          className="flex gap-2 overflow-x-auto border-b border-white/10 p-3"
          role="tablist"
        >
          {exercise.files.map((file) => (
            <button
              aria-controls={`fix-panel-${file.id}`}
              aria-selected={file.id === activeFile.id}
              className={`shrink-0 rounded-full px-4 py-2 font-mono text-xs transition ${
                file.id === activeFile.id
                  ? 'bg-paper text-ink'
                  : 'border border-white/10 text-paper/50 hover:text-paper'
              }`}
              key={file.id}
              id={`fix-tab-${file.id}`}
              onClick={() => setActiveFileId(file.id)}
              role="tab"
              type="button"
            >
              {file.path}
            </button>
          ))}
        </div>
        <div
          aria-labelledby={`fix-tab-${activeFile.id}`}
          id={`fix-panel-${activeFile.id}`}
          role="tabpanel"
        >
          <label className="sr-only" htmlFor={`fix-${activeFile.id}`}>
            Edit {activeFile.path}
          </label>
          <textarea
            aria-label={`Edit ${activeFile.path}`}
            className="min-h-[520px] w-full resize-y bg-transparent p-5 font-mono text-[13px] leading-6 text-[#d9dfeb] outline-none focus:bg-white/[0.02] sm:p-7"
            id={`fix-${activeFile.id}`}
            onChange={(event) =>
              setDrafts((current) => ({
                ...current,
                [activeFile.id]: event.target.value,
              }))
            }
            spellCheck={false}
            value={drafts[activeFile.id] ?? activeFile.content}
          />
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-paper/45">
          {hasChanges
            ? 'Your working copy differs from the original.'
            : 'Make at least one change before submitting.'}
        </p>
        <button
          aria-describedby={!hasChanges ? 'submit-fix-reason' : undefined}
          className="rounded-full bg-mint px-6 py-3 font-semibold text-ink transition enabled:hover:bg-[#92f0c3] disabled:cursor-not-allowed disabled:opacity-35"
          disabled={!hasChanges || isSubmitting}
          onClick={submitFix}
          type="button"
        >
          {isSubmitting ? 'Submitting fix…' : 'Submit fix'}
        </button>
      </div>
      {!hasChanges && (
        <p className="sr-only" id="submit-fix-reason">
          Submit fix is unavailable. Make at least one code change first.
        </p>
      )}
      {submitError && (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {submitError}
        </p>
      )}

      <p className="mt-10 border-t border-white/10 pt-6 text-xs leading-5 text-paper/35">
        Review attempt {attempt.id.slice(0, 8)} · Completion is recorded only
        after this fix is submitted.
      </p>
    </div>
  )
}

interface FixComparisonProps {
  exercise: Exercise
  attempt: ExerciseAttempt
  initialFileId: string
}

function FixComparison({
  exercise,
  attempt,
  initialFileId,
}: FixComparisonProps) {
  const [activeFileId, setActiveFileId] = useState(initialFileId)
  const originalFile = exercise.files.find(({ id }) => id === activeFileId)
  const fixedFile = attempt.fixSubmission?.files.find(
    ({ id }) => id === activeFileId,
  )
  const referenceFile = exercise.referenceSolution?.find(
    ({ path }) => path === originalFile?.path,
  )

  if (!originalFile || !fixedFile) {
    throw new Error('Completed fix is missing comparison files')
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="eyebrow">Exercise complete</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
        Compare the change, not just the answer.
      </h1>
      <p className="mt-5 max-w-2xl leading-7 text-paper/65">
        Your submitted fix is preserved beside the original and the curated
        reference implementation. Automated fix tests can attach to this same
        structured submission later.
      </p>

      <div className="mt-8 flex gap-2 overflow-x-auto">
        {exercise.files.map((file) => (
          <button
            className={`shrink-0 rounded-full px-4 py-2 font-mono text-xs transition ${
              file.id === activeFileId
                ? 'bg-paper text-ink'
                : 'border border-white/10 text-paper/50 hover:text-paper'
            }`}
            key={file.id}
            onClick={() => setActiveFileId(file.id)}
            type="button"
          >
            {file.path}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <CodeComparisonPanel
          code={originalFile.content}
          label="Original"
          path={originalFile.path}
        />
        <CodeComparisonPanel
          code={fixedFile.content}
          label="Your fix"
          path={fixedFile.path}
          tone="mint"
        />
        <CodeComparisonPanel
          code={referenceFile?.content ?? 'No reference solution provided.'}
          label="Reference"
          path={referenceFile?.path ?? originalFile.path}
        />
      </div>

      <section className="mt-8 rounded-3xl border border-mint/20 bg-mint/[0.06] p-6">
        <p className="eyebrow">Completion recorded</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-semibold text-mint">100% complete</p>
            <p className="mt-2 text-sm text-paper/55">
              Review submitted · feedback revealed · fix submitted
            </p>
            {attempt.answerMode === 'language-assist' && (
              <p className="mt-2 text-xs text-mint/75">
                Completed with language assist · 85% mastery weighting
              </p>
            )}
          </div>
          <p className="font-mono text-xs text-paper/40">
            Technical review · {attempt.evaluation?.technicalScore ?? 0}%
          </p>
        </div>
      </section>

      <Link
        className="mt-8 inline-flex rounded-full bg-mint px-6 py-3 font-semibold text-ink transition hover:bg-[#92f0c3]"
        to="/"
      >
        Back to mission
      </Link>
    </div>
  )
}

interface CodeComparisonPanelProps {
  label: string
  path: string
  code: string
  tone?: 'mint'
}

function CodeComparisonPanel({
  label,
  path,
  code,
  tone,
}: CodeComparisonPanelProps) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-3xl border bg-[#0d0f13] ${
        tone === 'mint' ? 'border-mint/25' : 'border-white/10'
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <span className={`eyebrow ${tone === 'mint' ? 'text-mint' : ''}`}>
          {label}
        </span>
        <span className="truncate font-mono text-[10px] text-paper/35">
          {path}
        </span>
      </div>
      <pre className="max-h-[560px] overflow-auto p-5 font-mono text-[12px] leading-6 text-[#d9dfeb]">
        <code>{code}</code>
      </pre>
    </section>
  )
}
