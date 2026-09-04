import type {
  Curriculum,
  Exercise,
  ExerciseFilters,
} from '../domain/exercise/types'
import type { ExerciseRepository } from '../domain/learning/types'
import { parseCurriculum, parseExercise } from '../schemas/exerciseSchema'

export class LocalExerciseRepository implements ExerciseRepository {
  private readonly exercises: Exercise[]
  private readonly curriculum: Curriculum

  constructor(exercises: unknown[], curriculum: unknown) {
    this.exercises = exercises.map(parseExercise)
    this.curriculum = parseCurriculum(curriculum)
    this.validateCurriculumReferences()
  }

  async getExercise(id: string): Promise<Exercise | null> {
    return this.exercises.find((exercise) => exercise.id === id) ?? null
  }

  async listExercises(filters: ExerciseFilters = {}): Promise<Exercise[]> {
    return this.exercises.filter((exercise) => {
      if (filters.track && exercise.track !== filters.track) return false
      if (filters.level && exercise.level !== filters.level) return false
      if (filters.difficulty && exercise.difficulty !== filters.difficulty) {
        return false
      }
      if (filters.missionType && exercise.missionType !== filters.missionType) {
        return false
      }
      if (filters.topic && !exercise.topics.includes(filters.topic)) {
        return false
      }
      return true
    })
  }

  async getCurriculum(): Promise<Curriculum> {
    return this.curriculum
  }

  private validateCurriculumReferences(): void {
    const knownExerciseIds = new Set(
      this.exercises.map((exercise) => exercise.id),
    )

    for (const level of this.curriculum.levels) {
      for (const exerciseId of level.exerciseIds) {
        if (!knownExerciseIds.has(exerciseId)) {
          throw new Error(
            `Curriculum references unknown exercise: ${exerciseId}`,
          )
        }
      }
    }

    const curriculumExerciseIds = new Set(
      this.curriculum.levels.flatMap((level) => level.exerciseIds),
    )
    const actualWeight = this.exercises
      .filter((exercise) => curriculumExerciseIds.has(exercise.id))
      .reduce((sum, exercise) => sum + exercise.curriculumWeight, 0)

    if (actualWeight !== this.curriculum.totalWeight) {
      throw new Error(
        `Curriculum weight mismatch: expected ${this.curriculum.totalWeight}, received ${actualWeight}`,
      )
    }
  }
}
