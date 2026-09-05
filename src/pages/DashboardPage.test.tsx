import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { vi } from 'vitest'

import { foundationPreviewCurriculum } from '../data/curriculum'
import { reactDerivedStateExercise } from '../data/exercises/reactDerivedState'
import { createInitialLearnerState } from '../domain/learning/types'
import { deriveLearningProgress } from '../services/deriveLearningProgress'
import { DashboardPage } from './DashboardPage'

const { reset } = vi.hoisted(() => ({
  reset: vi.fn(async () => undefined),
}))

vi.mock('../repositories', () => ({
  learnerStateRepository: { reset },
}))

function renderDashboard() {
  const learnerState = createInitialLearnerState(
    new Date('2026-09-05T00:00:00.000Z'),
  )
  learnerState.dailyMission = {
    date: '2026-09-05',
    exerciseIds: [reactDerivedStateExercise.id],
    completedExerciseIds: [],
    estimatedMinutes: 12,
  }
  const progress = deriveLearningProgress(
    learnerState,
    [reactDerivedStateExercise],
    foundationPreviewCurriculum,
    new Date('2026-09-05T12:00:00.000Z'),
  )
  const router = createMemoryRouter([
    {
      path: '/',
      loader: () => ({
        exercises: [reactDerivedStateExercise],
        learnerState,
        progress,
      }),
      element: <DashboardPage />,
    },
  ])

  render(<RouterProvider router={router} />)
}

describe('DashboardPage', () => {
  it('shows completion, mastery, all tracks and learning-level unlocks', async () => {
    renderDashboard()

    expect(await screen.findByText('Curriculum completion')).toBeVisible()
    expect(screen.getByText('Review mastery')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'JavaScript' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'FastAPI' })).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'MongoDB / Cosmos DB' }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Full-Stack Boss Review' }),
    ).toBeVisible()
  })

  it('requires a second click before resetting local progress', async () => {
    reset.mockClear()
    renderDashboard()
    const resetButton = await screen.findByRole('button', {
      name: 'Reset progress',
    })

    fireEvent.click(resetButton)

    expect(reset).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Confirm reset' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Confirm reset' }))

    await waitFor(() => expect(reset).toHaveBeenCalledTimes(1))
  })
})
