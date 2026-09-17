import { fireEvent, render, screen } from '@testing-library/react'

import { FindingComposer } from './FindingComposer'

const impactOptions = [
  { id: 'impact-a', label: 'The wrong user can gain access.' },
  { id: 'impact-b', label: 'The label changes colour.' },
  { id: 'impact-c', label: 'The request becomes faster.' },
]

function renderComposer(
  overrides: Partial<React.ComponentProps<typeof FindingComposer>> = {},
) {
  const props: React.ComponentProps<typeof FindingComposer> = {
    answerMode: 'full-review',
    impactOptions,
    modeLocked: false,
    selectedLines: [],
    onAdd: vi.fn(),
    onAnswerModeChange: vi.fn(),
    ...overrides,
  }
  const rendered = render(<FindingComposer {...props} />)
  return { ...rendered, props }
}

describe('FindingComposer', () => {
  it('requires a selection, explicit category and diagnosis in full review', () => {
    const { props, rerender } = renderComposer()
    const addButton = screen.getByRole('button', { name: 'Add finding' })

    expect(addButton).toHaveAccessibleDescription(
      expect.stringContaining('select at least one code line'),
    )
    fireEvent.mouseEnter(addButton)
    expect(screen.getByRole('status')).toHaveTextContent(
      'choose an issue category',
    )

    rerender(<FindingComposer {...props} selectedLines={[15, 17]} />)
    fireEvent.change(screen.getByLabelText(/Issue category/), {
      target: { value: 'logic' },
    })
    fireEvent.change(screen.getByLabelText(/What did you notice/), {
      target: { value: 'The derived list becomes stale.' },
    })
    fireEvent.change(screen.getByLabelText(/Why does it matter/), {
      target: { value: 'New props are ignored.' },
    })
    fireEvent.click(addButton)

    expect(props.onAdd).toHaveBeenCalledWith({
      category: 'logic',
      diagnosis: 'The derived list becomes stale.',
      impact: 'New props are ignored.',
      impactOptionId: undefined,
      suggestedFix: undefined,
    })
  })

  it('requires short issue, impact choice and fix in language assist', () => {
    const onAdd = vi.fn()
    renderComposer({
      answerMode: 'language-assist',
      selectedLines: [2],
      onAdd,
    })

    fireEvent.change(screen.getByLabelText(/Issue category/), {
      target: { value: 'logic' },
    })
    fireEvent.change(screen.getByLabelText(/What is the main issue/), {
      target: { value: 'loose equality' },
    })
    fireEvent.click(screen.getByLabelText('Not sure yet'))
    fireEvent.change(screen.getByLabelText(/How would you fix it/), {
      target: { value: 'use ===' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add finding' }))

    expect(onAdd).toHaveBeenCalledWith({
      category: 'logic',
      diagnosis: 'loose equality',
      impact: undefined,
      impactOptionId: 'not-sure',
      suggestedFix: 'use ===',
    })
  })

  it('locks the mode control after a finding has been added', () => {
    const onAnswerModeChange = vi.fn()
    renderComposer({ modeLocked: true, onAnswerModeChange })

    expect(
      screen.getByRole('button', { name: 'Language assist' }),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Full review' })).toBeDisabled()
    expect(
      screen.getByText('Remove all findings to change answer mode.'),
    ).toBeVisible()
  })

  it('does not accept a single-character diagnosis', () => {
    const onAdd = vi.fn()
    renderComposer({ selectedLines: [2], onAdd })
    fireEvent.change(screen.getByLabelText(/Issue category/), {
      target: { value: 'logic' },
    })
    fireEvent.change(screen.getByLabelText(/What did you notice/), {
      target: { value: 'x' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add finding' }))
    expect(onAdd).not.toHaveBeenCalled()
  })
})
