const labels: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  fastapi: 'FastAPI',
  'rest-api': 'REST API',
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
