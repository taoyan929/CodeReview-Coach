import { Fragment, useMemo, type KeyboardEvent } from 'react'

import type { CodeFile } from '../../domain/exercise/types'
import type { LearnerFinding } from '../../domain/learning/types'
import { getSelectedLineNumbers } from '../../utils/formatCodeLocations'

interface CodeReviewPanelProps {
  file: CodeFile
  findings: LearnerFinding[]
  selectedLines: number[]
  onSelect: (lines: number[]) => void
  id?: string
  labelledBy?: string
}

const tokenPattern =
  /(\/\/.*|`[^`]*`|'[^']*'|"[^"]*"|\b(?:import|from|interface|export|function|const|return|new|useState|boolean|string)\b|\b\d+\b)/g

function highlightLine(line: string) {
  return line.split(tokenPattern).map((token, index) => {
    let className = ''

    if (token.startsWith('//')) {
      className = 'text-paper/40'
    } else if (/^[`'"]/.test(token)) {
      className = 'text-amber-200'
    } else if (/^\d+$/.test(token)) {
      className = 'text-sky-300'
    } else if (
      /^(import|from|interface|export|function|const|return|new)$/.test(token)
    ) {
      className = 'text-fuchsia-300'
    } else if (/^(useState|boolean|string)$/.test(token)) {
      className = 'text-mint'
    }

    return (
      <Fragment key={`${index}-${token}`}>
        {className ? <span className={className}>{token}</span> : token}
      </Fragment>
    )
  })
}

export function CodeReviewPanel({
  file,
  findings,
  selectedLines,
  onSelect,
  id,
  labelledBy,
}: CodeReviewPanelProps) {
  const commentCounts = useMemo(() => {
    const counts = new Map<number, number>()

    for (const finding of findings.filter(({ fileId }) => fileId === file.id)) {
      for (const line of getSelectedLineNumbers(finding.locations)) {
        counts.set(line, (counts.get(line) ?? 0) + 1)
      }
    }

    return counts
  }, [file.id, findings])

  function selectLine(lineNumber: number) {
    if (selectedLines.includes(lineNumber)) {
      return
    }

    onSelect([...selectedLines, lineNumber].sort((left, right) => left - right))
  }

  function deselectLine(lineNumber: number) {
    onSelect(
      selectedLines.filter((selectedLine) => selectedLine !== lineNumber),
    )
  }

  function handleLineKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    lineNumber: number,
  ) {
    if (
      selectedLines.includes(lineNumber) &&
      (event.key === 'Delete' || event.key === 'Backspace')
    ) {
      event.preventDefault()
      deselectLine(lineNumber)
    }
  }

  return (
    <section
      aria-label={`Code in ${file.path}`}
      aria-labelledby={labelledBy}
      className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f13]"
      id={id}
      role={labelledBy ? 'tabpanel' : undefined}
      tabIndex={labelledBy ? 0 : undefined}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <p className="truncate font-mono text-xs text-paper/55">{file.path}</p>
        <span className="ml-4 font-mono text-xs text-mint">
          {file.language}
        </span>
      </div>
      <div className="overflow-x-auto py-3 font-mono text-[13px] leading-6 text-[#d9dfeb]">
        {file.content.split('\n').map((line, index) => {
          const lineNumber = index + 1
          const isSelected = selectedLines.includes(lineNumber)
          const commentCount = commentCounts.get(lineNumber) ?? 0

          return (
            <button
              aria-label={`Select line ${lineNumber}: ${line.trim() || 'blank line'}`}
              aria-pressed={isSelected}
              className={`grid w-full min-w-max grid-cols-[3.25rem_1fr_2.5rem] text-left transition ${
                isSelected ? 'bg-mint/15 text-white' : 'hover:bg-white/[0.045]'
              }`}
              key={`${lineNumber}-${line}`}
              onClick={() => selectLine(lineNumber)}
              onDoubleClick={() => deselectLine(lineNumber)}
              onKeyDown={(event) => handleLineKeyDown(event, lineNumber)}
              title="Click to select. Double-click or press Delete to deselect."
              type="button"
            >
              <span
                aria-hidden="true"
                className={`select-none border-r px-3 text-right ${
                  isSelected
                    ? 'border-mint/40 text-mint'
                    : 'border-white/5 text-paper/50'
                }`}
              >
                {String(lineNumber).padStart(2, '0')}
              </span>
              <span className="whitespace-pre px-4">
                {line ? highlightLine(line) : ' '}
              </span>
              <span className="px-2 text-right text-[10px] text-mint">
                {commentCount > 0 ? `${commentCount} ●` : ''}
              </span>
            </button>
          )
        })}
      </div>
      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[10px] text-paper/40 uppercase">
            Selected
          </span>
          {selectedLines.length > 0 ? (
            <>
              {selectedLines.map((lineNumber) => (
                <button
                  aria-label={`Remove selected line ${lineNumber}`}
                  className="rounded-full border border-mint/25 bg-mint/[0.06] px-3 py-1 font-mono text-[10px] text-mint transition hover:bg-mint/[0.12]"
                  key={lineNumber}
                  onClick={() => deselectLine(lineNumber)}
                  type="button"
                >
                  Line {lineNumber} ×
                </button>
              ))}
              <button
                className="ml-auto text-xs text-paper/45 underline-offset-4 hover:text-paper hover:underline"
                onClick={() => onSelect([])}
                type="button"
              >
                Clear selection
              </button>
            </>
          ) : (
            <span className="text-xs text-paper/30">None</span>
          )}
        </div>
        <p aria-live="polite" className="sr-only" role="status">
          {selectedLines.length > 0
            ? `${selectedLines.length} code ${selectedLines.length === 1 ? 'line' : 'lines'} selected.`
            : 'No code lines selected.'}
        </p>
      </div>
    </section>
  )
}
