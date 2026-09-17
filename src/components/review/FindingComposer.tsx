import { useState, type FormEvent } from 'react'

import { learningRules } from '../../config/learningRules'
import {
  issueCategories,
  type AnswerMode,
  type ImpactOption,
  type IssueCategory,
} from '../../domain/exercise/types'
import { formatLabel } from '../../utils/formatLabel'

export const NOT_SURE_IMPACT_OPTION_ID = 'not-sure'

export interface FindingDraft {
  category: IssueCategory
  diagnosis: string
  impact?: string
  impactOptionId?: string
  suggestedFix?: string
}

interface FindingComposerProps {
  answerMode: AnswerMode
  impactOptions: ImpactOption[]
  modeLocked: boolean
  selectedLines: number[]
  onAdd: (draft: FindingDraft) => void
  onAnswerModeChange: (mode: AnswerMode) => void
}

function hasMeaningfulText(value: string) {
  return (
    value.replace(/[^\p{L}\p{N}]/gu, '').length >=
    learningRules.diagnosis.minimumMeaningfulCharacters
  )
}

export function FindingComposer({
  answerMode,
  impactOptions,
  modeLocked,
  selectedLines,
  onAdd,
  onAnswerModeChange,
}: FindingComposerProps) {
  const [category, setCategory] = useState<IssueCategory | ''>('')
  const [diagnosis, setDiagnosis] = useState('')
  const [impact, setImpact] = useState('')
  const [impactOptionId, setImpactOptionId] = useState('')
  const [suggestedFix, setSuggestedFix] = useState('')
  const [showDisabledReason, setShowDisabledReason] = useState(false)
  const isLanguageAssist = answerMode === 'language-assist'
  const hasCurrentImpactOption =
    impactOptionId === NOT_SURE_IMPACT_OPTION_ID ||
    impactOptions.some(({ id }) => id === impactOptionId)
  const missingRequirements = [
    selectedLines.length === 0 ? 'select at least one code line' : undefined,
    !category ? 'choose an issue category' : undefined,
    !hasMeaningfulText(diagnosis)
      ? 'describe the main issue with at least 3 meaningful characters'
      : undefined,
    isLanguageAssist && !hasCurrentImpactOption
      ? 'choose a possible impact or Not sure yet'
      : undefined,
    isLanguageAssist && !hasMeaningfulText(suggestedFix)
      ? 'describe how you would fix it with at least 3 meaningful characters'
      : undefined,
  ].filter((requirement): requirement is string => Boolean(requirement))
  const isAddUnavailable = missingRequirements.length > 0
  const disabledReason = `To add this finding, ${missingRequirements.join(', ')}.`

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isAddUnavailable || !category) return

    onAdd({
      category,
      diagnosis: diagnosis.trim(),
      impact: isLanguageAssist ? undefined : impact.trim() || undefined,
      impactOptionId: isLanguageAssist ? impactOptionId : undefined,
      suggestedFix: suggestedFix.trim() || undefined,
    })
    setCategory('')
    setDiagnosis('')
    setImpact('')
    setImpactOptionId('')
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Add review finding</p>
          <p className="mt-2 font-mono text-xs text-paper/45">{lineLabel}</p>
        </div>
        <div
          aria-label="Answer mode"
          className="flex rounded-full border border-mint/25 p-1"
        >
          {(['language-assist', 'full-review'] as const).map((mode) => (
            <button
              aria-pressed={answerMode === mode}
              className={`rounded-full px-3 py-1.5 font-mono text-[10px] uppercase transition ${
                answerMode === mode
                  ? 'bg-mint text-ink'
                  : 'text-mint hover:bg-mint/[0.08] disabled:cursor-not-allowed disabled:opacity-35'
              }`}
              disabled={modeLocked}
              key={mode}
              onClick={() => onAnswerModeChange(mode)}
              type="button"
            >
              {mode === 'language-assist' ? 'Language assist' : 'Full review'}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-paper/50">
        {isLanguageAssist
          ? 'Use short English phrases. Grammar does not affect your technical score.'
          : 'Practise a complete review comment in your own words.'}
      </p>
      {modeLocked && (
        <p className="mt-2 text-xs leading-5 text-amber-100/70">
          Remove all findings to change answer mode.
        </p>
      )}

      <label className="mt-6 block text-sm font-medium" htmlFor="category">
        Issue category <span className="text-mint">*</span>
      </label>
      <select
        className="mt-2 w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm text-paper outline-none focus:border-mint/60"
        id="category"
        onChange={(event) =>
          setCategory(event.target.value as IssueCategory | '')
        }
        value={category}
      >
        <option disabled value="">
          Choose a category
        </option>
        {issueCategories.map((value) => (
          <option key={value} value={value}>
            {formatLabel(value)}
          </option>
        ))}
      </select>

      <label className="mt-5 block text-sm font-medium" htmlFor="diagnosis">
        {isLanguageAssist ? 'What is the main issue?' : 'What did you notice?'}{' '}
        <span className="text-mint">*</span>
      </label>
      <textarea
        className="mt-2 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm leading-6 text-paper outline-none placeholder:text-paper/25 focus:border-mint/60"
        id="diagnosis"
        onChange={(event) => setDiagnosis(event.target.value)}
        placeholder={
          isLanguageAssist
            ? 'Short phrase, e.g. loose equality accepts wrong role'
            : 'Describe the code issue in your own words.'
        }
        value={diagnosis}
      />

      {isLanguageAssist ? (
        <fieldset className="mt-5">
          <legend className="text-sm font-medium">
            What could happen? <span className="text-mint">*</span>
          </legend>
          <p className="mt-1 text-xs leading-5 text-paper/40">
            Choose one. The answer is revealed only after submission.
          </p>
          <div className="mt-3 space-y-2">
            {[
              ...impactOptions,
              { id: NOT_SURE_IMPACT_OPTION_ID, label: 'Not sure yet' },
            ].map((option) => (
              <label
                className={`flex cursor-pointer gap-3 rounded-xl border px-3 py-3 text-sm leading-5 transition ${
                  impactOptionId === option.id
                    ? 'border-mint/40 bg-mint/[0.07] text-paper'
                    : 'border-white/10 bg-ink/40 text-paper/60 hover:border-white/20'
                }`}
                key={option.id}
              >
                <input
                  checked={impactOptionId === option.id}
                  className="mt-0.5 accent-[#89e8ba]"
                  name="impact-option"
                  onChange={() => setImpactOptionId(option.id)}
                  type="radio"
                  value={option.id}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <>
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
        </>
      )}

      <label className="mt-5 block text-sm font-medium" htmlFor="suggested-fix">
        {isLanguageAssist ? 'How would you fix it?' : 'Suggested fix'}{' '}
        {isLanguageAssist ? (
          <span className="text-mint">*</span>
        ) : (
          <span className="text-paper/35">Optional</span>
        )}
      </label>
      <textarea
        className="mt-2 min-h-20 w-full resize-y rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm leading-6 text-paper outline-none placeholder:text-paper/25 focus:border-mint/60"
        id="suggested-fix"
        onChange={(event) => setSuggestedFix(event.target.value)}
        placeholder={
          isLanguageAssist
            ? 'Short phrase, e.g. use === instead of =='
            : 'Describe a safer implementation.'
        }
        value={suggestedFix}
      />

      <button
        aria-describedby={
          isAddUnavailable ? 'add-finding-disabled-reason' : undefined
        }
        aria-disabled={isAddUnavailable}
        className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold transition ${
          isAddUnavailable
            ? 'cursor-help border border-white/15 bg-white/10 text-paper/75'
            : 'bg-paper text-ink hover:bg-white'
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
