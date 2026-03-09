export type DeckSource = 'builtin' | 'imported'

export type ViewName = 'library' | 'study' | 'settings'

export type VocabEntry = {
  id: string
  deckId: string
  order: number
  english: string
  englishSentence: string
  japanese: string
  japaneseSentence: string
}

export type DeckRecord = {
  id: string
  name: string
  source: DeckSource
  version: string
  entryCount: number
  createdAt: number
  updatedAt: number
}

export type AppSettings = {
  activeDeckId: string
  groupSize: number
  hideEnglishByDefault: boolean
  autoSpeakWord: boolean
  preferredVoiceURI?: string
  preferredJapaneseVoiceURI?: string
}

export type StudyProgress = {
  deckId: string
  currentEntryOrder: number
  completedEntryOrders: number[]
  updatedAt: number
}

export type GroupSnapshot = {
  currentGroupNumber: number
  totalGroups: number
  currentIndexInGroup: number
  currentGroupSize: number
  currentGroupCompleted: number
  currentGroupStart: number
  currentGroupEnd: number
  completedEntries: number
  totalEntries: number
}

export const BUILTIN_DECK_ID = 'builtin-core'

export const BUILTIN_DECK_VERSION = '2026-03-07-core-9000'

export const DEFAULT_SETTINGS: AppSettings = {
  activeDeckId: BUILTIN_DECK_ID,
  groupSize: 20,
  hideEnglishByDefault: false,
  autoSpeakWord: false,
}
