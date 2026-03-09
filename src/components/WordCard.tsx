import type { PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AutoFitText } from './AutoFitText'
import { splitEnglishHighlightSegments } from '../lib/englishHighlight'
import type { VocabEntry } from '../types'

type WordCardProps = {
  direction: 1 | -1
  entry: VocabEntry
  hideEnglishByDefault: boolean
  isEnglishVisible: boolean
  isSpeechSupported: boolean
  onEnglishWordClick: () => void
  onJapaneseWordClick: () => void
  onEnglishSentenceClick: () => void
  onJapaneseSentenceClick: () => void
  swipeHandlers: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void
    onPointerCancel: () => void
  }
}

const cardVariants = {
  enter: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction > 0 ? 80 : -80,
    rotate: direction > 0 ? 2 : -2,
  }),
  center: {
    opacity: 1,
    x: 0,
    rotate: 0,
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction > 0 ? -80 : 80,
    rotate: direction > 0 ? -2 : 2,
  }),
}

const FLUORESCENT_GREEN = 'text-[#b8ff5c]'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getJapaneseHighlightTargets(term: string) {
  const trimmed = term.trim()
  if (!trimmed) {
    return []
  }

  const withoutFurigana = trimmed
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim()
  const baseTerm = withoutFurigana.split(/\s+/)[0]?.trim() ?? ''

  return Array.from(new Set([trimmed, withoutFurigana, baseTerm].filter(Boolean))).sort(
    (left, right) => right.length - left.length,
  )
}

function parseJapaneseRuby(term: string) {
  const trimmed = term.trim()
  if (!trimmed) {
    return null
  }

  const match = trimmed.match(/^(.*?)[（(]([^）)]+)[）)]$/)
  if (!match) {
    return null
  }

  const base = match[1]?.trim()
  const reading = match[2]?.trim()

  if (!base || !reading) {
    return null
  }

  return { base, reading }
}

function highlightText(
  text: string,
  targets: string[],
  options: { caseInsensitive?: boolean } = {},
) {
  const filteredTargets = targets
    .map((target) => target.trim())
    .filter(Boolean)
    .sort((left, right) => right.length - left.length)

  if (!text.trim() || filteredTargets.length === 0) {
    return text
  }

  const pattern = filteredTargets.map(escapeRegExp).join('|')
  const flags = options.caseInsensitive ? 'gi' : 'g'
  const matcher = new RegExp(`(${pattern})`, flags)
  const segments = text.split(matcher)

  return segments.map((segment, index) => {
    const isMatch = filteredTargets.some((target) =>
      options.caseInsensitive
        ? segment.toLowerCase() === target.toLowerCase()
        : segment === target,
    )

    if (!isMatch) {
      return <span key={`${segment}-${index}`}>{segment}</span>
    }

    return (
      <span
        key={`${segment}-${index}`}
        className={`${FLUORESCENT_GREEN} font-semibold [text-shadow:0_0_18px_rgba(184,255,92,0.28)]`}
      >
        {segment}
      </span>
    )
  })
}

function highlightEnglishText(text: string, target: string) {
  return splitEnglishHighlightSegments(text, target).map((segment, index) =>
    segment.match ? (
      <span
        key={`${segment.text}-${index}`}
        className={`${FLUORESCENT_GREEN} font-semibold [text-shadow:0_0_18px_rgba(184,255,92,0.28)]`}
      >
        {segment.text}
      </span>
    ) : (
      <span key={`${segment.text}-${index}`}>{segment.text}</span>
    ),
  )
}

