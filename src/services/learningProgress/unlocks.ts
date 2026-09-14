import { learningRules } from '../../config/learningRules'
import type { Exercise, LearningLevel } from '../../domain/exercise/types'
import type { ProgressBreakdown, ScoredAttempt } from './types'

export function collectUnlocks(
  exercises: Exercise[],
  byLevel: ProgressBreakdown<LearningLevel>[],
  scored: ScoredAttempt[],
  curriculumCompletion: number,
  reviewMastery?: number,
) {
  const unlocks = new Set<string>(['level:literacy'])
  const literacy = byLevel.find(({ id }) => id === 'literacy')
  const technology = byLevel.find(({ id }) => id === 'technology-review')
  const hasStarted = (level: LearningLevel) =>
    scored.some(({ exercise }) => exercise.level === level)
  if (
    hasStarted('technology-review') ||
    ((literacy?.completion ?? 0) >=
      learningRules.unlocks.technologyReview.completion &&
      (literacy?.mastery ?? 0) >=
        learningRules.unlocks.technologyReview.mastery)
  )
    unlocks.add('level:technology-review')
  if (
    hasStarted('software-engineering-review') ||
    ((technology?.completion ?? 0) >=
      learningRules.unlocks.softwareEngineeringReview.completion &&
      (technology?.mastery ?? 0) >=
        learningRules.unlocks.softwareEngineeringReview.mastery)
  )
    unlocks.add('level:software-engineering-review')
  for (const exercise of exercises.filter(({ level }) =>
    unlocks.has(`level:${level}`),
  )) {
    unlocks.add(`track:${exercise.track}`)
    exercise.secondaryTracks?.forEach((track) => unlocks.add(`track:${track}`))
  }
  if (
    exercises.some(({ missionType }) => missionType === 'boss-review') &&
    unlocks.has('level:software-engineering-review') &&
    curriculumCompletion >=
      learningRules.unlocks.bossReview.curriculumCompletion &&
    (reviewMastery ?? 0) >= learningRules.unlocks.bossReview.mastery
  )
    unlocks.add('mission:boss-review')
  return [...unlocks].sort()
}
