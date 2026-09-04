import { z } from 'zod'

import {
  issueCategories,
  learningLevels,
  missionTypes,
  tracks,
  type Curriculum,
  type Exercise,
} from '../domain/exercise/types'

const codeLocationSchema = z
  .object({
    startLine: z.number().int().positive(),
    endLine: z.number().int().positive().optional(),
  })
  .refine(
    ({ startLine, endLine }) => endLine === undefined || endLine >= startLine,
    { message: 'endLine must be greater than or equal to startLine' },
  )

const hintSchema = z.object({
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  text: z.string().min(1),
  concept: z.string().min(1).optional(),
})

const codeFileSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  language: z.string().min(1),
  content: z.string(),
  changeType: z.enum(['added', 'modified', 'deleted', 'context']).optional(),
  diff: z.string().optional(),
})

const expectedFindingSchema = z.object({
  id: z.string().min(1),
  fileId: z.string().min(1),
  acceptedLocations: z.array(codeLocationSchema).min(1),
  category: z.enum(issueCategories),
  acceptedCategories: z.array(z.enum(issueCategories)).optional(),
  concepts: z.array(z.string().min(1)).min(1),
  diagnosisAliases: z.array(z.string().min(1)).optional(),
  reasoningConcepts: z.array(z.string().min(1)).optional(),
  fixConcepts: z.array(z.string().min(1)).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  weight: z.number().positive(),
  hints: z.array(hintSchema),
  explanation: z.string().min(1),
  referenceComment: z.string().min(1),
})

export const exerciseSchema = z
  .object({
    id: z.string().min(1),
    version: z.number().int().positive(),
    title: z.string().min(1),
    track: z.enum(tracks),
    secondaryTracks: z.array(z.enum(tracks)).optional(),
    topics: z.array(z.string().min(1)).min(1),
    concepts: z.array(z.string().min(1)).min(1),
    level: z.enum(learningLevels),
    difficulty: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ]),
    missionType: z.enum(missionTypes),
    estimatedMinutes: z.number().int().positive(),
    requirement: z.object({
      summary: z.string().min(1),
      description: z.string().min(1).optional(),
      acceptanceCriteria: z.array(z.string().min(1)).optional(),
      constraints: z.array(z.string().min(1)).optional(),
      incidentContext: z.string().min(1).optional(),
    }),
    files: z.array(codeFileSchema).min(1),
    expectedFindings: z.array(expectedFindingSchema).min(1),
    hints: z.array(hintSchema),
    referenceReview: z.string().min(1).optional(),
    referenceSolution: z.array(codeFileSchema).optional(),
    prerequisites: z.array(z.string().min(1)).optional(),
    curriculumWeight: z.number().positive(),
    tags: z.array(z.string().min(1)).optional(),
  })
  .superRefine((exercise, context) => {
    const fileIds = new Set(exercise.files.map((file) => file.id))

    for (const finding of exercise.expectedFindings) {
      if (!fileIds.has(finding.fileId)) {
        context.addIssue({
          code: 'custom',
          message: `Expected finding ${finding.id} references unknown file ${finding.fileId}`,
          path: ['expectedFindings'],
        })
      }
    }
  })

export const curriculumSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  levels: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        level: z.enum(learningLevels),
        exerciseIds: z.array(z.string().min(1)),
      }),
    )
    .min(1),
  totalWeight: z.number().positive(),
})

export function parseExercise(input: unknown): Exercise {
  return exerciseSchema.parse(input)
}

export function parseCurriculum(input: unknown): Curriculum {
  return curriculumSchema.parse(input)
}
