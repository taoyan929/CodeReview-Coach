import type {
  LearnerState,
  LearnerStateRepository,
} from '../domain/learning/types'
import { createInitialLearnerState } from '../domain/learning/types'
import { submitReviewAttempt } from './submitReviewAttempt'

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

describe('submitReviewAttempt', () => {
  it('persists a submitted attempt without prematurely marking completion', async () => {
    const initialState = createInitialLearnerState(
      new Date('2026-09-05T00:00:00.000Z'),
    )
    const repository = new MemoryLearnerStateRepository(initialState)

    const attempt = await submitReviewAttempt(
      {
        exerciseId: 'react-derived-state-01',
        startedAt: '2026-09-05T00:01:00.000Z',
        findings: [
          {
            id: 'finding-1',
            fileId: 'task-list',
            location: { startLine: 15, endLine: 17 },
            category: 'logic',
            diagnosis: 'The list becomes stale when props change.',
            createdAt: '2026-09-05T00:02:00.000Z',
          },
        ],
        hintsUsed: [],
      },
      repository,
      new Date('2026-09-05T00:03:00.000Z'),
      () => 'attempt-1',
    )

    expect(attempt.id).toBe('attempt-1')
    expect(attempt.submittedAt).toBe('2026-09-05T00:03:00.000Z')
    expect(repository.state.attempts).toEqual([attempt])
    expect(repository.state.completedExerciseIds).toEqual([])
    expect(repository.state.curriculumCompletion).toBe(0)
  })

  it('rejects empty reviews', async () => {
    const repository = new MemoryLearnerStateRepository(
      createInitialLearnerState(),
    )

    await expect(
      submitReviewAttempt(
        {
          exerciseId: 'react-derived-state-01',
          startedAt: '2026-09-05T00:01:00.000Z',
          findings: [],
          hintsUsed: [],
        },
        repository,
      ),
    ).rejects.toThrow(/at least one finding/i)
  })
})
