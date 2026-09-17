import type {
  CodeFile,
  CodeLocation,
  Exercise,
  IssueCategory,
  LearningLevel,
  MissionType,
  Track,
} from '../../domain/exercise/types'

export interface StarterFindingSpec {
  id: string
  fileId: string
  locations: CodeLocation[]
  category: IssueCategory
  acceptedCategories?: IssueCategory[]
  concepts: string[]
  diagnosis: string
  reasoning: string
  fix: string
  impactDistractors: [string, string]
  diagnosisKeywordGroups?: string[][]
  fixKeywordGroups?: string[][]
  severity: 'low' | 'medium' | 'high' | 'critical'
  explanation: string
  referenceComment: string
}

const nonDistinctiveAnswerWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'be',
  'before',
  'can',
  'code',
  'data',
  'does',
  'error',
  'every',
  'for',
  'from',
  'function',
  'has',
  'in',
  'inside',
  'is',
  'it',
  'not',
  'of',
  'on',
  'only',
  'or',
  'query',
  'request',
  'response',
  'result',
  'return',
  'the',
  'this',
  'to',
  'test',
  'use',
  'used',
  'user',
  'value',
  'values',
  'when',
  'with',
  'without',
  'wrong',
])

function keywordGroups(phrase: string) {
  const groups =
    phrase
      .match(/!==|===|==|!=|\?\?|[a-zA-Z][a-zA-Z0-9_]*/g)
      ?.map((token) => token.toLowerCase())
      .filter((token) => !nonDistinctiveAnswerWords.has(token))
      .map((token) => [token]) ?? []

  if (phrase.toLowerCase().includes('strict equality')) {
    groups.push(['==='])
  }
  if (phrase.toLowerCase().includes('nullish')) {
    groups.push(['??'])
  }

  return [...new Map(groups.map((group) => [group.join(' '), group])).values()]
}

function answerSupportForFinding(finding: StarterFindingSpec) {
  const correctIndex =
    [...finding.id].reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    ) % 3
  const labels = [...finding.impactDistractors]
  labels.splice(correctIndex, 0, finding.reasoning)
  const options = labels.map((label, index) => ({
    id: `${finding.id}-impact-${String.fromCharCode(97 + index)}`,
    label: label.charAt(0).toUpperCase() + label.slice(1) + '.',
  }))

  return {
    options,
    acceptedOptionId: options[correctIndex]!.id,
  }
}

export interface StarterExerciseSpec {
  id: string
  title: string
  track: Track
  secondaryTracks?: Track[]
  topics: string[]
  concepts: string[]
  level: LearningLevel
  difficulty: Exercise['difficulty']
  missionType: MissionType
  estimatedMinutes: number
  requirement: Exercise['requirement']
  files: CodeFile[]
  findings: StarterFindingSpec[]
  referenceSolution: CodeFile[]
  prerequisites?: string[]
  curriculumWeight?: number
  tags?: string[]
}

function findingHints(finding: StarterFindingSpec) {
  const location = finding.locations[0]
  const locationText = location
    ? location.endLine
      ? `lines ${location.startLine}–${location.endLine}`
      : `line ${location.startLine}`
    : 'the highlighted code'

  return [
    {
      level: 1 as const,
      text: `Compare the ${finding.category} behaviour with the requirement.`,
      concept: finding.concepts[0],
    },
    {
      level: 2 as const,
      text: `Consider whether ${finding.diagnosis.toLowerCase()}.`,
      concept: finding.concepts[0],
    },
    {
      level: 3 as const,
      text: `Inspect ${locationText} and trace what happens at runtime.`,
      concept: finding.concepts[0],
    },
  ]
}

function evaluationCases(spec: StarterExerciseSpec) {
  const finding = spec.findings[0]

  if (!finding) return []

  const baseSubmission = {
    fileId: finding.fileId,
    locations: finding.locations,
  }

  return [
    {
      id: `${spec.id}-strong`,
      kind: 'strong' as const,
      expectedFindingId: finding.id,
      submission: {
        ...baseSubmission,
        category: finding.category,
        diagnosis: finding.diagnosis,
        impact: finding.reasoning,
        suggestedFix: finding.fix,
      },
      expectedFindingStatus: 'strong' as const,
    },
    {
      id: `${spec.id}-poor-english`,
      kind: 'poor-english-correct' as const,
      expectedFindingId: finding.id,
      submission: {
        ...baseSubmission,
        category: finding.category,
        diagnosis: finding.diagnosis,
      },
      expectedFindingStatus: 'strong' as const,
    },
    {
      id: `${spec.id}-partial`,
      kind: 'partial' as const,
      expectedFindingId: finding.id,
      submission: {
        ...baseSubmission,
        category: 'other' as const,
        diagnosis: 'Something in this area may be wrong.',
      },
      expectedFindingStatus: 'partial' as const,
    },
    {
      id: `${spec.id}-incorrect`,
      kind: 'incorrect' as const,
      expectedFindingId: finding.id,
      submission: {
        fileId: finding.fileId,
        locations: [{ startLine: 999 }],
        category: 'other' as const,
        diagnosis: 'Rename this value to make it shorter.',
      },
      expectedFindingStatus: 'missed' as const,
    },
  ]
}

export function createStarterExercise(spec: StarterExerciseSpec): Exercise {
  const supportByFinding = new Map(
    spec.findings.map((finding) => [
      finding.id,
      answerSupportForFinding(finding),
    ]),
  )
  const expectedFindings = spec.findings.map((finding) => {
    const support = supportByFinding.get(finding.id)!

    return {
      id: finding.id,
      fileId: finding.fileId,
      acceptedLocations: finding.locations,
      category: finding.category,
      acceptedCategories: finding.acceptedCategories,
      concepts: finding.concepts,
      diagnosisAliases: [finding.diagnosis],
      diagnosisKeywordGroups:
        finding.diagnosisKeywordGroups ?? keywordGroups(finding.diagnosis),
      reasoningConcepts: [finding.reasoning],
      fixConcepts: [finding.fix],
      fixKeywordGroups: finding.fixKeywordGroups ?? keywordGroups(finding.fix),
      acceptedImpactOptionIds: [support.acceptedOptionId],
      severity: finding.severity,
      weight: finding.severity === 'critical' ? 2 : 1,
      hints: findingHints(finding),
      explanation: finding.explanation,
      referenceComment: finding.referenceComment,
    }
  })

  return {
    id: spec.id,
    version: 1,
    title: spec.title,
    track: spec.track,
    secondaryTracks: spec.secondaryTracks,
    topics: spec.topics,
    concepts: spec.concepts,
    level: spec.level,
    difficulty: spec.difficulty,
    missionType: spec.missionType,
    estimatedMinutes: spec.estimatedMinutes,
    requirement: spec.requirement,
    answerSupport: {
      impactOptions: [...supportByFinding.values()].flatMap(
        ({ options }) => options,
      ),
    },
    files: spec.files,
    expectedFindings,
    hints: expectedFindings[0]?.hints.slice(0, 1) ?? [],
    referenceReview: `Request changes: ${expectedFindings
      .map(({ referenceComment }) => referenceComment)
      .join(' ')}`,
    referenceSolution: spec.referenceSolution,
    evaluationCases: evaluationCases(spec),
    prerequisites: spec.prerequisites ?? [],
    curriculumWeight: spec.curriculumWeight ?? 4,
    tags: ['starter-pack', spec.track, spec.level, ...(spec.tags ?? [])],
  }
}
