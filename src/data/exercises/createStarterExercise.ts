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
  severity: 'low' | 'medium' | 'high' | 'critical'
  explanation: string
  referenceComment: string
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
  const expectedFindings = spec.findings.map((finding) => ({
    id: finding.id,
    fileId: finding.fileId,
    acceptedLocations: finding.locations,
    category: finding.category,
    acceptedCategories: finding.acceptedCategories,
    concepts: finding.concepts,
    diagnosisAliases: [finding.diagnosis],
    reasoningConcepts: [finding.reasoning],
    fixConcepts: [finding.fix],
    severity: finding.severity,
    weight: finding.severity === 'critical' ? 2 : 1,
    hints: findingHints(finding),
    explanation: finding.explanation,
    referenceComment: finding.referenceComment,
  }))

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
