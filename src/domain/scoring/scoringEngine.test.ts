import { reactDerivedStateExercise } from '../../data/exercises/reactDerivedState'
import { starterExercisePack } from '../../data/exercises/starterExercisePack'
import type { LearnerFinding } from '../learning/types'
import { evaluateReview, TECHNICAL_DIMENSION_WEIGHTS } from './scoringEngine'

function finding(overrides: Partial<LearnerFinding> = {}): LearnerFinding {
  return {
    id: 'learner-finding-1',
    fileId: 'task-list',
    locations: [{ startLine: 15 }, { startLine: 17 }],
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
        locations: [{ startLine: 2 }],
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

  it('does not award location-only partial credit to meaningless input', () => {
    const result = evaluateReview(reactDerivedStateExercise, [
      finding({ diagnosis: 'x', impact: undefined, suggestedFix: undefined }),
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

  it('accepts compact technical English and operators in language assist', () => {
    const exercise = starterExercisePack.find(
      ({ id }) => id === 'javascript-strict-equality-01',
    )!
    const expectedFinding = exercise.expectedFindings[0]!
    const result = evaluateReview(
      exercise,
      [
        {
          id: 'short-finding',
          fileId: expectedFinding.fileId,
          locations: [{ startLine: 2 }],
          category: 'logic',
          diagnosis: 'coercion',
          impactOptionId: 'not-sure',
          suggestedFix: 'use ===',
          createdAt: '2026-09-05T00:00:00.000Z',
        },
      ],
      [],
      { answerMode: 'language-assist' },
    )

    expect(result.technicalScore).toBe(85)
    expect(result.findingResults[0]).toMatchObject({
      detection: 1,
      category: 1,
      diagnosis: 1,
      reasoning: 0,
      fix: 1,
      status: 'strong',
    })
  })

  it('scores a supported impact choice without treating it as authored communication', () => {
    const exercise = starterExercisePack.find(
      ({ id }) => id === 'javascript-strict-equality-01',
    )!
    const expectedFinding = exercise.expectedFindings[0]!
    const correctImpactId = expectedFinding.acceptedImpactOptionIds![0]!
    const baseFinding: LearnerFinding = {
      id: 'short-finding',
      fileId: expectedFinding.fileId,
      locations: [{ startLine: 2 }],
      category: 'logic',
      diagnosis: 'loose equality coercion',
      suggestedFix: 'use ===',
      createdAt: '2026-09-05T00:00:00.000Z',
    }
    const unsure = evaluateReview(
      exercise,
      [{ ...baseFinding, impactOptionId: 'not-sure' }],
      [],
      { answerMode: 'language-assist' },
    )
    const correct = evaluateReview(
      exercise,
      [{ ...baseFinding, impactOptionId: correctImpactId }],
      [],
      { answerMode: 'language-assist' },
    )

    expect(correct.technicalScore).toBe(100)
    expect(correct.findingResults[0]?.reasoning).toBe(1)
    expect(correct.communicationScore).toBe(unsure.communicationScore)
  })

  it('does not let a generic short answer pass by guessing an impact', () => {
    const exercise = starterExercisePack.find(
      ({ id }) => id === 'javascript-strict-equality-01',
    )!
    const expectedFinding = exercise.expectedFindings[0]!
    const result = evaluateReview(
      exercise,
      [
        {
          id: 'guess',
          fileId: expectedFinding.fileId,
          locations: [{ startLine: 2 }],
          category: 'logic',
          diagnosis: 'wrong code',
          impactOptionId: expectedFinding.acceptedImpactOptionIds![0],
          suggestedFix: 'good code',
          createdAt: '2026-09-05T00:00:00.000Z',
        },
      ],
      [],
      { answerMode: 'language-assist' },
    )

    expect(result.technicalScore).toBeLessThan(75)
    expect(result.findingResults[0]?.status).toBe('partial')
  })
})
