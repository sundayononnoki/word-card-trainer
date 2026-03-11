import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { mergeBuiltinEntries, normalizeSeedEntries } from './builtinDeck'
import {
  BUILTIN_DECK_ID,
  BUILTIN_DECK_VERSION,
  DEFAULT_SETTINGS,
  type AppSettings,
  type DailyQuoteCache,
  type DeckRecord,
  type NewVocabEntryDraft,
  type StudyProgress,
  type VocabEntry,
} from '../types'

const DB_NAME = 'word-card-trainer'
const DB_VERSION = 2
const SETTINGS_KEY = 'singleton'
const DAILY_QUOTE_CACHE_KEY = 'daily-quote'

interface TrainerDB extends DBSchema {
  decks: {
    key: string
    value: DeckRecord
    indexes: {
      'by-updatedAt': number
    }
  }
  entries: {
    key: string
    value: VocabEntry
    indexes: {
      'by-deck': string
      'by-deck-order': [string, number]
    }
  }
  progress: {
    key: string
    value: StudyProgress
  }
  settings: {
    key: string
    value: AppSettings
  }
  quoteCache: {
    key: string
    value: DailyQuoteCache
  }
}

let dbPromise: Promise<IDBPDatabase<TrainerDB>> | null = null
const BUILTIN_DECK_URL = `${import.meta.env.BASE_URL}decks/default-deck.json`

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<TrainerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('decks')) {
          const decks = db.createObjectStore('decks')
          decks.createIndex('by-updatedAt', 'updatedAt')
        }

        if (!db.objectStoreNames.contains('entries')) {
          const entries = db.createObjectStore('entries')
          entries.createIndex('by-deck', 'deckId')
          entries.createIndex('by-deck-order', ['deckId', 'order'])
        }

        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress')
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }

        if (!db.objectStoreNames.contains('quoteCache')) {
          db.createObjectStore('quoteCache')
        }
      },
    })
  }

  return dbPromise
}

async function replaceEntriesForDeck(
  db: IDBPDatabase<TrainerDB>,
  deck: DeckRecord,
  entries: VocabEntry[],
) {
  const tx = db.transaction(['decks', 'entries'], 'readwrite')
  const entriesStore = tx.objectStore('entries')
  const existingKeys = await entriesStore.index('by-deck').getAllKeys(deck.id)

  await Promise.all(existingKeys.map((key) => entriesStore.delete(key)))
  await tx.objectStore('decks').put(deck, deck.id)
  await Promise.all(entries.map((entry) => entriesStore.put(entry, entry.id)))
  await tx.done
}

export async function ensureBuiltinDeck() {
  const db = await getDb()
  const existingDeck = await db.get('decks', BUILTIN_DECK_ID)
  const existingEntries =
    existingDeck
      ? await db.getAllFromIndex(
          'entries',
          'by-deck-order',
          IDBKeyRange.bound([BUILTIN_DECK_ID, 0], [BUILTIN_DECK_ID, Number.MAX_SAFE_INTEGER]),
        )
      : []

  if (existingDeck?.version === BUILTIN_DECK_VERSION) {
    return existingDeck
  }

  const response = await fetch(BUILTIN_DECK_URL)
  if (!response.ok) {
    throw new Error('Unable to load the built-in deck data.')
  }

  const rawEntries = (await response.json()) as VocabEntry[]
  const seedEntries = normalizeSeedEntries(rawEntries, BUILTIN_DECK_ID)
  const entries = mergeBuiltinEntries(seedEntries, existingEntries, BUILTIN_DECK_ID)
  const now = Date.now()
  const deck: DeckRecord = {
    id: BUILTIN_DECK_ID,
    name: 'Core 9000',
    source: 'builtin',
    version: BUILTIN_DECK_VERSION,
    entryCount: entries.length,
    createdAt: existingDeck?.createdAt ?? now,
    updatedAt: now,
  }

  await replaceEntriesForDeck(db, deck, entries)
  return deck
}

export async function saveImportedDeck(deck: DeckRecord, entries: VocabEntry[]) {
  const db = await getDb()
  await replaceEntriesForDeck(db, deck, entries)
}

function buildUserEntryId(deckId: string) {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  return `${deckId}::user-${suffix}`
}

export async function appendEntryToDeck(deckId: string, draft: NewVocabEntryDraft) {
  const db = await getDb()
  const deck = await db.get('decks', deckId)

  if (!deck) {
    throw new Error('The selected deck could not be found.')
  }

  const existingEntries = await getEntriesForDeck(deckId)
  const entry: VocabEntry = {
    ...draft,
    id: buildUserEntryId(deckId),
    deckId,
    order: existingEntries.length,
    origin: 'user',
  }
  const updatedDeck: DeckRecord = {
    ...deck,
    entryCount: existingEntries.length + 1,
    updatedAt: Date.now(),
  }

  const tx = db.transaction(['decks', 'entries'], 'readwrite')
  await tx.objectStore('entries').put(entry, entry.id)
  await tx.objectStore('decks').put(updatedDeck, updatedDeck.id)
  await tx.done

  return {
    deck: updatedDeck,
    entry,
  }
}

export async function listDecks() {
  const db = await getDb()
  const decks = await db.getAll('decks')
  return decks.slice().sort((left, right) => right.updatedAt - left.updatedAt)
}

export async function getEntriesForDeck(deckId: string) {
  const db = await getDb()
  return db.getAllFromIndex('entries', 'by-deck-order', IDBKeyRange.bound([deckId, 0], [deckId, Number.MAX_SAFE_INTEGER]))
}

export async function getAllProgress() {
  const db = await getDb()
  return db.getAll('progress')
}

export async function getProgress(deckId: string): Promise<StudyProgress | null> {
  const db = await getDb()
  return (await db.get('progress', deckId)) ?? null
}

export async function saveProgress(progress: StudyProgress) {
  const db = await getDb()
  await db.put('progress', progress, progress.deckId)
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDb()
  const saved = await db.get('settings', SETTINGS_KEY)
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
  }
}

export async function saveSettings(settings: AppSettings) {
  const db = await getDb()
  await db.put('settings', settings, SETTINGS_KEY)
}

export async function getDailyQuoteCache(): Promise<DailyQuoteCache | null> {
  const db = await getDb()
  return (await db.get('quoteCache', DAILY_QUOTE_CACHE_KEY)) ?? null
}

export async function saveDailyQuoteCache(cache: DailyQuoteCache) {
  const db = await getDb()
  await db.put('quoteCache', cache, DAILY_QUOTE_CACHE_KEY)
}
