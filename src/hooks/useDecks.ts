import { useEffect, useState } from 'react'
import {
  appendEntryToDeck,
  ensureBuiltinDeck,
  getAllProgress,
  getEntriesForDeck,
  listDecks,
  saveImportedDeck,
} from '../lib/db'
import { createImportedDeck } from '../lib/importDeck'
import type { DeckRecord, NewVocabEntryDraft, StudyProgress, VocabEntry } from '../types'

function buildProgressMap(progressList: StudyProgress[]) {
  const nextMap: Record<string, StudyProgress> = {}

  for (const progress of progressList) {
    nextMap[progress.deckId] = progress
  }

  return nextMap
}

export function useDecks(activeDeckId: string) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [decks, setDecks] = useState<DeckRecord[]>([])
  const [entries, setEntries] = useState<VocabEntry[]>([])
  const [progressByDeck, setProgressByDeck] = useState<Record<string, StudyProgress>>({})

  async function refreshDeckIndex() {
    const [deckRecords, allProgress] = await Promise.all([listDecks(), getAllProgress()])
    setDecks(deckRecords)
    setProgressByDeck(buildProgressMap(allProgress))
  }

  async function refreshActiveDeckEntries(deckId: string) {
    const deckEntries = await getEntriesForDeck(deckId)
    setEntries(deckEntries)
  }

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        await ensureBuiltinDeck()
        if (cancelled) {
          return
        }
        const [deckRecords, allProgress] = await Promise.all([listDecks(), getAllProgress()])
        if (cancelled) {
          return
        }
        setDecks(deckRecords)
        setProgressByDeck(buildProgressMap(allProgress))
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

  async function addWord(deckId: string, draft: NewVocabEntryDraft) {
    const result = await appendEntryToDeck(deckId, draft)
    await refreshDeckIndex()
    if (deckId === activeDeckId) {
      await refreshActiveDeckEntries(deckId)
    }
    return result
  }

  return {
    ready,
    error,
    decks,
    entries,
    progressByDeck,
    activeDeck: decks.find((deck) => deck.id === activeDeckId) ?? decks[0] ?? null,
    importDeck,
    addWord,
  }
}
