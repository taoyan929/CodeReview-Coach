import { foundationPreviewCurriculum } from '../data/curriculum'
import { reactDerivedStateExercise } from '../data/exercises/reactDerivedState'
import { LocalExerciseRepository } from './LocalExerciseRepository'
import { LocalStorageLearnerStateRepository } from './LocalStorageLearnerStateRepository'

export const exerciseRepository = new LocalExerciseRepository(
  [reactDerivedStateExercise],
  foundationPreviewCurriculum,
)

export const learnerStateRepository = new LocalStorageLearnerStateRepository()
