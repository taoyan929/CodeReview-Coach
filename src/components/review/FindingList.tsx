import type { LearnerFinding } from '../../domain/learning/types'
import { formatCodeLocations } from '../../utils/formatCodeLocations'
import { formatLabel } from '../../utils/formatLabel'

interface FindingListProps {
  findings: LearnerFinding[]
  onRemove?: (id: string) => void
}

export function FindingList({ findings, onRemove }: FindingListProps) {
  if (findings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-5 text-sm leading-6 text-paper/45">
        No findings yet. Select a suspicious line in the code, then explain what
        you noticed.
      </div>
    )
  }

  return (
    <ol className="space-y-3">
      {findings.map((finding, index) => {
        const lineLabel = formatCodeLocations(finding.locations)

        return (
          <li
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
            key={finding.id}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase">
                <span className="text-mint">Finding {index + 1}</span>
                <span className="text-paper/35">{lineLabel}</span>
                {finding.category && (
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-paper/55">
                    {formatLabel(finding.category)}
                  </span>
                )}
              </div>
              {onRemove && (
                <button
                  aria-label={`Remove finding ${index + 1}`}
                  className="text-xs text-paper/35 underline-offset-4 hover:text-paper hover:underline"
                  onClick={() => onRemove(finding.id)}
                  type="button"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="mt-3 text-sm leading-6 text-paper/80">
              {finding.diagnosis}
            </p>
            {finding.impact && (
              <p className="mt-2 text-xs leading-5 text-paper/50">
                <strong className="text-paper/65">Impact:</strong>{' '}
                {finding.impact}
              </p>
            )}
            {finding.suggestedFix && (
              <p className="mt-2 text-xs leading-5 text-paper/50">
                <strong className="text-paper/65">Suggested fix:</strong>{' '}
                {finding.suggestedFix}
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}
