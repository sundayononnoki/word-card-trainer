import { describe, expect, it } from 'vitest'
import {
  createFallbackQuote,
  getLocalDayKey,
  parseRemoteQuote,
  parseTheySaidSoQuote,
} from './dailyQuote'

describe('dailyQuote helpers', () => {
  it('builds a stable local day key', () => {
    expect(getLocalDayKey(new Date('2026-03-11T08:00:00+09:00'))).toBe('2026-03-11')
  })

  it('parses a valid remote quote payload', () => {
    expect(
      parseRemoteQuote({
        quote: 'Life is really simple, but we insist on making it complicated.',
        author: 'Confucius',
      }),
    ).toEqual({
      text: 'Life is really simple, but we insist on making it complicated.',
      author: 'Confucius',
    })
  })

  it('returns null when quote text is missing', () => {
    expect(parseRemoteQuote({ author: 'Unknown' })).toBeNull()
  })

  it('parses the they said so qod payload shape', () => {
    expect(
      parseTheySaidSoQuote({
        contents: {
          quotes: [
            {
              quote: 'Life shrinks or expands in proportion to one’s courage.',
              author: 'Anais Nin',
            },
          ],
        },
      }),
    ).toEqual({
      text: 'Life shrinks or expands in proportion to one’s courage.',
      author: 'Anais Nin',
    })
  })

  it('creates a fallback quote for the current day', () => {
    expect(createFallbackQuote('2026-03-11')).toMatchObject({
      dayKey: '2026-03-11',
      source: 'fallback',
    })
  })
})
