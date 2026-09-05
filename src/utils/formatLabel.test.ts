import { formatLabel } from './formatLabel'

describe('formatLabel', () => {
  it('preserves common technology names and acronyms', () => {
    expect(formatLabel('javascript')).toBe('JavaScript')
    expect(formatLabel('fastapi')).toBe('FastAPI')
    expect(formatLabel('rest-api')).toBe('REST API')
    expect(formatLabel('review-the-ai')).toBe('Review the AI')
    expect(formatLabel('ship-or-block')).toBe('Ship or Block?')
    expect(formatLabel('nosql')).toBe('MongoDB / Cosmos DB')
  })
})
