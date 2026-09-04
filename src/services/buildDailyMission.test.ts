import { reactDerivedStateExercise } from '../data/exercises/reactDerivedState'
import { buildDailyMission } from './buildDailyMission'

describe('buildDailyMission', () => {
  it('selects incomplete exercises and totals their duration', () => {
    const mission = buildDailyMission(
      [reactDerivedStateExercise],
      [],
      new Date('2026-09-04T12:00:00.000Z'),
    )

    expect(mission).toEqual({
      date: '2026-09-04',
      exerciseIds: ['react-derived-state-01'],
      completedExerciseIds: [],
      estimatedMinutes: 12,
    })
  })

  it('does not recommend completed exercises', () => {
    const mission = buildDailyMission(
      [reactDerivedStateExercise],
      ['react-derived-state-01'],
      new Date('2026-09-04T12:00:00.000Z'),
    )

    expect(mission.exerciseIds).toEqual([])
  })
})
