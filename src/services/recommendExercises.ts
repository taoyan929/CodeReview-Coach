import type {
  Exercise,
  LearningLevel,
  MissionType,
} from '../domain/exercise/types'
import type { LearnerState, Recommendation } from '../domain/learning/types'
import type { LearningProgressSnapshot } from './deriveLearningProgress'

const LOW_SCORE = 65
const HIGH_SCORE = 85
const STALE_WEAK_DAYS = 7
const LEVEL_ORDER: Record<LearningLevel, number> = {
  literacy: 0,
  'technology-review': 1,
  'software-engineering-review': 2,
}

export interface RecommendationContext {
  exercises: Exercise[]
  learnerState: LearnerState
  progress: LearningProgressSnapshot
  now?: Date
  limit?: number
}

interface ScoredCandidate {
  exercise: Exercise
  score: number
  reasonCode: string
  reasonText: string
  sourceIndex: number
}

function label(value: string) {
  return value.replaceAll('-', ' ')
}

function daysSince(value: string | undefined, now: Date) {
  if (!value) return undefined
  return Math.floor((now.getTime() - new Date(value).getTime()) / 86_400_000)
}

function isUnlocked(exercise: Exercise, unlocks: string[]) {
  if (!unlocks.includes(`level:${exercise.level}`)) return false
  return (
    exercise.missionType !== 'boss-review' ||
    unlocks.includes('mission:boss-review')
  )
}

function prerequisitesMet(exercise: Exercise, completed: Set<string>) {
  return (exercise.prerequisites ?? []).every((id) => completed.has(id))
}

function recentMissionTypes(learnerState: LearnerState, exercises: Exercise[]) {
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]))

  return learnerState.attempts
    .filter(({ submittedAt }) => Boolean(submittedAt))
    .sort((left, right) =>
      (right.submittedAt ?? '').localeCompare(left.submittedAt ?? ''),
    )
    .slice(0, 4)
    .flatMap(({ exerciseId }) => {
      const missionType = byId.get(exerciseId)?.missionType
      return missionType ? [missionType] : []
    })
}

function missionTypeCount(types: MissionType[], missionType: MissionType) {
  return types.filter((type) => type === missionType).length
}

