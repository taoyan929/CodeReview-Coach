import type { CodeFile, Exercise } from '../domain/exercise/types'
import type {
  ExerciseAttempt,
  LearnerState,
  LearnerStateRepository,
} from '../domain/learning/types'

export interface CompleteExerciseAttemptInput {
  attemptId: ExerciseAttempt['id']
  exercise: Exercise
  files: CodeFile[]
}

function hasMeaningfulChange(exercise: Exercise, files: CodeFile[]) {
  return files.some((file) => {
    const originalFile = exercise.files.find(({ id }) => id === file.id)
    return originalFile && originalFile.content.trim() !== file.content.trim()
  })
}

function completeDailyMission(
  learnerState: LearnerState,
  exerciseId: Exercise['id'],
) {
  const mission = learnerState.dailyMission

  if (!mission || !mission.exerciseIds.includes(exerciseId)) {
    return mission
  }

  return {
    ...mission,
    completedExerciseIds: mission.completedExerciseIds.includes(exerciseId)
      ? mission.completedExerciseIds
      : [...mission.completedExerciseIds, exerciseId],
  }
}

export async function completeExerciseAttempt(
  input: CompleteExerciseAttemptInput,
  learnerStateRepository: LearnerStateRepository,
  now = new Date(),
): Promise<ExerciseAttempt> {
  if (!hasMeaningfulChange(input.exercise, input.files)) {
    throw new Error('Change the code before submitting your fix.')
  }

  const learnerState = await learnerStateRepository.load()
  const attemptIndex = learnerState.attempts.findIndex(
    ({ id }) => id === input.attemptId,
  )
  const existingAttempt = learnerState.attempts[attemptIndex]

  if (!existingAttempt?.evaluation) {
    throw new Error('A scored review attempt is required before fixing code.')
  }

  const completedAt = now.toISOString()
  const updatedAttempt: ExerciseAttempt = {
    ...existingAttempt,
    completedAt,
    evaluation: {
      ...existingAttempt.evaluation,
      completed: true,
    },
    fixSubmission: {
      files: input.files,
      submittedAt: completedAt,
    },
  }
  const wasAlreadyCompleted = learnerState.completedExerciseIds.includes(
    input.exercise.id,
  )
  const attempts = [...learnerState.attempts]
  attempts[attemptIndex] = updatedAttempt

  await learnerStateRepository.save({
    ...learnerState,
    attempts,
    completedExerciseIds: wasAlreadyCompleted
      ? learnerState.completedExerciseIds
      : [...learnerState.completedExerciseIds, input.exercise.id],
    curriculumCompletion: wasAlreadyCompleted
      ? learnerState.curriculumCompletion
      : Math.min(
          100,
          learnerState.curriculumCompletion + input.exercise.curriculumWeight,
        ),
    dailyMission: completeDailyMission(learnerState, input.exercise.id),
    updatedAt: completedAt,
  })

  return updatedAttempt
}
