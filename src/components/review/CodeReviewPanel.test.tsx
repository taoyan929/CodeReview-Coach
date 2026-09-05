import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'

import type { CodeLocation } from '../../domain/exercise/types'
import { CodeReviewPanel } from './CodeReviewPanel'

const file = {
  id: 'example-file',
  path: 'src/example.ts',
  language: 'ts',
  content: ['const first = 1', 'const second = 2', 'const third = 3'].join(
    '\n',
  ),
}

function SelectionHarness() {
  const [selection, setSelection] = useState<CodeLocation>()

  return (
    <>
      <CodeReviewPanel
        file={file}
        findings={[]}
        onSelect={setSelection}
        selection={selection}
      />
      <output aria-label="Current selection">
        {selection
          ? `${selection.startLine}-${selection.endLine ?? selection.startLine}`
          : 'none'}
      </output>
    </>
  )
}

describe('CodeReviewPanel', () => {
  it('only expands a selection on click and clears it on double-click', () => {
    render(<SelectionHarness />)
    const firstLine = screen.getByRole('button', { name: /Select line 1:/ })
    const secondLine = screen.getByRole('button', { name: /Select line 2:/ })
    const thirdLine = screen.getByRole('button', { name: /Select line 3:/ })
    const selection = screen.getByRole('status', { name: 'Current selection' })

    fireEvent.click(secondLine)
    fireEvent.click(thirdLine)
    expect(selection).toHaveTextContent('2-3')

    fireEvent.click(firstLine)
    expect(selection).toHaveTextContent('1-3')

    fireEvent.click(secondLine)
    expect(selection).toHaveTextContent('1-3')

    fireEvent.doubleClick(secondLine)
    expect(selection).toHaveTextContent('none')
  })
})
