import type { Exercise } from '../domain/exercise/types'
import type {
  ExerciseAttempt,
  HintUsage,
  LearnerFinding,
  LearnerStateRepository,
} from '../domain/learning/types'

export interface SubmitReviewInput {
  exerciseId: Exercise['id']
  startedAt: string
  findings: LearnerFinding[]
  hintsUsed: HintUsage[]
}

export async function submitReviewAttempt(
  input: SubmitReviewInput,
  learnerStateRepository: LearnerStateRepository,
  now = new Date(),
  createId: () => string = () => crypto.randomUUID(),
): Promise<ExerciseAttempt> {
  if (input.findings.length === 0) {
    throw new Error('Add at least one finding before submitting your review.')
  }

  const learnerState = await learnerStateRepository.load()
  const submittedAt = now.toISOString()
  const attempt: ExerciseAttempt = {
    id: createId(),
    exerciseId: input.exerciseId,
    startedAt: input.startedAt,
    submittedAt,
    findings: input.findings,
    hintsUsed: input.hintsUsed,
  }

  await learnerStateRepository.save({
    ...learnerState,
    attempts: [...learnerState.attempts, attempt],
    updatedAt: submittedAt,
  })

  return attempt
}
