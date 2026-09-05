import { mvpCurriculum } from '../data/curriculum'
import { reactDerivedStateExercise } from '../data/exercises/reactDerivedState'
import type { ExerciseAttempt, LearnerState } from '../domain/learning/types'
import { createInitialLearnerState } from '../domain/learning/types'
import {
  calculateAttemptMastery,
  deriveLearningProgress,
  synchroniseLearnerProgress,
} from './deriveLearningProgress'

function attempt(overrides: Partial<ExerciseAttempt> = {}): ExerciseAttempt {
  return {
    id: 'attempt-1',
    exerciseId: reactDerivedStateExercise.id,
    startedAt: '2026-09-05T00:00:00.000Z',
    submittedAt: '2026-09-05T00:01:00.000Z',
    findings: [],
    hintsUsed: [],
    evaluation: {
      technicalScore: 80,
      communicationScore: 70,
      findingResults: [],
      conceptsFound: ['derived-state', 'render-calculation'],
      conceptsMissed: [],
      assistanceLevel: 0,
      completed: false,
    },
    ...overrides,
  }
}

function progressFor(
  learnerState: LearnerState,
  now = new Date('2026-09-05T12:00:00.000Z'),
) {
  return deriveLearningProgress(
    learnerState,
    [reactDerivedStateExercise],
    mvpCurriculum,
    now,
  )
}

describe('deriveLearningProgress', () => {
  it('shows every planned track and learning level before there is activity', () => {
    const progress = progressFor(createInitialLearnerState())

    expect(progress.byTrack).toHaveLength(10)
    expect(progress.byLevel).toHaveLength(3)
    expect(progress.curriculumCompletion).toBe(0)
    expect(progress.reviewMastery).toBeUndefined()
    expect(progress.byTrack.find(({ id }) => id === 'react')).toMatchObject({
      status: 'available',
      totalExercises: 1,
    })
    expect(progress.byTrack.find(({ id }) => id === 'python')).toMatchObject({
      status: 'locked',
      totalExercises: 0,
    })
    expect(progress.bossReviewStatus).toBe('locked')
  })

  it('keeps completion separate from review mastery across tracks and levels', () => {
    const completedAttempt = attempt({
      completedAt: '2026-09-05T00:03:00.000Z',
      fixSubmission: {
        files: reactDerivedStateExercise.referenceSolution ?? [],
        submittedAt: '2026-09-05T00:03:00.000Z',
      },
      evaluation: {
        ...attempt().evaluation!,
        completed: true,
      },
    })
    const state = createInitialLearnerState()
    state.attempts = [completedAttempt]
    state.completedExerciseIds = [reactDerivedStateExercise.id]

    const progress = progressFor(state)

    expect(calculateAttemptMastery(completedAttempt)).toBe(85)
    expect(progress.curriculumCompletion).toBe(8)
    expect(progress.reviewMastery).toBe(85)
    expect(progress.byTrack.find(({ id }) => id === 'react')).toMatchObject({
      completion: 100,
      mastery: 85,
      status: 'complete',
    })
    expect(
      progress.byTrack.find(({ id }) => id === 'typescript'),
    ).toMatchObject({ completion: 100, mastery: 85 })
    expect(
      progress.byLevel.find(({ id }) => id === 'technology-review'),
    ).toMatchObject({ completion: 100, mastery: 85 })
  })

  it('identifies weak concepts and weak tracks from missed evaluations', () => {
    const state = createInitialLearnerState()
    state.attempts = [
      attempt({
        evaluation: {
          ...attempt().evaluation!,
          technicalScore: 30,
          conceptsFound: [],
          conceptsMissed: ['derived-state'],
        },
      }),
    ]

    const progress = progressFor(state)

    expect(progress.weakConcepts).toEqual([
      expect.objectContaining({ concept: 'derived-state', missCount: 1 }),
    ])
    expect(progress.weakTracks).toEqual(['typescript', 'react'])
  })

  it('calculates recent activity, streaks and the current weekly goal', () => {
    const state = createInitialLearnerState()
    state.attempts = [
      attempt({
        id: 'attempt-1',
        completedAt: '2026-09-03T10:00:00.000Z',
      }),
      attempt({
        id: 'attempt-2',
        completedAt: '2026-09-04T10:00:00.000Z',
      }),
      attempt({
        id: 'attempt-3',
        completedAt: '2026-09-05T10:00:00.000Z',
      }),
    ]

    const progress = progressFor(state)

    expect(progress.streak).toMatchObject({
      currentDays: 3,
      longestDays: 3,
      lastActiveDate: '2026-09-05',
    })
    expect(progress.weeklyGoal).toMatchObject({
      weekStart: '2026-08-31',
      targetExercises: 5,
      completedExercises: 3,
    })
    expect(progress.recentActivity.map(({ attemptId }) => attemptId)).toEqual([
      'attempt-3',
      'attempt-2',
      'attempt-1',
    ])
  })

  it('synchronises derived metrics into the versioned persisted state', () => {
    const state = createInitialLearnerState()
    state.attempts = [attempt()]

    const synchronised = synchroniseLearnerProgress(
      state,
      [reactDerivedStateExercise],
      mvpCurriculum,
      new Date('2026-09-05T12:00:00.000Z'),
    )

    expect(synchronised.mastery).toMatchObject({
      overall: 70,
      byTrack: { react: 70, typescript: 70 },
      byLevel: { 'technology-review': 70 },
      byConcept: { 'derived-state': 70, 'render-calculation': 70 },
    })
    expect(synchronised.weeklyGoal?.targetExercises).toBe(5)
    expect(synchronised.unlocks).toEqual(
      expect.arrayContaining([
        'level:literacy',
        'level:technology-review',
        'track:react',
        'track:typescript',
      ]),
    )
  })
})
