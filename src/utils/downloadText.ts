export function downloadTextFile(contents: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob([contents], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
