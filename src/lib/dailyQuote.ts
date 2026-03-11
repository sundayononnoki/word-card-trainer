import type { DailyQuoteCache } from '../types'

export const FALLBACK_DAILY_QUOTE: DailyQuoteCache = {
  dayKey: '',
  text: 'A quiet habit repeated daily changes a life more deeply than a burst of inspiration.',
  author: '',
  source: 'fallback',
  fetchedAt: 0,
}

type TheySaidSoQuote = {
  quote?: string
  author?: string
}

type TheySaidSoResponse = {
  contents?: {
    quotes?: TheySaidSoQuote[]
  }
}

type DummyJsonQuoteResponse = {
  quote?: string
  author?: string
}

export function getLocalDayKey(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function parseRemoteQuote(
  payload: TheySaidSoQuote | DummyJsonQuoteResponse,
): Pick<DailyQuoteCache, 'text' | 'author'> | null {
  const text = payload.quote?.trim()
  const author = payload.author?.trim()

  if (!text) {
    return null
  }

  return {
    text,
    author: author ?? '',
  }
}

export function parseTheySaidSoQuote(
  payload: TheySaidSoResponse,
): Pick<DailyQuoteCache, 'text' | 'author'> | null {
  const firstQuote = payload.contents?.quotes?.[0]
  if (!firstQuote) {
    return null
  }

  return parseRemoteQuote(firstQuote)
}

export function createFallbackQuote(dayKey: string): DailyQuoteCache {
  return {
    ...FALLBACK_DAILY_QUOTE,
    dayKey,
    fetchedAt: Date.now(),
  }
}

async function fetchDummyJsonQuote(signal?: AbortSignal) {
  const response = await fetch('https://dummyjson.com/quotes/random', {
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error('Unable to load today’s quote.')
  }

  const parsed = parseRemoteQuote((await response.json()) as DummyJsonQuoteResponse)
  if (!parsed) {
    throw new Error('Quote payload was missing text.')
  }

  return parsed
}

export async function fetchDailyLifeQuote(signal?: AbortSignal) {
  return fetchDummyJsonQuote(signal)
}
