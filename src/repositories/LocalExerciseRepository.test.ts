import { foundationPreviewCurriculum } from '../data/curriculum'
import { reactDerivedStateExercise } from '../data/exercises/reactDerivedState'
import { LocalExerciseRepository } from './LocalExerciseRepository'

describe('LocalExerciseRepository', () => {
  it('filters exercises by track', async () => {
    const repository = new LocalExerciseRepository(
      [reactDerivedStateExercise],
      foundationPreviewCurriculum,
    )

    await expect(
      repository.listExercises({ track: 'react' }),
    ).resolves.toHaveLength(1)
    await expect(
      repository.listExercises({ track: 'python' }),
    ).resolves.toEqual([])
  })

  it('fails when curriculum content is missing', () => {
    const invalidCurriculum = {
      ...foundationPreviewCurriculum,
      levels: [
        {
          ...foundationPreviewCurriculum.levels[0]!,
          exerciseIds: ['missing-exercise'],
        },
      ],
    }

    expect(
      () =>
        new LocalExerciseRepository(
          [reactDerivedStateExercise],
          invalidCurriculum,
        ),
    ).toThrow(/unknown exercise/)
  })
})
