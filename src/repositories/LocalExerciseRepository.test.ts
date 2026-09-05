import { mvpCurriculum } from '../data/curriculum'
import { reactDerivedStateExercise } from '../data/exercises/reactDerivedState'
import { starterExercisePack } from '../data/exercises/starterExercisePack'
import { LocalExerciseRepository } from './LocalExerciseRepository'

const exercises = [reactDerivedStateExercise, ...starterExercisePack]

describe('LocalExerciseRepository', () => {
  it('filters exercises by track', async () => {
    const repository = new LocalExerciseRepository(exercises, mvpCurriculum)

    await expect(
      repository.listExercises({ track: 'react' }),
    ).resolves.toHaveLength(4)
    await expect(
      repository.listExercises({ track: 'python' }),
    ).resolves.toHaveLength(2)
  })

  it('fails when curriculum content is missing', () => {
    const invalidCurriculum = {
      ...mvpCurriculum,
      levels: [
        {
          ...mvpCurriculum.levels[0]!,
          exerciseIds: ['missing-exercise'],
        },
      ],
    }

    expect(
      () => new LocalExerciseRepository(exercises, invalidCurriculum),
    ).toThrow(/unknown exercise/)
  })
})
