import { mvpCurriculum } from '../data/curriculum'
import { reactDerivedStateExercise } from '../data/exercises/reactDerivedState'
import type {
  ExerciseAttempt,
  LearnerState,
  LearnerStateRepository,
} from '../domain/learning/types'
import { createInitialLearnerState } from '../domain/learning/types'
import { evaluateReview } from '../domain/scoring/scoringEngine'
import { completeExerciseAttempt } from './completeExerciseAttempt'

class MemoryLearnerStateRepository implements LearnerStateRepository {
  constructor(public state: LearnerState) {}

  async load() {
    return this.state
  }

  async save(state: LearnerState) {
    this.state = state
  }

  async reset() {
    this.state = createInitialLearnerState()
  }
}

function createAttempt(): ExerciseAttempt {
  const findings = [
    {
      id: 'finding-1',
      fileId: 'task-list',
      locations: [{ startLine: 15 }],
      category: 'logic' as const,
      diagnosis: 'visibleTasks becomes stale when props change',
      createdAt: '2026-09-05T00:00:00.000Z',
    },
  ]

  return {
    id: 'attempt-1',
    exerciseId: reactDerivedStateExercise.id,
    startedAt: '2026-09-05T00:00:00.000Z',
    submittedAt: '2026-09-05T00:01:00.000Z',
    findings,
    hintsUsed: [],
    evaluation: evaluateReview(reactDerivedStateExercise, findings),
  }
}

describe('completeExerciseAttempt', () => {
  it('requires the learner to modify at least one file', async () => {
    const state = createInitialLearnerState()
    state.attempts = [createAttempt()]
    const repository = new MemoryLearnerStateRepository(state)

    await expect(
      completeExerciseAttempt(
        {
          attemptId: 'attempt-1',
          exercise: reactDerivedStateExercise,
          files: reactDerivedStateExercise.files,
          exercises: [reactDerivedStateExercise],
          curriculum: mvpCurriculum,
        },
        repository,
      ),
    ).rejects.toThrow(/change the code/i)
  })

  it('persists the fix and marks completion separately from review scoring', async () => {
    const state = createInitialLearnerState(
      new Date('2026-09-05T00:00:00.000Z'),
    )
    state.attempts = [createAttempt()]
    state.dailyMission = {
      date: '2026-09-05',
      exerciseIds: [reactDerivedStateExercise.id],
      completedExerciseIds: [],
      estimatedMinutes: 12,
    }
    const repository = new MemoryLearnerStateRepository(state)
    const fixedFiles = reactDerivedStateExercise.files.map((file) => ({
      ...file,
      content: file.content.replace(
        'const [visibleTasks] = useState(',
        'const visibleTasks = (',
      ),
    }))

    const attempt = await completeExerciseAttempt(
      {
        attemptId: 'attempt-1',
        exercise: reactDerivedStateExercise,
        files: fixedFiles,
        exercises: [reactDerivedStateExercise],
        curriculum: mvpCurriculum,
      },
      repository,
      new Date('2026-09-05T00:02:00.000Z'),
    )

    expect(attempt.evaluation?.completed).toBe(true)
    expect(attempt.fixSubmission?.files).toEqual(fixedFiles)
    expect(repository.state.completedExerciseIds).toEqual([
      reactDerivedStateExercise.id,
    ])
    expect(repository.state.curriculumCompletion).toBe(8)
    expect(repository.state.dailyMission?.completedExerciseIds).toEqual([
      reactDerivedStateExercise.id,
    ])
    expect(repository.state.mastery.overall).toBeDefined()
    expect(repository.state.mastery.byTrack.react).toBeDefined()
    expect(repository.state.streak).toMatchObject({
      currentDays: 1,
      longestDays: 1,
      lastActiveDate: '2026-09-05',
    })
    expect(repository.state.weeklyGoal).toMatchObject({
      targetExercises: 5,
      completedExercises: 1,
    })
  })
})
