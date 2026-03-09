import { describe, expect, it } from 'vitest'
import { splitEnglishHighlightSegments } from './englishHighlight'

function extractMatches(text: string, target: string) {
  return splitEnglishHighlightSegments(text, target)
    .filter((segment) => segment.match)
    .map((segment) => segment.text.toLowerCase())
}

describe('splitEnglishHighlightSegments', () => {
  it('matches regular past tense forms', () => {
    expect(extractMatches('They abandoned the car on a back road.', 'abandon')).toEqual([
      'abandoned',
    ])
  })

  it('matches y-ending inflections', () => {
    expect(extractMatches('She studied late and studies hard.', 'study')).toEqual([
      'studied',
      'studies',
    ])
  })

  it('matches doubled consonant forms', () => {
    expect(extractMatches('He is running and ran yesterday.', 'run')).toEqual([
      'running',
      'ran',
    ])
  })

  it('matches common irregular verbs', () => {
    expect(extractMatches('They went home and have gone already.', 'go')).toEqual([
      'went',
      'gone',
    ])
  })

  it('does not highlight unrelated inner substrings', () => {
    expect(extractMatches('The alphabet starts with A.', 'a')).toEqual(['A'.toLowerCase()])
  })
})
