import { Fragment, useMemo } from 'react'

import type { CodeFile, CodeLocation } from '../../domain/exercise/types'
import type { LearnerFinding } from '../../domain/learning/types'

interface CodeReviewPanelProps {
  file: CodeFile
  findings: LearnerFinding[]
  selection?: CodeLocation
  onSelect: (selection: CodeLocation) => void
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

function includesLine(location: CodeLocation, lineNumber: number) {
  return (
    lineNumber >= location.startLine &&
    lineNumber <= (location.endLine ?? location.startLine)
  )
}

export function CodeReviewPanel({
  file,
  findings,
  selection,
  onSelect,
}: CodeReviewPanelProps) {
  const commentCounts = useMemo(() => {
    const counts = new Map<number, number>()

    for (const finding of findings.filter(({ fileId }) => fileId === file.id)) {
      counts.set(
        finding.location.startLine,
        (counts.get(finding.location.startLine) ?? 0) + 1,
      )
    }

    return counts
  }, [file.id, findings])

  function selectLine(lineNumber: number) {
    if (!selection) {
      onSelect({ startLine: lineNumber, endLine: lineNumber })
      return
    }

    const currentEnd = selection.endLine ?? selection.startLine

    if (selection.startLine === lineNumber && currentEnd === lineNumber) {
      onSelect({ startLine: lineNumber, endLine: lineNumber })
      return
    }

    onSelect({
      startLine: Math.min(selection.startLine, lineNumber),
      endLine: Math.max(currentEnd, lineNumber),
    })
  }

  return (
    <section
      aria-label={`Code in ${file.path}`}
      className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f13]"
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
          const isSelected = selection
            ? includesLine(selection, lineNumber)
            : false
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
              type="button"
            >
              <span
                aria-hidden="true"
                className={`select-none border-r px-3 text-right ${
                  isSelected
                    ? 'border-mint/40 text-mint'
                    : 'border-white/5 text-paper/25'
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
    </section>
  )
}