export function WordCard({
  direction,
  entry,
  hideEnglishByDefault,
  isEnglishVisible,
  isSpeechSupported,
  onEnglishWordClick,
  onJapaneseWordClick,
  onEnglishSentenceClick,
  onJapaneseSentenceClick,
  swipeHandlers,
}: WordCardProps) {
  const japaneseTargets = getJapaneseHighlightTargets(entry.japanese)
  const japaneseRuby = parseJapaneseRuby(entry.japanese)

  return (
    <AnimatePresence initial={false} mode="wait" custom={direction}>
      <motion.article
        key={entry.id}
        animate="center"
        className="card-shadow glass-panel relative h-auto min-h-0 w-full overflow-visible rounded-[2.5rem] border border-white/10 p-4 sm:p-6 md:h-full md:overflow-hidden md:p-8"
        custom={direction}
        exit="exit"
        initial="enter"
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        variants={cardVariants}
        {...swipeHandlers}
      >
        <div className="relative grid h-auto min-h-0 grid-cols-1 gap-4 md:h-full md:grid-cols-2 md:grid-rows-[minmax(10rem,0.78fr)_minmax(0,1.22fr)] md:gap-5">
          <button
            aria-label="Speak English word"
            className={`group relative min-h-[10rem] rounded-[2rem] border px-4 py-5 text-center transition sm:px-6 md:h-full md:min-h-0 md:px-7 md:py-6 ${
              isSpeechSupported
                ? 'border-white/10 bg-white/7 hover:border-[#a6ffcb]/50 hover:bg-white/12'
                : 'border-white/10 bg-white/5 opacity-70'
            }`}
            onClick={onEnglishWordClick}
            type="button"
          >
            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
              EN
            </span>
            <div className="flex min-h-full w-full items-center justify-center text-center">
              {hideEnglishByDefault && !isEnglishVisible ? (
                <AutoFitText
                  containerClassName="px-2"
                  fitKey="study-en-word-hidden"
                  maxFontSize={96}
                  minFontSize={26}
                  multiline={false}
                  textClassName="space-y-3 text-center"
                >
                  <span
                    className={`block font-display tracking-tight text-transparent blur-md ${FLUORESCENT_GREEN}`}
                  >
                    {entry.english}
                  </span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
                    Tap to reveal and speak
                  </span>
                </AutoFitText>
              ) : (
                <AutoFitText
                  containerClassName="px-2"
                  fitKey="study-en-word"
                  maxFontSize={96}
                  minFontSize={24}
                  multiline={false}
                  textClassName={`font-display tracking-tight ${FLUORESCENT_GREEN} [text-shadow:0_0_22px_rgba(184,255,92,0.25)]`}
                >
                  {entry.english}
                </AutoFitText>
              )}
            </div>
          </button>

          <button
            aria-label="Speak Japanese word"
            className={`group relative min-h-[10rem] rounded-[2rem] border px-4 py-5 text-center transition sm:px-6 md:h-full md:min-h-0 md:px-7 md:py-6 ${
              isSpeechSupported
                ? 'border-white/10 bg-white/7 hover:border-[#ffb183]/50 hover:bg-white/12'
                : 'border-white/10 bg-white/5 opacity-70'
            }`}
            onClick={onJapaneseWordClick}
            type="button"
          >
            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
              JA
            </span>
            <div className="flex min-h-full w-full items-center justify-center text-center">
              {japaneseRuby ? (
                <AutoFitText
                  containerClassName="px-2"
                  fitKey="study-ja-word-ruby"
                  maxFontSize={82}
                  minFontSize={22}
                  multiline={false}
                  textClassName={`font-semibold tracking-tight ${FLUORESCENT_GREEN} [text-shadow:0_0_22px_rgba(184,255,92,0.25)]`}
                >
                  <ruby>
                    {japaneseRuby.base}
                    <rt className="pb-2 text-[0.42em] font-medium tracking-[0.08em] text-[#d9ff9c]">
                      {japaneseRuby.reading}
                    </rt>
                  </ruby>
                </AutoFitText>
              ) : (
                <AutoFitText
                  containerClassName="px-2"
                  fitKey="study-ja-word"
                  maxFontSize={82}
                  minFontSize={22}
                  multiline={false}
                  textClassName={`font-semibold tracking-tight ${FLUORESCENT_GREEN} [text-shadow:0_0_22px_rgba(184,255,92,0.25)]`}
                >
                  {highlightText(entry.japanese, japaneseTargets)}
                </AutoFitText>
              )}
            </div>
          </button>

          <button
            aria-label="Speak English sentence"
            className={`group relative min-h-[14rem] rounded-[2rem] border p-4 text-center transition sm:p-5 md:h-full md:min-h-0 md:p-7 ${
              isSpeechSupported
                ? 'border-white/10 bg-white/7 hover:border-[#a6ffcb]/50 hover:bg-white/12'
                : 'border-white/10 bg-white/5 opacity-70'
            }`}
            onClick={onEnglishSentenceClick}
            type="button"
          >
            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
              EN SENTENCE
            </span>
            <div className="flex min-h-full w-full items-center justify-center">
              <AutoFitText
                containerClassName="px-3"
                fitKey="study-en-sentence"
                lineHeight={1.15}
                maxFontSize={52}
                minFontSize={20}
                textClassName="max-w-[22ch] text-center tracking-tight text-stone-100"
              >
                {highlightEnglishText(entry.englishSentence, entry.english)}
              </AutoFitText>
            </div>
          </button>

          <button
            aria-label="Speak Japanese sentence"
            className={`group relative min-h-[14rem] rounded-[2rem] border p-4 text-center transition sm:p-5 md:h-full md:min-h-0 md:p-7 ${
              isSpeechSupported
                ? 'border-white/10 bg-white/7 hover:border-[#ffb183]/50 hover:bg-white/12'
                : 'border-white/10 bg-white/5 opacity-70'
            }`}
            onClick={onJapaneseSentenceClick}
            type="button"
          >
            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
              JA SENTENCE
            </span>
            <div className="flex min-h-full w-full items-center justify-center">
              <AutoFitText
                containerClassName="px-3"
                fitKey="study-ja-sentence"
                lineHeight={1.2}
                maxFontSize={56}
                minFontSize={22}
                textClassName="max-w-[16ch] text-center tracking-tight text-stone-100"
              >
                {highlightText(entry.japaneseSentence, japaneseTargets)}
              </AutoFitText>
            </div>
          </button>
        </div>
      </motion.article>
    </AnimatePresence>
  )
}
