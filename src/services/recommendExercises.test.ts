import type { Curriculum, Exercise } from '../domain/exercise/types'
import type { ExerciseAttempt } from '../domain/learning/types'
import { createInitialLearnerState } from '../domain/learning/types'
import { deriveLearningProgress } from './deriveLearningProgress'
import { recommendExercises } from './recommendExercises'

const baseExercise: Exercise = {
  id: 'intro',
  version: 1,
  title: 'Intro review',
  track: 'javascript',
  topics: ['correctness'],
  concepts: ['strict-equality'],
  level: 'literacy',
  difficulty: 1,
  missionType: 'standard-review',
  estimatedMinutes: 8,
  requirement: { summary: 'Review the code.' },
  files: [],
  expectedFindings: [],
  hints: [],
  prerequisites: [],
  curriculumWeight: 10,
}

function exercise(overrides: Partial<Exercise>): Exercise {
  return { ...baseExercise, ...overrides }
}

function curriculum(exercises: Exercise[]): Curriculum {
  return {
    id: 'test',
    version: 1,
    totalWeight: exercises.reduce(
      (total, item) => total + item.curriculumWeight,
      0,
    ),
    levels: [],
  }
}

function scoredAttempt(
  score: number,
  overrides: Partial<ExerciseAttempt> = {},
): ExerciseAttempt {
  return {
    id: 'attempt-1',
    exerciseId: 'intro',
    answerMode: 'full-review',
    startedAt: '2026-09-05T08:00:00.000Z',
    submittedAt: '2026-09-05T08:05:00.000Z',
    findings: [],
    hintsUsed: [],
    evaluation: {
      technicalScore: score,
      findingResults: [],
      conceptsFound: ['strict-equality'],
      conceptsMissed: [],
      assistanceLevel: 0,
      completed: false,
    },
    ...overrides,
  }
}

function recommend(
  exercises: Exercise[],
  state = createInitialLearnerState(new Date('2026-09-05T00:00:00.000Z')),
) {
  const progress = deriveLearningProgress(
    state,
    exercises,
    curriculum(exercises),
    new Date('2026-09-05T12:00:00.000Z'),
  )

  return recommendExercises({
    exercises,
    learnerState: state,
    progress,
    now: new Date('2026-09-05T12:00:00.000Z'),
  })
}

describe('recommendExercises', () => {
  it('gives a brand-new learner a deterministic Level 1 path', () => {
    const exercises = [
      baseExercise,
      exercise({
        id: 'locked-prerequisite',
        prerequisites: ['missing'],
        missionType: 'quick-fix',
      }),
      exercise({
        id: 'locked-level',
        level: 'technology-review',
        difficulty: 2,
      }),
      exercise({ id: 'second', missionType: 'bug-hunt' }),
    ]

    expect(recommend(exercises).map(({ exerciseId }) => exerciseId)).toEqual([
      'intro',
      'second',
    ])
    expect(recommend(exercises)).toEqual(recommend(exercises))
  })

  it('prioritises a repeatedly missed concept with an explicit reason', () => {
    const state = createInitialLearnerState()
    state.attempts = [
      scoredAttempt(35, {
        evaluation: {
          ...scoredAttempt(35).evaluation!,
          conceptsFound: [],
          conceptsMissed: ['strict-equality'],
        },
      }),
      scoredAttempt(30, {
        id: 'attempt-2',
        submittedAt: '2026-09-05T09:00:00.000Z',
        evaluation: {
          ...scoredAttempt(30).evaluation!,
          conceptsFound: [],
          conceptsMissed: ['strict-equality'],
        },
      }),
    ]

    expect(recommend([baseExercise], state)[0]).toMatchObject({
      exerciseId: 'intro',
      reasonCode: 'weak-concept',
      reasonText: 'You missed strict equality 2 times recently.',
    })
  })

  it('steps down after a low score on the same concept', () => {
    const hard = exercise({ id: 'hard', difficulty: 2 })
    const easier = exercise({
      id: 'easier',
      difficulty: 1,
      missionType: 'quick-fix',
    })
    const state = createInitialLearnerState()
    state.attempts = [scoredAttempt(55, { exerciseId: 'hard' })]

    expect(recommend([hard, easier], state)[0]).toMatchObject({
      exerciseId: 'easier',
      reasonCode: 'recover-low-score',
    })
  })

  it('surfaces a stale weak concept again', () => {
    const state = createInitialLearnerState()
    state.attempts = [
      scoredAttempt(35, {
        submittedAt: '2026-08-20T08:05:00.000Z',
        evaluation: {
          ...scoredAttempt(35).evaluation!,
          conceptsFound: [],
          conceptsMissed: ['strict-equality'],
        },
      }),
    ]

    expect(recommend([baseExercise], state)[0]).toMatchObject({
      reasonCode: 'refresh-weak-concept',
    })
  })

  it('moves a strong independent learner to a harder unlocked exercise', () => {
    const harder = exercise({
      id: 'harder',
      level: 'technology-review',
      difficulty: 2,
      missionType: 'bug-hunt',
    })
    const state = createInitialLearnerState()
    state.attempts = [
      scoredAttempt(95, {
        completedAt: '2026-09-05T08:10:00.000Z',
        evaluation: { ...scoredAttempt(95).evaluation!, completed: true },
      }),
    ]
    state.completedExerciseIds = ['intro']

    expect(recommend([baseExercise, harder], state)[0]).toMatchObject({
      exerciseId: 'harder',
      reasonCode: 'increase-difficulty',
    })
  })

  it('penalises repeated mission types while assembling the mission', () => {
    const recommendations = recommend([
      baseExercise,
      exercise({ id: 'same-type' }),
      exercise({ id: 'different-type', missionType: 'bug-hunt' }),
    ])

    expect(
      recommendations.slice(0, 2).map(({ exerciseId }) => exerciseId),
    ).toEqual(['intro', 'different-type'])
  })

  it('keeps the mission within the learner daily target after a useful task', () => {
    const state = createInitialLearnerState()
    state.profile.dailyTargetMinutes = 10

    expect(
      recommend(
        [baseExercise, exercise({ id: 'second', missionType: 'bug-hunt' })],
        state,
      ),
    ).toHaveLength(1)
  })
})
