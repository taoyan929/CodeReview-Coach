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
      'Add finding is unavailable. Select at least one code line and enter at least 3 meaningful characters.',
    )

    fireEvent.mouseEnter(addButton)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Select at least one code line and enter at least 3 meaningful characters.',
    )
    fireEvent.mouseLeave(addButton)

    fireEvent.click(addButton)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Select at least one code line and enter at least 3 meaningful characters.',
    )
    expect(onAdd).not.toHaveBeenCalled()

    rerender(<FindingComposer onAdd={onAdd} selectedLines={[15, 17]} />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Enter at least 3 meaningful characters describing what you noticed.',
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

  it('does not accept a single-character diagnosis', () => {
    const onAdd = vi.fn()
    render(<FindingComposer onAdd={onAdd} selectedLines={[2]} />)
    fireEvent.change(screen.getByLabelText(/What did you notice/), {
      target: { value: 'x' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add finding' }))
    expect(onAdd).not.toHaveBeenCalled()
  })
})
