import {
  formatCodeLocations,
  getSelectedLineNumbers,
} from './formatCodeLocations'

describe('formatCodeLocations', () => {
  it('keeps discrete lines separate and expands migrated ranges', () => {
    const locations = [
      { startLine: 15, endLine: 17 },
      { startLine: 1 },
      { startLine: 15 },
    ]

    expect(getSelectedLineNumbers(locations)).toEqual([1, 15, 16, 17])
    expect(formatCodeLocations(locations)).toBe('Lines 1, 15, 16, 17')
  })
})
