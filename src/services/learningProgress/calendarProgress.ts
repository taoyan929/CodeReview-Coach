import { learningRules } from '../../config/learningRules'
import type {
  ExerciseAttempt,
  StreakState,
  WeeklyGoalState,
} from '../../domain/learning/types'
import {
  calendarDateKey,
  calendarWeekStartKey,
  daysBetweenDateKeys,
} from '../../utils/calendar'

export function calculateStreak(
  attempts: ExerciseAttempt[],
  now: Date,
  timeZone?: string,
): StreakState {
  const activityDates = [
    ...new Set(
      attempts
        .map(
          ({ completedAt }) =>
            completedAt && calendarDateKey(completedAt, timeZone),
        )
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort()
  if (!activityDates.length)
    return { currentDays: 0, longestDays: 0, activityDates: [] }
  let longestDays = 1
  let currentRun = 1
  for (let index = 1; index < activityDates.length; index += 1) {
    if (
      daysBetweenDateKeys(activityDates[index]!, activityDates[index - 1]!) ===
      1
    ) {
      currentRun += 1
      longestDays = Math.max(longestDays, currentRun)
    } else currentRun = 1
  }
  const lastActiveDate = activityDates.at(-1)
  const currentDays =
    lastActiveDate &&
    daysBetweenDateKeys(calendarDateKey(now, timeZone), lastActiveDate) <= 1
      ? currentRun
      : 0
  return { currentDays, longestDays, lastActiveDate, activityDates }
}

export function calculateWeeklyGoal(
  attempts: ExerciseAttempt[],
  now: Date,
  existingGoal?: WeeklyGoalState,
  timeZone?: string,
): WeeklyGoalState {
  const weekStart = calendarWeekStartKey(now, timeZone)
  return {
    weekStart,
    targetExercises:
      existingGoal?.weekStart === weekStart
        ? existingGoal.targetExercises
        : learningRules.weeklyTargetExercises,
    completedExercises: attempts.filter(
      ({ completedAt }) =>
        completedAt && calendarDateKey(completedAt, timeZone) >= weekStart,
    ).length,
  }
}
