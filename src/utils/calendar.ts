const DAY_IN_MILLISECONDS = 86_400_000

interface CalendarParts {
  year: number
  month: number
  day: number
}

function calendarParts(value: string | Date, timeZone?: string): CalendarParts {
  const date = value instanceof Date ? value : new Date(value)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value: partValue }) => [type, Number(partValue)]),
  )

  return {
    year: parts.year!,
    month: parts.month!,
    day: parts.day!,
  }
}

function partsToKey({ year, month, day }: CalendarParts) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function calendarDateKey(value: string | Date, timeZone?: string) {
  return partsToKey(calendarParts(value, timeZone))
}

export function daysBetweenDateKeys(later: string, earlier: string) {
  const laterTime = Date.parse(`${later}T00:00:00.000Z`)
  const earlierTime = Date.parse(`${earlier}T00:00:00.000Z`)
  return Math.round((laterTime - earlierTime) / DAY_IN_MILLISECONDS)
}

export function calendarWeekStartKey(value: Date, timeZone?: string) {
  const parts = calendarParts(value, timeZone)
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  const weekday = date.getUTCDay()
  date.setUTCDate(date.getUTCDate() - (weekday === 0 ? 6 : weekday - 1))
  return date.toISOString().slice(0, 10)
}
