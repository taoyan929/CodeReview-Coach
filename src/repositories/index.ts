import { mvpCurriculum } from '../data/curriculum'
import { reactDerivedStateExercise } from '../data/exercises/reactDerivedState'
import { starterExercisePack } from '../data/exercises/starterExercisePack'
import { LocalExerciseRepository } from './LocalExerciseRepository'
import { LocalStorageLearnerStateRepository } from './LocalStorageLearnerStateRepository'

export const exerciseRepository = new LocalExerciseRepository(
  [reactDerivedStateExercise, ...starterExercisePack],
  mvpCurriculum,
)

export const learnerStateRepository = new LocalStorageLearnerStateRepository()
