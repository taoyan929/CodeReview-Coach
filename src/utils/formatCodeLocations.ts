import type { CodeLocation } from '../domain/exercise/types'

export function getSelectedLineNumbers(locations: CodeLocation[]) {
  const lineNumbers = new Set<number>()

  for (const location of locations) {
    for (
      let line = location.startLine;
      line <= (location.endLine ?? location.startLine);
      line += 1
    ) {
      lineNumbers.add(line)
    }
  }

  return [...lineNumbers].sort((left, right) => left - right)
}

export function formatCodeLocations(locations: CodeLocation[]) {
  const lineNumbers = getSelectedLineNumbers(locations)

  if (lineNumbers.length === 1) {
    return `Line ${lineNumbers[0]}`
  }

  return `Lines ${lineNumbers.join(', ')}`
}
