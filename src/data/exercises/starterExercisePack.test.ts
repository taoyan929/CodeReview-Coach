import { mvpCurriculum } from '../curriculum'
import {
  goldenCaseKinds,
  learningLevels,
  missionTypes,
  tracks,
} from '../../domain/exercise/types'
import type { LearnerFinding } from '../../domain/learning/types'
import { evaluateReview } from '../../domain/scoring/scoringEngine'
import { LocalExerciseRepository } from '../../repositories/LocalExerciseRepository'
import { parseExercise } from '../../schemas/exerciseSchema'
import { reactDerivedStateExercise } from './reactDerivedState'
import { starterExercisePack } from './starterExercisePack'

const exercises = [reactDerivedStateExercise, ...starterExercisePack]

describe('starterExercisePack', () => {
  it('contains 24 schema-valid exercises in a 100-point curriculum', () => {
    expect(exercises).toHaveLength(24)
    expect(() =>
      exercises.forEach((exercise) => parseExercise(exercise)),
    ).not.toThrow()
    expect(
      exercises.reduce(
        (total, exercise) => total + exercise.curriculumWeight,
        0,
      ),
    ).toBe(100)
    expect(
      () => new LocalExerciseRepository(exercises, mvpCurriculum),
    ).not.toThrow()
  })

  it('covers every MVP track, learning level and professional mission type', () => {
    for (const track of tracks) {
      expect(
        exercises.filter(
          (exercise) =>
            exercise.track === track ||
            exercise.secondaryTracks?.includes(track),
        ).length,
        track,
      ).toBeGreaterThanOrEqual(2)
    }

    for (const level of learningLevels) {
      expect(
        exercises.some((exercise) => exercise.level === level),
        level,
      ).toBe(true)
    }

    for (const missionType of missionTypes) {
      expect(
        exercises.some((exercise) => exercise.missionType === missionType),
        missionType,
      ).toBe(true)
    }
  })

  it('keeps findings, hints, references and line ranges content-ready', () => {
    for (const exercise of exercises) {
      expect(exercise.expectedFindings.length).toBeGreaterThanOrEqual(1)
      expect(exercise.expectedFindings.length).toBeLessThanOrEqual(4)
      expect(exercise.referenceReview).toBeTruthy()
      expect(exercise.referenceSolution?.length).toBe(exercise.files.length)
      expect(
        new Set(exercise.evaluationCases?.map(({ kind }) => kind)),
      ).toEqual(new Set(goldenCaseKinds))

      for (const finding of exercise.expectedFindings) {
        const file = exercise.files.find(({ id }) => id === finding.fileId)
        const lineCount = file?.content.split('\n').length ?? 0

        expect(finding.hints.map(({ level }) => level)).toEqual([1, 2, 3])
        for (const location of finding.acceptedLocations) {
          expect(location.startLine).toBeLessThanOrEqual(lineCount)
          expect(location.endLine ?? location.startLine).toBeLessThanOrEqual(
            lineCount,
          )
        }
      }
    }
  })

  it('passes every embedded golden deterministic evaluation case', () => {
    for (const exercise of exercises) {
      for (const evaluationCase of exercise.evaluationCases ?? []) {
        const learnerFinding: LearnerFinding = {
          id: evaluationCase.id,
          ...evaluationCase.submission,
          createdAt: '2026-09-05T00:00:00.000Z',
        }
        const result = evaluateReview(exercise, [learnerFinding])
        const targetFinding = result.findingResults.find(
          ({ expectedFindingId }) =>
            expectedFindingId === evaluationCase.expectedFindingId,
        )

        expect(targetFinding?.status, evaluationCase.id).toBe(
          evaluationCase.expectedFindingStatus,
        )
      }
    }
  })
})
