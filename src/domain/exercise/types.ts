export const learningLevels = [
  'literacy',
  'technology-review',
  'software-engineering-review',
] as const

export type LearningLevel = (typeof learningLevels)[number]

export const tracks = [
  'javascript',
  'typescript',
  'react',
  'python',
  'fastapi',
  'rest-api',
  'sql',
  'nosql',
  'testing',
  'security',
] as const

export type Track = (typeof tracks)[number]

export const missionTypes = [
  'standard-review',
  'bug-hunt',
  'ship-or-block',
  'production-bug',
  'security-incident',
  'review-the-ai',
  'quick-fix',
  'boss-review',
] as const

export type MissionType = (typeof missionTypes)[number]

export const issueCategories = [
  'logic',
  'error-handling',
  'types',
  'api-design',
  'database',
  'performance',
  'security',
  'testing',
  'maintainability',
  'accessibility',
  'other',
] as const

export type IssueCategory = (typeof issueCategories)[number]

export interface CodeLocation {
  startLine: number
  endLine?: number
}

export interface Hint {
  level: 1 | 2 | 3
  text: string
  concept?: string
}

export interface ExerciseRequirement {
  summary: string
  description?: string
  acceptanceCriteria?: string[]
  constraints?: string[]
  incidentContext?: string
}

export interface CodeFile {
  id: string
  path: string
  language: string
  content: string
  changeType?: 'added' | 'modified' | 'deleted' | 'context'
  diff?: string
}

export interface ExpectedFinding {
  id: string
  fileId: string
  acceptedLocations: CodeLocation[]
  category: IssueCategory
  acceptedCategories?: IssueCategory[]
  concepts: string[]
  diagnosisAliases?: string[]
  reasoningConcepts?: string[]
  fixConcepts?: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  weight: number
  hints: Hint[]
  explanation: string
  referenceComment: string
}

export const goldenCaseKinds = [
  'strong',
  'poor-english-correct',
  'partial',
  'incorrect',
] as const

export type GoldenCaseKind = (typeof goldenCaseKinds)[number]

export interface GoldenEvaluationCase {
  id: string
  kind: GoldenCaseKind
  expectedFindingId: string
  submission: {
    fileId: string
    locations: CodeLocation[]
    category?: IssueCategory
    diagnosis: string
    impact?: string
    suggestedFix?: string
  }
  expectedFindingStatus: 'strong' | 'partial' | 'missed' | 'incorrect'
}

export interface Exercise {
  id: string
  version: number
  title: string
  track: Track
  secondaryTracks?: Track[]
  topics: string[]
  concepts: string[]
  level: LearningLevel
  difficulty: 1 | 2 | 3 | 4 | 5
  missionType: MissionType
  estimatedMinutes: number
  requirement: ExerciseRequirement
  files: CodeFile[]
  expectedFindings: ExpectedFinding[]
  hints: Hint[]
  referenceReview?: string
  referenceSolution?: CodeFile[]
  evaluationCases?: GoldenEvaluationCase[]
  prerequisites?: string[]
  curriculumWeight: number
  tags?: string[]
}

export interface ExerciseFilters {
  track?: Track
  level?: LearningLevel
  difficulty?: Exercise['difficulty']
  missionType?: MissionType
  topic?: string
}

export interface CurriculumLevel {
  id: string
  title: string
  level: LearningLevel
  exerciseIds: string[]
}

export interface Curriculum {
  id: string
  version: number
  levels: CurriculumLevel[]
  totalWeight: number
}
