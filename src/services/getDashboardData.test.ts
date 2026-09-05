import { mvpCurriculum } from '../data/curriculum'
import { reactDerivedStateExercise } from '../data/exercises/reactDerivedState'
import { starterExercisePack } from '../data/exercises/starterExercisePack'
import type {
  LearnerState,
  LearnerStateRepository,
} from '../domain/learning/types'
import { createInitialLearnerState } from '../domain/learning/types'
import { LocalExerciseRepository } from '../repositories/LocalExerciseRepository'
import { getDashboardData } from './getDashboardData'

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

describe('getDashboardData', () => {
  it('builds a mission and persists synchronised progress state', async () => {
    const exerciseRepository = new LocalExerciseRepository(
      [reactDerivedStateExercise, ...starterExercisePack],
      mvpCurriculum,
    )
    const learnerStateRepository = new MemoryLearnerStateRepository(
      createInitialLearnerState(new Date('2026-09-05T00:00:00.000Z')),
    )

    const result = await getDashboardData(
      exerciseRepository,
      learnerStateRepository,
      new Date('2026-09-05T12:00:00.000Z'),
    )

    expect(result.learnerState.dailyMission).toMatchObject({
      date: '2026-09-05',
      exerciseIds: [
        reactDerivedStateExercise.id,
        'javascript-strict-equality-01',
        'javascript-map-return-01',
      ],
      completedExerciseIds: [],
    })
    expect(result.progress.byTrack).toHaveLength(10)
    expect(result.progress.byLevel).toHaveLength(3)
    expect(learnerStateRepository.state.weeklyGoal).toMatchObject({
      weekStart: '2026-08-31',
      targetExercises: 5,
      completedExercises: 0,
    })
    expect(learnerStateRepository.state.unlocks).toContain('track:react')
  })
})
