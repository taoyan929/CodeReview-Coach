import { fireEvent, render, screen } from '@testing-library/react'

import { FindingComposer } from './FindingComposer'

describe('FindingComposer', () => {
  it('requires a selection and diagnosis before adding a structured finding', () => {
    const onAdd = vi.fn()
    const { rerender } = render(<FindingComposer onAdd={onAdd} />)
    const addButton = screen.getByRole('button', { name: 'Add finding' })

    expect(addButton).toBeDisabled()

    rerender(
      <FindingComposer
        onAdd={onAdd}
        selection={{ startLine: 15, endLine: 17 }}
      />,
    )
    fireEvent.change(screen.getByLabelText(/What did you notice/), {
      target: { value: 'The derived list becomes stale.' },
    })
    fireEvent.change(screen.getByLabelText(/Why does it matter/), {
      target: { value: 'New props are ignored.' },
    })
    fireEvent.click(addButton)

    expect(onAdd).toHaveBeenCalledWith({
      category: 'logic',
      diagnosis: 'The derived list becomes stale.',
      impact: 'New props are ignored.',
      suggestedFix: undefined,
    })
  })
})
