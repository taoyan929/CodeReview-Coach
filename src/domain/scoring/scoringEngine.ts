import type { CodeLocation, Exercise, ExpectedFinding } from '../exercise/types'
import type {
  EvaluationResult,
  FindingEvaluation,
  HintUsage,
  LearnerFinding,
} from '../learning/types'

export const TECHNICAL_DIMENSION_WEIGHTS = {
  detection: 0.35,
  category: 0.15,
  diagnosis: 0.25,
  reasoning: 0.15,
  fix: 0.1,
} as const

export const STRONG_FINDING_THRESHOLD = 0.75
export const PARTIAL_FINDING_THRESHOLD = 0.35

const stopWords = new Set([
  'a',
  'after',
  'an',
  'and',
  'as',
  'at',
  'be',
  'because',
  'by',
  'can',
  'does',
  'during',
  'for',
  'from',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'only',
  'or',
  'so',
  'the',
  'this',
  'to',
  'when',
  'with',
])

function roundDimension(value: number) {
  return Math.round(value * 100) / 100
}

function tokenise(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 1 && !stopWords.has(token)),
  )
}

function phraseMatchScore(input: string, phrases: string[]) {
  const inputTokens = tokenise(input)

  if (inputTokens.size === 0 || phrases.length === 0) {
    return 0
  }

  return roundDimension(
    Math.max(
      ...phrases.map((phrase) => {
        const phraseTokens = [...tokenise(phrase)]
        const matches = phraseTokens.filter((token) =>
          inputTokens.has(token),
        ).length

        if (matches < Math.min(2, phraseTokens.length)) {
          return 0
        }

        return Math.min(1, matches / Math.min(3, phraseTokens.length))
      }),
    ),
  )
}

function locationsOverlap(left: CodeLocation, right: CodeLocation) {
  const leftEnd = left.endLine ?? left.startLine
  const rightEnd = right.endLine ?? right.startLine
  return left.startLine <= rightEnd && right.startLine <= leftEnd
}

function detectionScore(
  learnerFinding: LearnerFinding,
  expectedFinding: ExpectedFinding,
) {
  if (learnerFinding.fileId !== expectedFinding.fileId) {
    return 0
  }

  return learnerFinding.locations.some((selectedLocation) =>
    expectedFinding.acceptedLocations.some((acceptedLocation) =>
      locationsOverlap(selectedLocation, acceptedLocation),
    ),
  )
    ? 1
    : 0
}

function categoryScore(
  learnerFinding: LearnerFinding,
  expectedFinding: ExpectedFinding,
) {
  const acceptedCategories = [
    expectedFinding.category,
    ...(expectedFinding.acceptedCategories ?? []),
  ]
  return learnerFinding.category &&
    acceptedCategories.includes(learnerFinding.category)
    ? 1
    : 0
}

function diagnosisScore(
  learnerFinding: LearnerFinding,
  expectedFinding: ExpectedFinding,
) {
  return phraseMatchScore(learnerFinding.diagnosis, [
    ...expectedFinding.concepts,
    ...(expectedFinding.diagnosisAliases ?? []),
  ])
}

function reasoningScore(
  learnerFinding: LearnerFinding,
  expectedFinding: ExpectedFinding,
) {
  return phraseMatchScore(
    `${learnerFinding.diagnosis} ${learnerFinding.impact ?? ''}`,
    expectedFinding.reasoningConcepts ?? [],
  )
}

function fixScore(
  learnerFinding: LearnerFinding,
  expectedFinding: ExpectedFinding,
) {
  return phraseMatchScore(
    learnerFinding.suggestedFix ?? '',
    expectedFinding.fixConcepts ?? [],
  )
}

function communicationScore(learnerFinding: LearnerFinding) {
  const diagnosisWords = tokenise(learnerFinding.diagnosis).size
  const impactWords = tokenise(learnerFinding.impact ?? '').size
  const fixWords = tokenise(learnerFinding.suggestedFix ?? '').size
  const clarity = Math.min(1, diagnosisWords / 8) * 0.5
  const specificity = Math.min(1, impactWords / 6) * 0.25
  const actionability = Math.min(1, fixWords / 6) * 0.25
  return roundDimension(clarity + specificity + actionability)
}

function technicalFindingScore(evaluation: FindingEvaluation) {
  return (
    evaluation.detection * TECHNICAL_DIMENSION_WEIGHTS.detection +
    evaluation.category * TECHNICAL_DIMENSION_WEIGHTS.category +
    evaluation.diagnosis * TECHNICAL_DIMENSION_WEIGHTS.diagnosis +
    evaluation.reasoning * TECHNICAL_DIMENSION_WEIGHTS.reasoning +
    evaluation.fix * TECHNICAL_DIMENSION_WEIGHTS.fix
  )
}

