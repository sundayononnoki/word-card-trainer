export function getJapaneseWordSpeechText(term: string) {
  const trimmed = term.trim()
  if (!trimmed) {
    return ''
  }

  const withoutReading = trimmed
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim()

  return withoutReading || trimmed
}
