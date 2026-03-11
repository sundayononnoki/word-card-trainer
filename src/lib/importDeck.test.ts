import { describe, expect, it } from 'vitest'
import { looksLikeHeaderRow, rowsToEntries } from './importDeck'

describe('importDeck helpers', () => {
  it('detects multilingual header rows', () => {
    expect(looksLikeHeaderRow(['英语', '英语例句', '日语', '日语例句'])).toBe(true)
    expect(looksLikeHeaderRow(['English', 'Example', 'Japanese', 'Sentence'])).toBe(true)
    expect(looksLikeHeaderRow(['abandon', 'They left.', '放棄する', '彼らは去った。'])).toBe(false)
  })

  it('converts rows into entries and skips empty English cells', () => {
    const entries = rowsToEntries(
      [
        ['英语', '英语例句', '日语', '日语例句'],
        ['abandon', 'They abandoned the car.', '放棄する（ほうきする）', '彼らは車を置いていった。'],
        ['', '', '', ''],
        ['abbey', 'We toured the abbey.', '修道院（しゅうどういん）', '私たちは修道院を見学した。'],
      ],
      'deck-1',
    )

    expect(entries).toHaveLength(2)
    expect(entries[0]).toMatchObject({
      deckId: 'deck-1',
      order: 0,
      english: 'abandon',
      origin: 'seed',
    })
    expect(entries[1]).toMatchObject({
      order: 1,
      english: 'abbey',
    })
  })
})
