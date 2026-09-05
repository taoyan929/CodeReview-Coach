import { useState, type FormEvent } from 'react'

import {
  issueCategories,
  type IssueCategory,
} from '../../domain/exercise/types'
import { formatLabel } from '../../utils/formatLabel'

export interface FindingDraft {
  category: IssueCategory
  diagnosis: string
  impact?: string
  suggestedFix?: string
}

interface FindingComposerProps {
  selectedLines: number[]
  onAdd: (draft: FindingDraft) => void
}

export function FindingComposer({
  selectedLines,
  onAdd,
}: FindingComposerProps) {
  const [category, setCategory] = useState<IssueCategory>('logic')
  const [diagnosis, setDiagnosis] = useState('')
  const [impact, setImpact] = useState('')
  const [suggestedFix, setSuggestedFix] = useState('')
  const [showDisabledReason, setShowDisabledReason] = useState(false)
  const isAddUnavailable = selectedLines.length === 0 || !diagnosis.trim()
  const disabledReason =
    selectedLines.length === 0 && !diagnosis.trim()
      ? 'Select at least one code line and describe what you noticed.'
      : selectedLines.length === 0
        ? 'Select at least one code line first.'
        : 'Describe what you noticed before adding the finding.'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (selectedLines.length === 0 || !diagnosis.trim()) {
      return
    }

    onAdd({
      category,
      diagnosis: diagnosis.trim(),
      impact: impact.trim() || undefined,
      suggestedFix: suggestedFix.trim() || undefined,
    })
    setDiagnosis('')
    setImpact('')
    setSuggestedFix('')
    setShowDisabledReason(false)
  }

  const lineLabel =
    selectedLines.length === 0
      ? 'Select one or more lines'
      : selectedLines.length === 1
        ? `Line ${selectedLines[0]}`
        : `Lines ${selectedLines.join(', ')}`

  return (
    <form
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Add review finding</p>
          <p className="mt-2 font-mono text-xs text-paper/45">{lineLabel}</p>
        </div>
        <span className="rounded-full border border-mint/25 px-3 py-1 font-mono text-[10px] text-mint uppercase">
          Guided mode
        </span>
      </div>

      <label className="mt-6 block text-sm font-medium" htmlFor="category">
        Issue category
      </label>
      <select
        className="mt-2 w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm text-paper outline-none focus:border-mint/60"
        id="category"
        onChange={(event) => setCategory(event.target.value as IssueCategory)}
        value={category}
      >
        {issueCategories.map((value) => (
          <option key={value} value={value}>
            {formatLabel(value)}
          </option>
        ))}
      </select>

      <label className="mt-5 block text-sm font-medium" htmlFor="diagnosis">
        What did you notice? <span className="text-mint">*</span>
      </label>
      <textarea
        className="mt-2 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm leading-6 text-paper outline-none placeholder:text-paper/25 focus:border-mint/60"
        id="diagnosis"
        onChange={(event) => setDiagnosis(event.target.value)}
        placeholder="Describe the code issue in your own words."
        value={diagnosis}
      />

      <label className="mt-5 block text-sm font-medium" htmlFor="impact">
        Why does it matter? <span className="text-paper/35">Optional</span>
      </label>
      <textarea
        className="mt-2 min-h-20 w-full resize-y rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm leading-6 text-paper outline-none placeholder:text-paper/25 focus:border-mint/60"
        id="impact"
        onChange={(event) => setImpact(event.target.value)}
        placeholder="Explain the user or system impact."
        value={impact}
      />

      <label className="mt-5 block text-sm font-medium" htmlFor="suggested-fix">
        Suggested fix <span className="text-paper/35">Optional</span>
      </label>
      <textarea
        className="mt-2 min-h-20 w-full resize-y rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm leading-6 text-paper outline-none placeholder:text-paper/25 focus:border-mint/60"
        id="suggested-fix"
        onChange={(event) => setSuggestedFix(event.target.value)}
        placeholder="Describe a safer implementation."
        value={suggestedFix}
      />

      <button
        aria-describedby={
          isAddUnavailable ? 'add-finding-disabled-reason' : undefined
        }
        className={`mt-6 w-full rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink transition ${
          isAddUnavailable ? 'cursor-help opacity-35' : 'hover:bg-white'
        }`}
        onBlur={() => setShowDisabledReason(false)}
        onClick={() => {
          if (isAddUnavailable) setShowDisabledReason(true)
        }}
        onFocus={() => {
          if (isAddUnavailable) setShowDisabledReason(true)
        }}
        onMouseEnter={() => {
          if (isAddUnavailable) setShowDisabledReason(true)
        }}
        onMouseLeave={() => setShowDisabledReason(false)}
        type="submit"
      >
        Add finding
      </button>
      {isAddUnavailable && (
        <p
          aria-live="polite"
          className={
            showDisabledReason
              ? 'mt-3 rounded-xl border border-amber-200/20 bg-amber-200/[0.06] px-3 py-2 text-center text-xs leading-5 text-amber-100/80'
              : 'sr-only'
          }
          id="add-finding-disabled-reason"
          role="status"
        >
          {showDisabledReason
            ? disabledReason
            : `Add finding is unavailable. ${disabledReason}`}
        </p>
      )}
    </form>
  )
}
