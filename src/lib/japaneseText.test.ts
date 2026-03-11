import { describe, expect, it } from 'vitest'
import { getJapaneseWordSpeechText } from './japaneseText'

describe('getJapaneseWordSpeechText', () => {
  it('removes full-width reading annotations for speech', () => {
    expect(getJapaneseWordSpeechText('略語（りゃくご）')).toBe('略語')
  })

  it('removes ascii reading annotations for speech', () => {
    expect(getJapaneseWordSpeechText('アクセント (あくせんと)')).toBe('アクセント')
  })

  it('returns the original term when there is no ruby annotation', () => {
    expect(getJapaneseWordSpeechText('できる')).toBe('できる')
  })
})
