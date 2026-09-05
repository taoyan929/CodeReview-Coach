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
          const [exercise, exercises, curriculum] = await Promise.all([
            params.exerciseId
              ? exerciseRepository.getExercise(params.exerciseId)
              : null,
            exerciseRepository.listExercises(),
            exerciseRepository.getCurriculum(),
          ])

          if (!exercise) {
            throw new Response('Exercise not found', { status: 404 })
          }

          return { exercise, exercises, curriculum }
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
