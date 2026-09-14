import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'

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
  const [selectedLines, setSelectedLines] = useState<number[]>([])

  return (
    <>
      <CodeReviewPanel
        file={file}
        findings={[]}
        onSelect={setSelectedLines}
        selectedLines={selectedLines}
      />
      <output aria-label="Current selection">
        {selectedLines.length > 0 ? selectedLines.join(',') : 'none'}
      </output>
    </>
  )
}

describe('CodeReviewPanel', () => {
  it('adds individual lines on click and removes only one on double-click', () => {
    render(<SelectionHarness />)
    const firstLine = screen.getByRole('button', { name: /Select line 1:/ })
    const secondLine = screen.getByRole('button', { name: /Select line 2:/ })
    const thirdLine = screen.getByRole('button', { name: /Select line 3:/ })
    const selection = screen.getByRole('status', { name: 'Current selection' })

    fireEvent.click(secondLine)
    fireEvent.click(thirdLine)
    expect(selection).toHaveTextContent('2,3')

    fireEvent.click(firstLine)
    expect(selection).toHaveTextContent('1,2,3')

    fireEvent.click(secondLine)
    expect(selection).toHaveTextContent('1,2,3')

    fireEvent.doubleClick(secondLine)
    expect(selection).toHaveTextContent('1,3')
  })

  it('lets keyboard users remove a selected line', () => {
    render(<SelectionHarness />)
    const firstLine = screen.getByRole('button', { name: /Select line 1:/ })
    const selection = screen.getByRole('status', { name: 'Current selection' })
    fireEvent.click(firstLine)
    fireEvent.keyDown(firstLine, { key: 'Delete' })
    expect(selection).toHaveTextContent('none')
  })
})
