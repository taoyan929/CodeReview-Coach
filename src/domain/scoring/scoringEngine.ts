import type {
  AnswerMode,
  CodeLocation,
  Exercise,
  ExpectedFinding,
} from '../exercise/types'
import type {
  EvaluationResult,
  FindingEvaluation,
  HintUsage,
  LearnerFinding,
} from '../learning/types'
import { learningRules } from '../../config/learningRules'

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

function normaliseToken(token: string) {
  if (token.length > 4 && token.endsWith('ies')) {
    return `${token.slice(0, -3)}y`
  }
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) {
    return token.slice(0, -1)
  }
  return token
}

function tokenise(value: string) {
  const operatorAwareValue = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()

  return new Set(
    (operatorAwareValue.match(/!==|===|==|!=|\?\?|[a-z0-9]+/g) ?? [])
      .map(normaliseToken)
      .filter((token) => token.length > 1 && !stopWords.has(token)),
  )
}

function hasMeaningfulDiagnosis(value: string) {
  return (
    value.replace(/[^\p{L}\p{N}]/gu, '').length >=
      learningRules.diagnosis.minimumMeaningfulCharacters &&
    tokenise(value).size > 0
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

function keywordGroupMatchScore(input: string, groups: string[][] = []) {
  const inputTokens = tokenise(input)

  if (inputTokens.size === 0) return 0

  return groups.some((group) => {
    const requiredTokens = tokenise(group.join(' '))
    return (
      requiredTokens.size > 0 &&
      [...requiredTokens].every((token) => inputTokens.has(token))
    )
  })
    ? 1
    : 0
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
  answerMode: AnswerMode,
) {
  const phraseScore = phraseMatchScore(learnerFinding.diagnosis, [
    ...expectedFinding.concepts,
    ...(expectedFinding.diagnosisAliases ?? []),
  ])

  return answerMode === 'language-assist'
    ? Math.max(
        phraseScore,
        keywordGroupMatchScore(
          learnerFinding.diagnosis,
          expectedFinding.diagnosisKeywordGroups,
        ),
      )
    : phraseScore
}

function reasoningScore(
  learnerFinding: LearnerFinding,
  expectedFinding: ExpectedFinding,
  answerMode: AnswerMode,
) {
  if (answerMode === 'language-assist') {
    return learnerFinding.impactOptionId &&
      expectedFinding.acceptedImpactOptionIds?.includes(
        learnerFinding.impactOptionId,
      )
      ? 1
      : 0
  }

  return phraseMatchScore(
    `${learnerFinding.diagnosis} ${learnerFinding.impact ?? ''}`,
    expectedFinding.reasoningConcepts ?? [],
  )
}

function fixScore(
  learnerFinding: LearnerFinding,
  expectedFinding: ExpectedFinding,
  answerMode: AnswerMode,
) {
  const phraseScore = phraseMatchScore(
    learnerFinding.suggestedFix ?? '',
    expectedFinding.fixConcepts ?? [],
  )

  return answerMode === 'language-assist'
    ? Math.max(
        phraseScore,
        keywordGroupMatchScore(
          learnerFinding.suggestedFix ?? '',
          expectedFinding.fixKeywordGroups,
        ),
      )
    : phraseScore
}

function communicationScore(
  learnerFinding: LearnerFinding,
  answerMode: AnswerMode,
) {
  const diagnosisWords = tokenise(learnerFinding.diagnosis).size
  const impactWords = tokenise(learnerFinding.impact ?? '').size
  const fixWords = tokenise(learnerFinding.suggestedFix ?? '').size

  if (answerMode === 'language-assist') {
    const target = learningRules.answerModes.shortAnswerTargetTokens
    const clarity = Math.min(1, diagnosisWords / target) * 0.6
    const actionability = Math.min(1, fixWords / target) * 0.4
    return roundDimension(clarity + actionability)
  }

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
  answerMode: AnswerMode,
): FindingEvaluation {
  const evaluation: FindingEvaluation = {
    learnerFindingId: learnerFinding.id,
    expectedFindingId: expectedFinding.id,
    detection: detectionScore(learnerFinding, expectedFinding),
    category: categoryScore(learnerFinding, expectedFinding),
    diagnosis: diagnosisScore(learnerFinding, expectedFinding, answerMode),
    reasoning: reasoningScore(learnerFinding, expectedFinding, answerMode),
    fix: fixScore(learnerFinding, expectedFinding, answerMode),
    communication: communicationScore(learnerFinding, answerMode),
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
  options: { answerMode?: AnswerMode } = {},
): EvaluationResult {
  const answerMode = options.answerMode ?? 'full-review'
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
        evaluation: evaluatePair(learnerFinding, expectedFinding, answerMode),
      }))
      .filter(({ learnerFinding }) =>
        hasMeaningfulDiagnosis(learnerFinding.diagnosis),
      )
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
      communication: communicationScore(learnerFinding, answerMode),
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
