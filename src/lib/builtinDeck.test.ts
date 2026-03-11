import { describe, expect, it } from 'vitest'
import { mergeBuiltinEntries, normalizeSeedEntries } from './builtinDeck'
import type { VocabEntry } from '../types'

describe('builtinDeck helpers', () => {
  it('normalizes built-in seed rows with contiguous ids and origin', () => {
    const normalized = normalizeSeedEntries(
      [
        {
          id: 'ignored',
          deckId: 'wrong',
          order: 99,
          english: 'abandon',
          englishSentence: 'They abandoned the car.',
          japanese: '放棄する（ほうきする）',
          japaneseSentence: '彼らは車を置いていった。',
        },
      ],
      'builtin-core',
    )

    expect(normalized[0]).toMatchObject({
      id: 'builtin-core::1',
      deckId: 'builtin-core',
      order: 0,
      origin: 'seed',
    })
  })

  it('preserves existing user rows when rebuilding the built-in deck', () => {
    const seedEntries: VocabEntry[] = [
      {
        id: 'builtin-core::1',
        deckId: 'builtin-core',
        order: 0,
        english: 'a',
        englishSentence: '"A" is the first letter.',
        japanese: 'ある（ある）',
        japaneseSentence: '「A」は最初の文字です。',
        origin: 'seed',
      },
    ]

    const merged = mergeBuiltinEntries(seedEntries, [
      {
        id: 'builtin-core::user-1',
        deckId: 'builtin-core',
        order: 15,
        english: 'afterglow',
        englishSentence: 'The sky kept an afterglow after sunset.',
        japanese: '残照（ざんしょう）',
        japaneseSentence: '日没後も空に残照が残っていた。',
        origin: 'user',
      },
    ], 'builtin-core')

    expect(merged).toHaveLength(2)
    expect(merged[1]).toMatchObject({
      id: 'builtin-core::user-1',
      english: 'afterglow',
      origin: 'user',
      order: 1,
    })
  })
})
