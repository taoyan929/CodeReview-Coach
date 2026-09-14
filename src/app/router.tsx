import { createBrowserRouter } from 'react-router-dom'

import { ChallengePage } from '../pages/ChallengePage'
import { DashboardPage } from '../pages/DashboardPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { AppErrorPage } from '../pages/AppErrorPage'
import { exerciseRepository, learnerStateRepository } from '../repositories'
import { getDashboardData } from '../services/getDashboardData'
import { AppShell } from './AppShell'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <AppErrorPage />,
    children: [
      {
        index: true,
        loader: () =>
          getDashboardData(exerciseRepository, learnerStateRepository),
        element: <DashboardPage />,
      },
      {
        path: 'challenge/:exerciseId',
        loader: async ({ params }) => {
          const [exercise, exercises, curriculum, learnerState] =
            await Promise.all([
              params.exerciseId
                ? exerciseRepository.getExercise(params.exerciseId)
                : null,
              exerciseRepository.listExercises(),
              exerciseRepository.getCurriculum(),
              learnerStateRepository.load(),
            ])

          if (!exercise) {
            throw new Response('Exercise not found', { status: 404 })
          }

          const latestAttempt = learnerState.attempts
            .filter((attempt) => attempt.exerciseId === exercise.id)
            .sort((left, right) =>
              (right.submittedAt ?? '').localeCompare(left.submittedAt ?? ''),
            )[0]
          const existingAttempt =
            latestAttempt?.evaluation && !latestAttempt.completedAt
              ? latestAttempt
              : undefined

          return { exercise, exercises, curriculum, existingAttempt }
        },
        element: <ChallengePage />,
        errorElement: <NotFoundPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
