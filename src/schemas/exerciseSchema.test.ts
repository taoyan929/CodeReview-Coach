import { reactDerivedStateExercise } from '../data/exercises/reactDerivedState'
import { parseExercise } from './exerciseSchema'

describe('exerciseSchema', () => {
  it('accepts the golden React exercise', () => {
    expect(parseExercise(reactDerivedStateExercise)).toEqual(
      reactDerivedStateExercise,
    )
  })

  it('rejects findings that reference a missing file', () => {
    const invalidExercise = structuredClone(reactDerivedStateExercise)
    invalidExercise.expectedFindings[0]!.fileId = 'missing-file'

    expect(() => parseExercise(invalidExercise)).toThrow(
      /references unknown file/,
    )
  })

  it('rejects an inverted line range', () => {
    const invalidExercise = structuredClone(reactDerivedStateExercise)
    invalidExercise.expectedFindings[0]!.acceptedLocations = [
      { startLine: 16, endLine: 14 },
    ]

    expect(() => parseExercise(invalidExercise)).toThrow(
      /endLine must be greater/,
    )
  })
})