export function recommendExercises({
  exercises,
  learnerState,
  progress,
  now = new Date(),
  limit = 3,
}: RecommendationContext): Recommendation[] {
  const completed = new Set(learnerState.completedExerciseIds)
  const weakConcepts = new Map(
    progress.weakConcepts.map((weak) => [weak.concept, weak]),
  )
  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  )
  const recentTypes = recentMissionTypes(learnerState, exercises)
  const latestScoredAttempt = learnerState.attempts
    .filter(({ evaluation, submittedAt }) => evaluation && submittedAt)
    .sort((left, right) =>
      (right.submittedAt ?? '').localeCompare(left.submittedAt ?? ''),
    )[0]
  const latestExercise = latestScoredAttempt
    ? exerciseById.get(latestScoredAttempt.exerciseId)
    : undefined
  const latestScore = latestScoredAttempt?.evaluation?.technicalScore
  const latestConcepts = new Set([
    ...(latestScoredAttempt?.evaluation?.conceptsFound ?? []),
    ...(latestScoredAttempt?.evaluation?.conceptsMissed ?? []),
  ])

  const candidates: ScoredCandidate[] = exercises.flatMap(
    (exercise, sourceIndex) => {
      if (
        !isUnlocked(exercise, progress.unlocks) ||
        !prerequisitesMet(exercise, completed)
      ) {
        return []
      }

      const matchingWeak = exercise.concepts
        .map((concept) => weakConcepts.get(concept))
        .filter((value) => Boolean(value))
        .sort((left, right) => right!.priority - left!.priority)[0]
      const isCompleted = completed.has(exercise.id)

      if (isCompleted && !matchingWeak) return []

      let score = 100
      score -= LEVEL_ORDER[exercise.level] * 15
      score -= exercise.difficulty * 3
      score += isCompleted ? -35 : 25
      score -= missionTypeCount(recentTypes, exercise.missionType) * 18

      let reasonCode = 'next-foundation'
      let reasonText = `Continue your ${label(exercise.track)} foundations with an available challenge.`

      if (learnerState.profile.preferredTracks.includes(exercise.track)) {
        score += 12
        reasonCode = 'preferred-track'
        reasonText = `This matches your ${label(exercise.track)} learning preference.`
      }

      const sameRecentConcept = exercise.concepts.some((concept) =>
        latestConcepts.has(concept),
      )
      const sameRecentTrack = latestExercise?.track === exercise.track

      if (
        latestScore !== undefined &&
        latestScore < LOW_SCORE &&
        latestExercise &&
        (sameRecentConcept || sameRecentTrack) &&
        exercise.difficulty <= latestExercise.difficulty
      ) {
        score += sameRecentConcept ? 65 : 35
        reasonCode = 'recover-low-score'
        reasonText = `Your last ${label(latestExercise.track)} review scored ${latestScore}%. Reinforce it at the same or an easier difficulty.`
      }

      if (
        latestScore !== undefined &&
        latestScore >= HIGH_SCORE &&
        latestScoredAttempt?.hintsUsed.length === 0 &&
        latestExercise &&
        sameRecentTrack &&
        exercise.difficulty > latestExercise.difficulty
      ) {
        score += 55
        reasonCode = 'increase-difficulty'
        reasonText = `You scored ${latestScore}% without hints. Move up in ${label(exercise.track)} difficulty.`
      }

      if (matchingWeak) {
        const daysSincePractice = daysSince(matchingWeak.lastPractisedAt, now)
        const stale =
          daysSincePractice === undefined ||
          daysSincePractice >= STALE_WEAK_DAYS
        score += 90 + matchingWeak.priority + (stale ? 25 : 0)
        reasonCode = stale ? 'refresh-weak-concept' : 'weak-concept'
        reasonText = stale
          ? daysSincePractice === undefined
            ? `${label(matchingWeak.concept)} is still weak and needs another practice.`
            : `${label(matchingWeak.concept)} is still weak and has not been practised for ${daysSincePractice} days.`
          : `You missed ${label(matchingWeak.concept)} ${matchingWeak.missCount} ${matchingWeak.missCount === 1 ? 'time' : 'times'} recently.`
      }

      return [{ exercise, score, reasonCode, reasonText, sourceIndex }]
    },
  )

  const selected: Recommendation[] = []
  const selectedTypes: MissionType[] = []
  const remaining = [...candidates]
  let selectedMinutes = 0

  while (
    selected.length < Math.max(0, Math.min(3, limit)) &&
    remaining.length
  ) {
    remaining.sort((left, right) => {
      const leftScore =
        left.score -
        missionTypeCount(selectedTypes, left.exercise.missionType) * 30
      const rightScore =
        right.score -
        missionTypeCount(selectedTypes, right.exercise.missionType) * 30

      return rightScore - leftScore || left.sourceIndex - right.sourceIndex
    })
    const candidate = remaining.shift()!
    const exceedsDailyTarget =
      selected.length > 0 &&
      selectedMinutes + candidate.exercise.estimatedMinutes >
        learnerState.profile.dailyTargetMinutes
    const hasUsefulSession =
      selectedMinutes >= learnerState.profile.dailyTargetMinutes * 0.6

    if (exceedsDailyTarget && hasUsefulSession) continue

    const adjustedScore =
      candidate.score -
      missionTypeCount(selectedTypes, candidate.exercise.missionType) * 30
    selected.push({
      exerciseId: candidate.exercise.id,
      score: adjustedScore,
      reasonCode: candidate.reasonCode,
      reasonText: candidate.reasonText,
    })
    selectedTypes.push(candidate.exercise.missionType)
    selectedMinutes += candidate.exercise.estimatedMinutes
  }

  return selected
}
