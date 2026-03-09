import { stemmer } from 'stemmer'

type HighlightSegment = {
  text: string
  match: boolean
}

const TOKEN_REGEX = /[A-Za-z]+(?:['’-][A-Za-z]+)*/g

const IRREGULAR_GROUPS = [
  ['be', 'am', 'is', 'are', 'was', 'were', 'been', 'being'],
  ['begin', 'began', 'begun', 'begins', 'beginning'],
  ['break', 'broke', 'broken', 'breaks', 'breaking'],
  ['bring', 'brought', 'brings', 'bringing'],
  ['build', 'built', 'builds', 'building'],
  ['buy', 'bought', 'buys', 'buying'],
  ['catch', 'caught', 'catches', 'catching'],
  ['choose', 'chose', 'chosen', 'chooses', 'choosing'],
  ['come', 'came', 'comes', 'coming'],
  ['do', 'did', 'done', 'does', 'doing'],
  ['drink', 'drank', 'drunk', 'drinks', 'drinking'],
  ['drive', 'drove', 'driven', 'drives', 'driving'],
  ['eat', 'ate', 'eaten', 'eats', 'eating'],
  ['fall', 'fell', 'fallen', 'falls', 'falling'],
  ['feel', 'felt', 'feels', 'feeling'],
  ['find', 'found', 'finds', 'finding'],
  ['fly', 'flew', 'flown', 'flies', 'flying'],
  ['forget', 'forgot', 'forgotten', 'forgets', 'forgetting'],
  ['get', 'got', 'gotten', 'gets', 'getting'],
  ['give', 'gave', 'given', 'gives', 'giving'],
  ['go', 'went', 'gone', 'goes', 'going'],
  ['grow', 'grew', 'grown', 'grows', 'growing'],
  ['have', 'had', 'has', 'having'],
  ['hear', 'heard', 'hears', 'hearing'],
  ['keep', 'kept', 'keeps', 'keeping'],
  ['know', 'knew', 'known', 'knows', 'knowing'],
  ['leave', 'left', 'leaves', 'leaving'],
  ['lose', 'lost', 'loses', 'losing'],
  ['make', 'made', 'makes', 'making'],
  ['meet', 'met', 'meets', 'meeting'],
  ['pay', 'paid', 'pays', 'paying'],
  ['read', 'reads', 'reading'],
  ['ride', 'rode', 'ridden', 'rides', 'riding'],
  ['run', 'ran', 'runs', 'running'],
  ['say', 'said', 'says', 'saying'],
  ['see', 'saw', 'seen', 'sees', 'seeing'],
  ['sell', 'sold', 'sells', 'selling'],
  ['send', 'sent', 'sends', 'sending'],
  ['sing', 'sang', 'sung', 'sings', 'singing'],
  ['sit', 'sat', 'sits', 'sitting'],
  ['sleep', 'slept', 'sleeps', 'sleeping'],
  ['speak', 'spoke', 'spoken', 'speaks', 'speaking'],
  ['spend', 'spent', 'spends', 'spending'],
  ['stand', 'stood', 'stands', 'standing'],
  ['swim', 'swam', 'swum', 'swims', 'swimming'],
  ['take', 'took', 'taken', 'takes', 'taking'],
  ['teach', 'taught', 'teaches', 'teaching'],
  ['tell', 'told', 'tells', 'telling'],
  ['think', 'thought', 'thinks', 'thinking'],
  ['understand', 'understood', 'understands', 'understanding'],
  ['wear', 'wore', 'worn', 'wears', 'wearing'],
  ['win', 'won', 'wins', 'winning'],
  ['write', 'wrote', 'written', 'writes', 'writing'],
] as const

const IRREGULAR_FORM_MAP = new Map<string, Set<string>>(
  IRREGULAR_GROUPS.flatMap((group) => {
    const normalized = group.map((form) => form.toLowerCase())
    const formSet = new Set(normalized)
    return normalized.map((form) => [form, formSet] as const)
  }),
)

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/[’]/g, "'")
}

