import { describe, expect, it } from 'vitest'

import {
  calendarDateKey,
  calendarWeekStartKey,
  daysBetweenDateKeys,
} from './calendar'

describe('local calendar semantics', () => {
  it('uses the Auckland natural day around UTC midnight', () => {
    expect(
      calendarDateKey('2026-09-06T12:30:00.000Z', 'Pacific/Auckland'),
    ).toBe('2026-09-07')
    expect(
      calendarDateKey('2026-09-06T11:30:00.000Z', 'Pacific/Auckland'),
    ).toBe('2026-09-06')
  })

  it('starts the week on local Monday', () => {
    expect(
      calendarWeekStartKey(
        new Date('2026-09-06T12:30:00.000Z'),
        'Pacific/Auckland',
      ),
    ).toBe('2026-09-07')
  })

  it('keeps civil-day differences stable across daylight saving changes', () => {
    expect(daysBetweenDateKeys('2026-09-28', '2026-09-27')).toBe(1)
  })
})
