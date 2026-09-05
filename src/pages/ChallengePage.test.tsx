import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { mvpCurriculum } from '../data/curriculum'
import { reactDerivedStateExercise } from '../data/exercises/reactDerivedState'
import type { SubmitReviewInput } from '../services/submitReviewAttempt'
import { ChallengePage } from './ChallengePage'

const { submitReviewAttempt } = vi.hoisted(() => ({
  submitReviewAttempt: vi.fn(async (input: SubmitReviewInput) => ({
    id: crypto.randomUUID(),
    exerciseId: input.exercise.id,
    startedAt: input.startedAt,
    submittedAt: '2026-09-05T12:00:00.000Z',
    findings: input.findings,
    hintsUsed: input.hintsUsed,
    evaluation: {
      technicalScore: 100,
      communicationScore: 100,
      findingResults: input.findings.map((finding) => ({
        learnerFindingId: finding.id,
        expectedFindingId: input.exercise.expectedFindings[0]?.id,
        detection: 1,
        category: 1,
        diagnosis: 1,
        reasoning: 1,
        fix: 1,
        communication: 1,
        status: 'strong' as const,
      })),
      conceptsFound: input.exercise.concepts,
      conceptsMissed: [],
      assistanceLevel: 0,
      completed: false,
    },
  })),
}))

vi.mock('../services/submitReviewAttempt', () => ({ submitReviewAttempt }))
vi.mock('../repositories', () => ({ learnerStateRepository: {} }))

function renderChallenge() {
  const router = createMemoryRouter(
    [
      {
        path: '/challenge/:exerciseId',
        loader: () => ({
          exercise: reactDerivedStateExercise,
          exercises: [reactDerivedStateExercise],
          curriculum: mvpCurriculum,
        }),
        element: <ChallengePage />,
      },
    ],
    { initialEntries: [`/challenge/${reactDerivedStateExercise.id}`] },
  )

  render(<RouterProvider router={router} />)
}

async function addFindingAndFinish(diagnosis: string) {
  fireEvent.click(await screen.findByRole('button', { name: /Select line 1:/ }))
  fireEvent.change(screen.getByLabelText(/What did you notice/), {
    target: { value: diagnosis },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Add finding' }))
  fireEvent.click(screen.getByRole('button', { name: /Finish review/ }))
}

describe('ChallengePage', () => {
  it('keeps hints as an array after retrying without a hint', async () => {
    submitReviewAttempt.mockClear()
    renderChallenge()

    await addFindingAndFinish('The first review finding.')
    await screen.findByRole('heading', {
      name: 'Your review has been evaluated.',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await addFindingAndFinish('The retried review finding.')

    await waitFor(() => expect(submitReviewAttempt).toHaveBeenCalledTimes(2))
    expect(submitReviewAttempt.mock.calls[1]?.[0].hintsUsed).toEqual([])
  })
})
