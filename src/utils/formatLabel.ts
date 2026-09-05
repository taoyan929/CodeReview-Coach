const labels: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  fastapi: 'FastAPI',
  'rest-api': 'REST API',
  'api-design': 'API Design',
  'review-the-ai': 'Review the AI',
  'ship-or-block': 'Ship or Block?',
  'standard-review': 'Standard Review',
  'boss-review': 'Boss Review',
  sql: 'SQL',
  nosql: 'MongoDB / Cosmos DB',
}

export function formatLabel(value: string): string {
  if (labels[value]) {
    return labels[value]
  }

  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
