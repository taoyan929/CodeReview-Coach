import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { reactDerivedStateExercise } from '../../data/exercises/reactDerivedState'
import type { CodeFile } from '../../domain/exercise/types'
import type { ExerciseAttempt } from '../../domain/learning/types'
import { FixCodeStep } from './FixCodeStep'

const attempt: ExerciseAttempt = {
  id: 'attempt-1',
  exerciseId: reactDerivedStateExercise.id,
  startedAt: '2026-09-05T00:00:00.000Z',
  submittedAt: '2026-09-05T00:01:00.000Z',
  findings: [],
  hintsUsed: [],
  evaluation: {
    technicalScore: 80,
    communicationScore: 70,
    findingResults: [],
    conceptsFound: [],
    conceptsMissed: [],
    assistanceLevel: 0,
    completed: false,
  },
}

describe('FixCodeStep', () => {
  it('keeps the reference hidden until an edited fix is submitted', async () => {
    const referenceContent =
      reactDerivedStateExercise.referenceSolution?.[0]?.content ?? ''
    const onSubmit = vi.fn(async (files: CodeFile[]) => ({
      ...attempt,
      completedAt: '2026-09-05T00:02:00.000Z',
      evaluation: { ...attempt.evaluation!, completed: true },
      fixSubmission: {
        files,
        submittedAt: '2026-09-05T00:02:00.000Z',
      },
    }))

    render(
      <MemoryRouter>
        <FixCodeStep
          attempt={attempt}
          exercise={reactDerivedStateExercise}
          onSubmit={onSubmit}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Reference')).not.toBeInTheDocument()
    const submitButton = screen.getByRole('button', { name: 'Submit fix' })
    expect(submitButton).toBeDisabled()

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Edit src/components/TaskList.tsx',
      }),
      { target: { value: referenceContent } },
    )
    fireEvent.click(submitButton)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(
      screen.getByRole('heading', {
        name: 'Compare the change, not just the answer.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Reference')).toBeInTheDocument()
    expect(screen.getByText('100% complete')).toBeInTheDocument()
  })
})
