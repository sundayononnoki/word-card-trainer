import {
  AnimatePresence,
  motion,
  type PanInfo,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
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
  onNext: () => void
  onPrev: () => void
}

const cardVariants = {
  enter: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction > 0 ? 80 : -80,
    rotate: direction > 0 ? 2 : -2,
    scaleX: 0.985,
    scaleY: 1.018,
  }),
  center: {
    opacity: 1,
    x: 0,
    rotate: 0,
    scaleX: 1,
    scaleY: 1,
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction > 0 ? -80 : 80,
    rotate: direction > 0 ? -2 : 2,
    scaleX: 0.985,
    scaleY: 1.018,
  }),
}

const FLUORESCENT_GREEN = 'text-[var(--color-accent-primary)]'
const MOBILE_DRAG_THRESHOLD_RATIO = 0.3

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
        className={`${FLUORESCENT_GREEN} font-semibold [text-shadow:0_0_18px_var(--color-accent-glow)]`}
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
        className={`${FLUORESCENT_GREEN} font-semibold [text-shadow:0_0_18px_var(--color-accent-glow)]`}
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
  onNext,
  onPrev,
}: WordCardProps) {
  const japaneseTargets = getJapaneseHighlightTargets(entry.japanese)
  const japaneseRuby = parseJapaneseRuby(entry.japanese)
  const prefersReducedMotion = useReducedMotion()
  const dragX = useMotionValue(0)
  const rotate = useTransform(dragX, [-320, 0, 320], [-2.4, 0, 2.4])
  const scaleX = useTransform(dragX, [-320, 0, 320], [0.985, 1, 0.985])
  const scaleY = useTransform(dragX, [-320, 0, 320], [1.018, 1, 1.018])
  const dragGlow = useTransform(dragX, [-320, -40, 0, 40, 320], [0.18, 0.06, 0, 0.06, 0.18])

  function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const threshold = window.innerWidth * MOBILE_DRAG_THRESHOLD_RATIO

    if (Math.abs(info.offset.x) < threshold) {
      return
    }

    if (info.offset.x < 0) {
      onNext()
      return
    }

    onPrev()
  }

  return (
    <AnimatePresence initial={false} mode="wait" custom={direction}>
      <motion.article
        key={entry.id}
        animate="center"
        className="card-shadow glass-panel relative h-auto min-h-0 w-full touch-pan-y overflow-visible rounded-[2.5rem] border border-white/10 p-4 sm:p-6 md:h-full md:overflow-hidden md:p-8"
        custom={direction}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={prefersReducedMotion ? 0 : 0.24}
        dragMomentum={false}
        dragTransition={{
          bounceDamping: 14,
          bounceStiffness: 220,
          power: 0.18,
          timeConstant: 180,
        }}
        exit="exit"
        initial="enter"
        onDragEnd={handleDragEnd}
        style={
          prefersReducedMotion
            ? { x: dragX }
            : {
                x: dragX,
                rotate,
                scaleX,
                scaleY,
              }
        }
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        variants={cardVariants}
      >
        <div className="relative h-full w-full touch-pan-y">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[2rem] md:hidden"
            style={{
              boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.12)',
              opacity: dragGlow,
            }}
          />
          <div className="relative grid h-auto min-h-0 grid-cols-1 gap-4 md:h-full md:grid-cols-2 md:grid-rows-[minmax(10rem,0.78fr)_minmax(0,1.22fr)] md:gap-5">
          <button
            aria-label="Speak English word"
            className={`group relative min-h-[10rem] rounded-[2rem] border px-4 py-5 text-center transition sm:px-6 md:h-full md:min-h-0 md:px-7 md:py-6 ${
              isSpeechSupported
                ? 'border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-soft-hover)]'
                : 'border-[var(--color-surface-border)] bg-[var(--color-surface-soft)] opacity-70'
            }`}
            onClick={onEnglishWordClick}
            type="button"
          >
            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              EN
            </span>
            <div className="flex min-h-full w-full items-center justify-center text-center">
              {hideEnglishByDefault && !isEnglishVisible ? (
                <AutoFitText
                  containerClassName="px-2 py-3"
                  fitKey="study-en-word-hidden"
                  maxFontSize={96}
                  minFontSize={26}
                  multiline={false}
                  safePaddingY={12}
                  textClassName="space-y-3 text-center"
                >
                  <span className={`block font-display tracking-tight text-transparent blur-md ${FLUORESCENT_GREEN}`}>
                    {entry.english}
                  </span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                    Tap to reveal and speak
                  </span>
                </AutoFitText>
              ) : (
                <AutoFitText
                  containerClassName="px-2 py-3"
                  fitKey="study-en-word"
                  maxFontSize={96}
                  minFontSize={24}
                  multiline={false}
                  safePaddingY={12}
                  textClassName={`font-display tracking-tight ${FLUORESCENT_GREEN} [text-shadow:0_0_22px_var(--color-accent-glow)]`}
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
                ? 'border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] hover:border-[var(--color-accent-secondary)] hover:bg-[var(--color-surface-soft-hover)]'
                : 'border-[var(--color-surface-border)] bg-[var(--color-surface-soft)] opacity-70'
            }`}
            onClick={onJapaneseWordClick}
            type="button"
          >
            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
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
                  textClassName={`font-semibold tracking-tight ${FLUORESCENT_GREEN} [text-shadow:0_0_22px_var(--color-accent-glow)]`}
                >
                  <ruby>
                    {japaneseRuby.base}
                    <rt className="pb-2 text-[0.42em] font-medium tracking-[0.08em] text-[color:var(--color-accent-primary)]">
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
                  textClassName={`font-semibold tracking-tight ${FLUORESCENT_GREEN} [text-shadow:0_0_22px_var(--color-accent-glow)]`}
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
                ? 'border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-soft-hover)]'
                : 'border-[var(--color-surface-border)] bg-[var(--color-surface-soft)] opacity-70'
            }`}
            onClick={onEnglishSentenceClick}
            type="button"
          >
            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              EN
            </span>
            <div className="flex min-h-full w-full items-center justify-center">
              <AutoFitText
                containerClassName="px-3"
                fitKey="study-en-sentence"
                lineHeight={1.15}
                maxFontSize={52}
                minFontSize={20}
                textClassName="max-w-[22ch] text-center tracking-tight text-[var(--color-text-strong)]"
              >
                {highlightEnglishText(entry.englishSentence, entry.english)}
              </AutoFitText>
            </div>
          </button>

          <button
            aria-label="Speak Japanese sentence"
            className={`group relative min-h-[14rem] rounded-[2rem] border p-4 text-center transition sm:p-5 md:h-full md:min-h-0 md:p-7 ${
              isSpeechSupported
                ? 'border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] hover:border-[var(--color-accent-secondary)] hover:bg-[var(--color-surface-soft-hover)]'
                : 'border-[var(--color-surface-border)] bg-[var(--color-surface-soft)] opacity-70'
            }`}
            onClick={onJapaneseSentenceClick}
            type="button"
          >
            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              JA
            </span>
            <div className="flex min-h-full w-full items-center justify-center">
              <AutoFitText
                containerClassName="px-3"
                fitKey="study-ja-sentence"
                lineHeight={1.2}
                maxFontSize={56}
                minFontSize={22}
                textClassName="max-w-[16ch] text-center tracking-tight text-[var(--color-text-strong)]"
              >
                {highlightText(entry.japaneseSentence, japaneseTargets)}
              </AutoFitText>
            </div>
          </button>
          </div>
        </div>
      </motion.article>
    </AnimatePresence>
  )
}
