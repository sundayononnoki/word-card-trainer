import { useEffect, useState } from 'react'
import { getDailyQuoteCache, saveDailyQuoteCache } from '../lib/db'
import {
  createFallbackQuote,
  fetchDailyLifeQuote,
  getLocalDayKey,
} from '../lib/dailyQuote'
import type { DailyQuoteCache } from '../types'

export function useDailyQuote() {
  const [quote, setQuote] = useState<DailyQuoteCache>(createFallbackQuote(getLocalDayKey()))

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    void (async () => {
      const dayKey = getLocalDayKey()
      const cached = await getDailyQuoteCache()

      if (cancelled) {
        return
      }

      if (cached) {
        setQuote(cached)
      }

      if (cached?.dayKey === dayKey) {
        return
      }

      try {
        const nextQuote = await fetchDailyLifeQuote(controller.signal)
        if (cancelled) {
          return
        }

        const cache: DailyQuoteCache = {
          ...nextQuote,
          dayKey,
          source: 'remote',
          fetchedAt: Date.now(),
        }

        setQuote(cache)
        await saveDailyQuoteCache(cache)
      } catch {
        if (cancelled) {
          return
        }

        if (cached) {
          setQuote(cached)
          return
        }

        setQuote(createFallbackQuote(dayKey))
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  return quote
}
