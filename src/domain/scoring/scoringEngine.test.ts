import { reactDerivedStateExercise } from '../../data/exercises/reactDerivedState'
import type { LearnerFinding } from '../learning/types'
import { evaluateReview, TECHNICAL_DIMENSION_WEIGHTS } from './scoringEngine'

function finding(overrides: Partial<LearnerFinding> = {}): LearnerFinding {
  return {
    id: 'learner-finding-1',
    fileId: 'task-list',
    location: { startLine: 15, endLine: 17 },
    category: 'logic',
    diagnosis:
      'visibleTasks becomes stale because useState keeps the initial value when props change',
    impact: 'New task and query props can change after the initial render.',
    suggestedFix:
      'Remove useState and calculate visibleTasks from props during render.',
    createdAt: '2026-09-05T00:00:00.000Z',
    ...overrides,
  }
}

describe('evaluateReview', () => {
  it('scores a conceptually correct finding without exact reference wording', () => {
    const result = evaluateReview(reactDerivedStateExercise, [finding()])
    const evaluation = result.findingResults[0]

    expect(result.technicalScore).toBeGreaterThanOrEqual(90)
    expect(evaluation).toMatchObject({
      detection: 1,
      category: 1,
      diagnosis: 1,
      reasoning: 1,
      fix: 1,
      status: 'strong',
    })
    expect(result.conceptsFound).toContain('derived-state')
    expect(result.completed).toBe(false)
  })

  it('gives partial credit for the correct location with a weak explanation', () => {
    const result = evaluateReview(reactDerivedStateExercise, [
      finding({
        category: 'testing',
        diagnosis: 'This looks wrong.',
        impact: undefined,
        suggestedFix: undefined,
      }),
    ])

    expect(result.technicalScore).toBe(
      Math.round(TECHNICAL_DIMENSION_WEIGHTS.detection * 100),
    )
    expect(result.findingResults[0]?.status).toBe('partial')
    expect(result.conceptsMissed).toContain('derived-state')
  })

  it('reports missed expected findings and unrelated learner comments', () => {
    const result = evaluateReview(reactDerivedStateExercise, [
      finding({
        fileId: 'another-file',
        location: { startLine: 2 },
        category: 'testing',
        diagnosis: 'Add another test.',
      }),
    ])

    expect(result.technicalScore).toBe(0)
    expect(result.findingResults.map(({ status }) => status)).toEqual([
      'missed',
      'incorrect',
    ])
  })

  it('keeps communication informational and records hint assistance', () => {
    const conciseResult = evaluateReview(reactDerivedStateExercise, [
      finding({ impact: undefined, suggestedFix: undefined }),
    ])
    const detailedResult = evaluateReview(
      reactDerivedStateExercise,
      [finding()],
      [
        {
          expectedFindingId: 'derived-state-does-not-update',
          level: 2,
          usedAt: '2026-09-05T00:00:00.000Z',
        },
      ],
    )

    expect(detailedResult.communicationScore).toBeGreaterThan(
      conciseResult.communicationScore ?? 0,
    )
    expect(detailedResult.assistanceLevel).toBe(0.67)
    expect(detailedResult.completed).toBe(false)
  })
})
