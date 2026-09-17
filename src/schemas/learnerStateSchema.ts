import { z } from 'zod'

import {
  answerModes,
  issueCategories,
  learningLevels,
  tracks,
} from '../domain/exercise/types'
import {
  LEARNER_STATE_SCHEMA_VERSION,
  type LearnerState,
} from '../domain/learning/types'

const codeFileSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  language: z.string().min(1),
  content: z.string(),
  changeType: z.enum(['added', 'modified', 'deleted', 'context']).optional(),
  diff: z.string().optional(),
})

const findingEvaluationSchema = z.object({
  learnerFindingId: z.string().optional(),
  expectedFindingId: z.string().optional(),
  detection: z.number(),
  category: z.number(),
  diagnosis: z.number(),
  reasoning: z.number(),
  fix: z.number(),
  communication: z.number().optional(),
  status: z.enum(['strong', 'partial', 'missed', 'incorrect']),
})

const evaluationSchema = z.object({
  technicalScore: z.number(),
  communicationScore: z.number().optional(),
  findingResults: z.array(findingEvaluationSchema),
  conceptsFound: z.array(z.string()),
  conceptsMissed: z.array(z.string()),
  assistanceLevel: z.number(),
  completed: z.boolean(),
})

const learnerFindingSchema = z.object({
  id: z.string().min(1),
  fileId: z.string().min(1),
  locations: z
    .array(
      z.object({
        startLine: z.number().int().positive(),
        endLine: z.number().int().positive().optional(),
      }),
    )
    .min(1),
  category: z.enum(issueCategories).optional(),
  diagnosis: z.string(),
  impact: z.string().optional(),
  impactOptionId: z.string().optional(),
  suggestedFix: z.string().optional(),
  createdAt: z.iso.datetime(),
})

const attemptSchema = z.object({
  id: z.string().min(1),
  exerciseId: z.string().min(1),
  answerMode: z.enum(answerModes),
  startedAt: z.iso.datetime(),
  submittedAt: z.iso.datetime().optional(),
  completedAt: z.iso.datetime().optional(),
  findings: z.array(learnerFindingSchema),
  overallDecision: z.enum(['approve', 'comment', 'request-changes']).optional(),
  hintsUsed: z.array(
    z.object({
      expectedFindingId: z.string().optional(),
      level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      usedAt: z.iso.datetime(),
    }),
  ),
  evaluation: evaluationSchema.optional(),
  fixSubmission: z
    .object({
      files: z.array(codeFileSchema),
      submittedAt: z.iso.datetime(),
    })
    .optional(),
})

const recommendationSchema = z.object({
  exerciseId: z.string().min(1),
  score: z.number(),
  reasonCode: z.string().min(1),
  reasonText: z.string().min(1),
})

export const learnerStateSchema = z.object({
  schemaVersion: z.literal(LEARNER_STATE_SCHEMA_VERSION),
  profile: z.object({
    id: z.string().min(1),
    createdAt: z.iso.datetime(),
    preferredTracks: z.array(z.enum(tracks)),
    dailyTargetMinutes: z.number().int().positive(),
  }),
  attempts: z.array(attemptSchema),
  completedExerciseIds: z.array(z.string()),
  curriculumCompletion: z.number().min(0).max(100),
  mastery: z.object({
    overall: z.number().optional(),
    byTrack: z.partialRecord(z.enum(tracks), z.number()),
    byLevel: z.partialRecord(z.enum(learningLevels), z.number()),
    byConcept: z.record(z.string(), z.number().optional()),
  }),
  weakConcepts: z.array(
    z.object({
      concept: z.string().min(1),
      missCount: z.number().int().nonnegative(),
      priority: z.number(),
      lastPractisedAt: z.iso.datetime().optional(),
    }),
  ),
  streak: z.object({
    currentDays: z.number().int().nonnegative(),
    longestDays: z.number().int().nonnegative(),
    lastActiveDate: z.string().optional(),
    activityDates: z.array(z.string()),
  }),
  dailyMission: z
    .object({
      date: z.string(),
      exerciseIds: z.array(z.string()),
      completedExerciseIds: z.array(z.string()),
      estimatedMinutes: z.number().int().nonnegative(),
      recommendations: z.array(recommendationSchema),
    })
    .optional(),
  weeklyGoal: z
    .object({
      weekStart: z.string(),
      targetExercises: z.number().int().positive(),
      completedExercises: z.number().int().nonnegative(),
    })
    .optional(),
  unlocks: z.array(z.string()),
  updatedAt: z.iso.datetime(),
})

export function parseLearnerState(input: unknown): LearnerState {
  return learnerStateSchema.parse(input)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function migrateLearnerState(input: unknown): LearnerState {
  if (!isRecord(input)) {
    return parseLearnerState(input)
  }

  if (input.schemaVersion === 1 && isRecord(input.streak)) {
    return migrateLearnerState({
      ...input,
      schemaVersion: 2,
      streak: {
        ...input.streak,
        activityDates: [],
      },
    })
  }

  if (input.schemaVersion === 2 && Array.isArray(input.attempts)) {
    return migrateLearnerState({
      ...input,
      schemaVersion: 3,
      attempts: input.attempts.map((attempt) => {
        if (!isRecord(attempt) || !Array.isArray(attempt.findings)) {
          return attempt
        }

        return {
          ...attempt,
          findings: attempt.findings.map((finding) => {
            if (!isRecord(finding) || !isRecord(finding.location)) {
              return finding
            }

            const { location, ...remainingFinding } = finding
            return { ...remainingFinding, locations: [location] }
          }),
        }
      }),
    })
  }

  if (input.schemaVersion === 3) {
    const dailyMission = isRecord(input.dailyMission)
      ? {
          ...input.dailyMission,
          recommendations: Array.isArray(input.dailyMission.exerciseIds)
            ? input.dailyMission.exerciseIds.map((exerciseId) => ({
                exerciseId,
                score: 0,
                reasonCode: 'legacy-mission',
                reasonText: 'Continue your existing daily mission.',
              }))
            : [],
        }
      : input.dailyMission

    return migrateLearnerState({
      ...input,
      schemaVersion: 4,
      dailyMission,
    })
  }

  if (input.schemaVersion === 4 && Array.isArray(input.attempts)) {
    return parseLearnerState({
      ...input,
      schemaVersion: LEARNER_STATE_SCHEMA_VERSION,
      attempts: input.attempts.map((attempt) =>
        isRecord(attempt) ? { ...attempt, answerMode: 'full-review' } : attempt,
      ),
    })
  }

  return parseLearnerState(input)
}
