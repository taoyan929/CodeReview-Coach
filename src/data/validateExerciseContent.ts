import { goldenCaseKinds, type Exercise } from '../domain/exercise/types'

export function validateExerciseContent(exercise: Exercise) {
  if (exercise.expectedFindings.length > 4) {
    throw new Error(
      `Exercise ${exercise.id} has more than four intentional findings`,
    )
  }

  if (exercise.estimatedMinutes < 5 || exercise.estimatedMinutes > 12) {
    throw new Error(
      `Exercise ${exercise.id} has an unsupported estimated duration`,
    )
  }

  if (!exercise.referenceReview || !exercise.referenceSolution?.length) {
    throw new Error(
      `Exercise ${exercise.id} requires a reference review and solution`,
    )
  }

  const referencePaths = new Set(
    exercise.referenceSolution.map(({ path }) => path),
  )
  for (const file of exercise.files) {
    if (!referencePaths.has(file.path)) {
      throw new Error(
        `Exercise ${exercise.id} has no reference solution for ${file.path}`,
      )
    }
  }

  const fileMap = new Map(exercise.files.map((file) => [file.id, file]))
  for (const finding of exercise.expectedFindings) {
    const file = fileMap.get(finding.fileId)
    const lineCount = file?.content.split('\n').length ?? 0

    for (const location of finding.acceptedLocations) {
      const endLine = location.endLine ?? location.startLine
      if (location.startLine > lineCount || endLine > lineCount) {
        throw new Error(
          `Exercise ${exercise.id} finding ${finding.id} is outside ${finding.fileId}`,
        )
      }
    }

    const hintLevels = finding.hints.map(({ level }) => level)
    if (hintLevels.join(',') !== '1,2,3') {
      throw new Error(
        `Exercise ${exercise.id} finding ${finding.id} requires hint levels 1,2,3`,
      )
    }
  }

  const caseKinds = new Set(
    exercise.evaluationCases?.map(({ kind }) => kind) ?? [],
  )
  for (const kind of goldenCaseKinds) {
    if (!caseKinds.has(kind)) {
      throw new Error(
        `Exercise ${exercise.id} requires a ${kind} evaluation case`,
      )
    }
  }
}

export function validateExercisePack(exercises: Exercise[]) {
  const exerciseIds = new Set<string>()

  for (const exercise of exercises) {
    if (exerciseIds.has(exercise.id)) {
      throw new Error(`Duplicate exercise id: ${exercise.id}`)
    }

    exerciseIds.add(exercise.id)
    validateExerciseContent(exercise)
  }
}
