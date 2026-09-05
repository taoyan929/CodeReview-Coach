import { fireEvent, render, screen } from '@testing-library/react'

import { FindingComposer } from './FindingComposer'

describe('FindingComposer', () => {
  it('requires a selection and diagnosis before adding a structured finding', () => {
    const onAdd = vi.fn()
    const { rerender } = render(
      <FindingComposer onAdd={onAdd} selectedLines={[]} />,
    )
    const addButton = screen.getByRole('button', { name: 'Add finding' })

    expect(addButton).toHaveAccessibleDescription(
      'Add finding is unavailable. Select at least one code line and describe what you noticed.',
    )

    fireEvent.mouseEnter(addButton)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Select at least one code line and describe what you noticed.',
    )
    fireEvent.mouseLeave(addButton)

    fireEvent.click(addButton)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Select at least one code line and describe what you noticed.',
    )
    expect(onAdd).not.toHaveBeenCalled()

    rerender(<FindingComposer onAdd={onAdd} selectedLines={[15, 17]} />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Describe what you noticed before adding the finding.',
    )
    fireEvent.change(screen.getByLabelText(/What did you notice/), {
      target: { value: 'The derived list becomes stale.' },
    })
    fireEvent.change(screen.getByLabelText(/Why does it matter/), {
      target: { value: 'New props are ignored.' },
    })
    expect(addButton).not.toHaveAccessibleDescription()
    fireEvent.click(addButton)

    expect(onAdd).toHaveBeenCalledWith({
      category: 'logic',
      diagnosis: 'The derived list becomes stale.',
      impact: 'New props are ignored.',
      suggestedFix: undefined,
    })
  })
})
