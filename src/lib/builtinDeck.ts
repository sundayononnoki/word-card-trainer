import type { VocabEntry } from '../types'

export function normalizeSeedEntries(rawEntries: VocabEntry[], deckId: string): VocabEntry[] {
  return rawEntries.map((entry, index) => ({
    ...entry,
    id: `${deckId}::${index + 1}`,
    deckId,
    order: index,
    origin: 'seed',
  }))
}

export function mergeBuiltinEntries(
  seedEntries: VocabEntry[],
  existingEntries: VocabEntry[],
  deckId: string,
): VocabEntry[] {
  const preservedUserEntries = existingEntries
    .filter((entry) => entry.origin === 'user')
    .map((entry) => ({
      ...entry,
      deckId,
      origin: 'user' as const,
    }))

  return [...seedEntries, ...preservedUserEntries].map((entry, index) => ({
    ...entry,
    order: index,
  }))
}