function evaluatePair(
  learnerFinding: LearnerFinding,
  expectedFinding: ExpectedFinding,
): FindingEvaluation {
  const evaluation: FindingEvaluation = {
    learnerFindingId: learnerFinding.id,
    expectedFindingId: expectedFinding.id,
    detection: detectionScore(learnerFinding, expectedFinding),
    category: categoryScore(learnerFinding, expectedFinding),
    diagnosis: diagnosisScore(learnerFinding, expectedFinding),
    reasoning: reasoningScore(learnerFinding, expectedFinding),
    fix: fixScore(learnerFinding, expectedFinding),
    communication: communicationScore(learnerFinding),
    status: 'incorrect',
  }
  const technicalScore = technicalFindingScore(evaluation)

  evaluation.status =
    technicalScore >= STRONG_FINDING_THRESHOLD
      ? 'strong'
      : technicalScore >= PARTIAL_FINDING_THRESHOLD
        ? 'partial'
        : 'incorrect'

  return evaluation
}

function pairStrength(evaluation: FindingEvaluation) {
  return (
    evaluation.detection * 0.6 +
    evaluation.category * 0.15 +
    evaluation.diagnosis * 0.25
  )
}

export function evaluateReview(
  exercise: Exercise,
  learnerFindings: LearnerFinding[],
  hintsUsed: HintUsage[] = [],
): EvaluationResult {
  const unmatchedLearnerFindings = new Map(
    learnerFindings.map((finding) => [finding.id, finding]),
  )
  const findingResults: FindingEvaluation[] = []
  let weightedTechnicalTotal = 0
  const totalExpectedWeight = exercise.expectedFindings.reduce(
    (total, finding) => total + finding.weight,
    0,
  )
  const conceptsFound = new Set<string>()
  const conceptsMissed = new Set<string>()

  for (const expectedFinding of exercise.expectedFindings) {
    const candidates = [...unmatchedLearnerFindings.values()]
      .map((learnerFinding) => ({
        learnerFinding,
        evaluation: evaluatePair(learnerFinding, expectedFinding),
      }))
      .filter(
        ({ evaluation }) =>
          evaluation.detection === 1 ||
          (evaluation.category === 1 && evaluation.diagnosis >= 0.67),
      )
      .sort(
        (left, right) =>
          pairStrength(right.evaluation) - pairStrength(left.evaluation),
      )
    const bestCandidate = candidates[0]

    if (!bestCandidate) {
      findingResults.push({
        expectedFindingId: expectedFinding.id,
        detection: 0,
        category: 0,
        diagnosis: 0,
        reasoning: 0,
        fix: 0,
        status: 'missed',
      })
      expectedFinding.concepts.forEach((concept) => conceptsMissed.add(concept))
      continue
    }

    findingResults.push(bestCandidate.evaluation)
    unmatchedLearnerFindings.delete(bestCandidate.learnerFinding.id)
    weightedTechnicalTotal +=
      technicalFindingScore(bestCandidate.evaluation) * expectedFinding.weight

    const conceptTarget =
      bestCandidate.evaluation.diagnosis >= 0.67
        ? conceptsFound
        : conceptsMissed
    expectedFinding.concepts.forEach((concept) => conceptTarget.add(concept))
  }

  for (const learnerFinding of unmatchedLearnerFindings.values()) {
    findingResults.push({
      learnerFindingId: learnerFinding.id,
      detection: 0,
      category: 0,
      diagnosis: 0,
      reasoning: 0,
      fix: 0,
      communication: communicationScore(learnerFinding),
      status: 'incorrect',
    })
  }

  const communicationResults = findingResults.filter(
    (result) => result.learnerFindingId && result.communication !== undefined,
  )
  const communicationAverage = communicationResults.length
    ? communicationResults.reduce(
        (total, result) => total + (result.communication ?? 0),
        0,
      ) / communicationResults.length
    : 0
  const strongestHint = hintsUsed.reduce(
    (strongest, hint) => Math.max(strongest, hint.level),
    0,
  )

  return {
    technicalScore:
      totalExpectedWeight > 0
        ? Math.round((weightedTechnicalTotal / totalExpectedWeight) * 100)
        : 0,
    communicationScore: Math.round(communicationAverage * 100),
    findingResults,
    conceptsFound: [...conceptsFound],
    conceptsMissed: [...conceptsMissed].filter(
      (concept) => !conceptsFound.has(concept),
    ),
    assistanceLevel: roundDimension(strongestHint / 3),
    completed: false,
  }
}