function isSimpleWord(word: string) {
  return /^[A-Za-z]+(?:[''][A-Za-z]+)?$/.test(word)
}

function isConsonant(letter: string) {
  return /^[bcdfghjklmnpqrstvwxyz]$/i.test(letter)
}

function generateRegularVariants(base: string) {
  const normalized = normalizeWord(base)
  const variants = new Set<string>([normalized])

  if (!isSimpleWord(normalized)) {
    return variants
  }

  if (normalized.endsWith('y') && isConsonant(normalized.at(-2) ?? '')) {
    const stem = normalized.slice(0, -1)
    variants.add(`${stem}ies`)
    variants.add(`${stem}ied`)
    variants.add(`${normalized.slice(0, -1)}ying`)
    variants.add(`${stem}ier`)
    variants.add(`${stem}iest`)
  } else {
    variants.add(`${normalized}s`)
    variants.add(`${normalized}ed`)
    variants.add(`${normalized}ing`)
    variants.add(`${normalized}er`)
    variants.add(`${normalized}est`)
  }

  if (/(s|sh|ch|x|z|o)$/.test(normalized)) {
    variants.add(`${normalized}es`)
  }

  if (normalized.endsWith('e')) {
    variants.add(`${normalized}d`)
    variants.add(`${normalized.slice(0, -1)}ing`)
  }

  if (
    normalized.length >= 3 &&
    isConsonant(normalized.at(-1) ?? '') &&
    !/[wxy]/.test(normalized.at(-1) ?? '') &&
    !isConsonant(normalized.at(-2) ?? '') &&
    isConsonant(normalized.at(-3) ?? '')
  ) {
    const last = normalized.at(-1) ?? ''
    variants.add(`${normalized}${last}ed`)
    variants.add(`${normalized}${last}ing`)
  }

  if (normalized.endsWith('ic')) {
    variants.add(`${normalized}ally`)
  } else {
    variants.add(`${normalized}ly`)
  }

  return variants
}

function isIrregularVariantMatch(base: string, candidate: string) {
  const baseForms = IRREGULAR_FORM_MAP.get(base)
  return baseForms?.has(candidate) ?? false
}

function isMorphologicalMatch(baseWord: string, candidateWord: string) {
  const normalizedBase = normalizeWord(baseWord)
  const normalizedCandidate = normalizeWord(candidateWord)

  if (!normalizedBase || !normalizedCandidate) {
    return false
  }

  if (normalizedBase === normalizedCandidate) {
    return true
  }

  if (isIrregularVariantMatch(normalizedBase, normalizedCandidate)) {
    return true
  }

  const regularVariants = generateRegularVariants(normalizedBase)
  if (regularVariants.has(normalizedCandidate)) {
    return true
  }

  if (normalizedBase.length > 2 && normalizedCandidate.length > 2) {
    return stemmer(normalizedBase) === stemmer(normalizedCandidate)
  }

  return false
}

function splitByExactPhrase(text: string, target: string): HighlightSegment[] {
  const pattern = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matcher = new RegExp(`(${pattern})`, 'gi')
  const parts = text.split(matcher)

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      match: part.toLowerCase() === target.toLowerCase(),
    }))
}

export function splitEnglishHighlightSegments(text: string, target: string): HighlightSegment[] {
  const trimmedText = text.trim()
  const trimmedTarget = target.trim()

  if (!trimmedText || !trimmedTarget) {
    return [{ text, match: false }]
  }

  if (!isSimpleWord(trimmedTarget)) {
    return splitByExactPhrase(text, trimmedTarget)
  }

  const segments: HighlightSegment[] = []
  let cursor = 0

  for (const match of text.matchAll(TOKEN_REGEX)) {
    const token = match[0]
    const start = match.index ?? 0
    const end = start + token.length

    if (cursor < start) {
      segments.push({ text: text.slice(cursor, start), match: false })
    }

    segments.push({
      text: token,
      match: isMorphologicalMatch(trimmedTarget, token),
    })

    cursor = end
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false })
  }

  return segments.length > 0 ? segments : [{ text, match: false }]
}
