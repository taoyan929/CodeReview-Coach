> Status: Draft · Last reviewed: 2026-09-04 · Imported from [Linear](https://linear.app/taoyan929/document/06-data-model-and-content-schema-e179730229f1).
>
> Repository Markdown is the implementation reference. Material product changes should be reflected in both this document and the matching Linear issue or project document.

# Data Model & Content Schema

## 1. Goals

The same schema should support beginner snippets, multi-file Boss Reviews, future AI-generated exercises and real PR review mode.

## 2. Core enums / concepts

```ts
type LearningLevel = 'literacy' | 'technology-review' | 'software-engineering-review';

type Track =
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'python'
  | 'fastapi'
  | 'rest-api'
  | 'sql'
  | 'nosql'
  | 'testing'
  | 'security';

type MissionType =
  | 'standard-review'
  | 'bug-hunt'
  | 'ship-or-block'
  | 'production-bug'
  | 'security-incident'
  | 'review-the-ai'
  | 'quick-fix'
  | 'boss-review';

type IssueCategory =
  | 'logic'
  | 'error-handling'
  | 'types'
  | 'api-design'
  | 'database'
  | 'performance'
  | 'security'
  | 'testing'
  | 'maintainability'
  | 'accessibility'
  | 'other';
```

## 3. Exercise

```ts
interface Exercise {
  id: string;
  version: number;
  title: string;
  track: Track;
  secondaryTracks?: Track[];
  topics: string[];
  concepts: string[];
  level: LearningLevel;
  difficulty: 1 | 2 | 3 | 4 | 5;
  missionType: MissionType;
  estimatedMinutes: number;
  requirement: ExerciseRequirement;
  files: CodeFile[];
  expectedFindings: ExpectedFinding[];
  hints: Hint[];
  referenceReview?: string;
  referenceSolution?: CodeFile[];
  prerequisites?: string[];
  curriculumWeight: number;
  tags?: string[];
}
```

## 4. Requirement/context

```ts
interface ExerciseRequirement {
  summary: string;
  description?: string;
  acceptanceCriteria?: string[];
  constraints?: string[];
  incidentContext?: string;
}
```

## 5. Code files

```ts
interface CodeFile {
  id: string;
  path: string;
  language: string;
  content: string;
  changeType?: 'added' | 'modified' | 'deleted' | 'context';
  diff?: string;
}
```

## 6. Expected finding

```ts
interface ExpectedFinding {
  id: string;
  fileId: string;
  acceptedLocations: CodeLocation[];
  category: IssueCategory;
  acceptedCategories?: IssueCategory[];
  concepts: string[];
  diagnosisAliases?: string[];
  reasoningConcepts?: string[];
  fixConcepts?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  weight: number;
  hints: Hint[];
  explanation: string;
  referenceComment: string;
}

interface CodeLocation {
  startLine: number;
  endLine?: number;
}
```

## 7. Hint

```ts
interface Hint {
  level: 1 | 2 | 3;
  text: string;
  concept?: string;
}
```

Level guidance:

* 1: category/context clue
* 2: concept clue
* 3: strong location/behaviour clue

## 8. Learner finding

```ts
interface LearnerFinding {
  id: string;
  fileId: string;
  locations: CodeLocation[];
  category?: IssueCategory;
  diagnosis: string;
  impact?: string;
  suggestedFix?: string;
  createdAt: string;
}
```

`locations` stores one or more independently selected lines/ranges. This allows a single review finding to reference non-adjacent lines without treating every intervening line as selected. Learner-state schema version 3 migrates the former singular `location` field into a one-item `locations` array.

Advanced mode may omit category and use a free-form comment while mapping into the same model.

## 9. Submission / attempt

```ts
interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  startedAt: string;
  submittedAt?: string;
  completedAt?: string;
  findings: LearnerFinding[];
  overallDecision?: 'approve' | 'comment' | 'request-changes';
  hintsUsed: HintUsage[];
  evaluation?: EvaluationResult;
  fixSubmission?: FixSubmission;
}
```

## 10. Evaluation result

```ts
interface EvaluationResult {
  technicalScore: number;
  communicationScore?: number;
  findingResults: FindingEvaluation[];
  conceptsFound: string[];
  conceptsMissed: string[];
  assistanceLevel: number;
  completed: boolean;
}

interface FindingEvaluation {
  learnerFindingId?: string;
  expectedFindingId?: string;
  detection: number;
  category: number;
  diagnosis: number;
  reasoning: number;
  fix: number;
  communication?: number;
  status: 'strong' | 'partial' | 'missed' | 'incorrect';
}
```

## 11. Learner state

```ts
interface LearnerState {
  schemaVersion: number;
  profile: LearnerProfile;
  attempts: ExerciseAttempt[];
  completedExerciseIds: string[];
  curriculumCompletion: number;
  mastery: MasteryState;
  weakConcepts: WeakConceptState[];
  streak: StreakState;
  dailyMission?: MissionState;
  weeklyGoal?: WeeklyGoalState;
  unlocks: string[];
  updatedAt: string;
}
```

## 12. Mastery

```ts
interface MasteryState {
  overall?: number;
  byTrack: Record<string, number | undefined>;
  byLevel: Record<string, number | undefined>;
  byConcept: Record<string, number | undefined>;
}
```

Use `undefined` / insufficient-data state rather than showing 0% mastery before a learner has attempted anything.

## 13. Mission and recommendation

```ts
interface Recommendation {
  exerciseId: string;
  score: number;
  reasonCode: string;
  reasonText: string;
}

interface MissionState {
  date: string;
  exerciseIds: string[];
  completedExerciseIds: string[];
  estimatedMinutes: number;
}
```

## 14. Curriculum

```ts
interface Curriculum {
  id: string;
  version: number;
  levels: CurriculumLevel[];
  totalWeight: number; // normalised to 100 for MVP
}
```

Completion calculation should use curriculum weights so new optional practice exercises do not unintentionally change the meaning of 100%.

## 15. Future AI assessment

```ts
interface StructuredAiAssessment {
  semanticMatches: Array<{
    expectedFindingId: string;
    learnerFindingId: string;
    confidence: number;
    diagnosisMatch: number;
    reasoningQuality: number;
    fixQuality: number;
  }>;
  communication?: {
    clarity: number;
    specificity: number;
    suggestedRewrite?: string;
  };
  confidence: number;
}
```

AI output is additive to deterministic evaluation rather than replacing the base result.

## 16. Versioning rules

* Every exercise has a version.
* Learner persistence has `schemaVersion`.
* Curriculum has a version.
* Changing expected findings materially should increment exercise version.
* Migration utilities should handle local learner-state schema changes.

## 17. Validation

All exercise/curriculum content should be schema-validated at build/startup time. Invalid content must fail clearly during development rather than silently producing broken learning experiences.
