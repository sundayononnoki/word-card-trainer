import { useEffect, useState } from 'react'
import { ensureBuiltinDeck, getAllProgress, getEntriesForDeck, listDecks, saveImportedDeck } from '../lib/db'
import { createImportedDeck } from '../lib/importDeck'
import type { DeckRecord, StudyProgress, VocabEntry } from '../types'

export function useDecks(activeDeckId: string) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [decks, setDecks] = useState<DeckRecord[]>([])
  const [entries, setEntries] = useState<VocabEntry[]>([])
  const [progressByDeck, setProgressByDeck] = useState<Record<string, StudyProgress>>({})

  async function refreshProgress() {
    const allProgress = await getAllProgress()
    const nextMap: Record<string, StudyProgress> = {}

    for (const progress of allProgress) {
      nextMap[progress.deckId] = progress
    }

    setProgressByDeck(nextMap)
  }

  async function refreshDeckIndex() {
    const deckRecords = await listDecks()
    setDecks(deckRecords)
    await refreshProgress()
  }

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        await ensureBuiltinDeck()
        if (cancelled) {
          return
        }
        const deckRecords = await listDecks()
        const allProgress = await getAllProgress()
        const nextMap: Record<string, StudyProgress> = {}
        for (const progress of allProgress) {
          nextMap[progress.deckId] = progress
        }
        if (cancelled) {
          return
        }
        setDecks(deckRecords)
        setProgressByDeck(nextMap)
        setReady(true)
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to open IndexedDB.')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready) {
      return
    }

    let cancelled = false

    void (async () => {
      const deckEntries = await getEntriesForDeck(activeDeckId)
      if (!cancelled) {
        setEntries(deckEntries)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [activeDeckId, ready])

  async function importDeck(file: File) {
    const imported = await createImportedDeck(file)
    await saveImportedDeck(imported.deck, imported.entries)
    await refreshDeckIndex()
    return imported.deck
  }

  return {
    ready,
    error,
    decks,
    entries,
    progressByDeck,
    activeDeck: decks.find((deck) => deck.id === activeDeckId) ?? decks[0] ?? null,
    importDeck,
  }
}
