import { useState } from 'react'
import { WordCard } from '../components/WordCard'
import type { DeckRecord, GroupSnapshot, VocabEntry } from '../types'

const STUDY_GUIDE_STORAGE_KEY = 'word-card-trainer-study-guide-dismissed-v1'
const GUIDE_TAP_ICON_SRC = `${import.meta.env.BASE_URL}tap.png`
const GUIDE_SWIPE_ICON_SRC = `${import.meta.env.BASE_URL}swap.png`

type StudyPageProps = {
  activeDeck: DeckRecord | null
  currentEntry: VocabEntry | null
  direction: 1 | -1
  hideEnglishByDefault: boolean
  isEnglishVisible: boolean
  isSpeechSupported: boolean
  session: GroupSnapshot
  onEnglishWordClick: () => void
  onJapaneseWordClick: () => void
  onEnglishSentenceClick: () => void
  onJapaneseSentenceClick: () => void
  onPrev: () => void
  onNext: () => void
}

export function StudyPage({
  activeDeck,
  currentEntry,
  direction,
  hideEnglishByDefault,
  isEnglishVisible,
  isSpeechSupported,
  session,
  onEnglishWordClick,
  onJapaneseWordClick,
  onEnglishSentenceClick,
  onJapaneseSentenceClick,
  onPrev,
  onNext,
}: StudyPageProps) {
  const [showGuide, setShowGuide] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem(STUDY_GUIDE_STORAGE_KEY) !== 'true'
  })

  if (!activeDeck || !currentEntry) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="glass-panel max-w-lg rounded-[2rem] p-8 text-center">
          <p className="eyebrow">No cards loaded</p>
          <h2 className="mt-3 font-display text-3xl text-[var(--color-text-strong)]">Choose a deck to begin</h2>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-body)]">
            Once a deck is active, the study page will show exactly one card at a time and remember
            your position automatically.
          </p>
        </div>
      </div>
    )
  }

  function dismissGuide() {
    setShowGuide(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STUDY_GUIDE_STORAGE_KEY, 'true')
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="relative flex min-h-0 w-full md:flex-1">
        <WordCard
          direction={direction}
          entry={currentEntry}
          hideEnglishByDefault={hideEnglishByDefault}
          isEnglishVisible={isEnglishVisible}
          isSpeechSupported={isSpeechSupported}
          onEnglishSentenceClick={onEnglishSentenceClick}
          onEnglishWordClick={onEnglishWordClick}
          onJapaneseSentenceClick={onJapaneseSentenceClick}
          onJapaneseWordClick={onJapaneseWordClick}
          onNext={onNext}
          onPrev={onPrev}
        />
        {showGuide ? (
          <button
            aria-label="Dismiss study guide"
            className="absolute inset-0 z-20 flex items-center justify-center rounded-[2.5rem] px-6 py-8 backdrop-blur-[3px]"
            onClick={dismissGuide}
            style={{
              backgroundColor: 'var(--color-guide-overlay)',
              color: 'var(--color-guide-fg)',
            }}
            type="button"
          >
            <div className="pointer-events-none flex max-w-md flex-col items-center justify-center gap-10 text-center">
              <div className="space-y-4">
                <span
                  className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full"
                  style={{
                    border: '1px solid var(--color-guide-pill-border)',
                    backgroundColor: 'var(--color-guide-pill-bg)',
                  }}
                >
                  <img
                    alt=""
                    aria-hidden="true"
                    className="study-guide-icon h-14 w-14 object-contain"
                    src={GUIDE_TAP_ICON_SRC}
                  />
                </span>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Tap any card to hear it aloud
                </p>
              </div>

              <div className="space-y-4">
                <span
                  className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full"
                  style={{
                    border: '1px solid var(--color-guide-pill-border)',
                    backgroundColor: 'var(--color-guide-pill-bg)',
                  }}
                >
                  <img
                    alt=""
                    aria-hidden="true"
                    className="study-guide-icon h-14 w-14 object-contain"
                    src={GUIDE_SWIPE_ICON_SRC}
                  />
                </span>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Swipe left or right to change cards
                </p>
              </div>

              <p
                className="rounded-full px-4 py-2 text-sm uppercase tracking-[0.22em]"
                style={{
                  border: '1px solid var(--color-guide-pill-border)',
                  backgroundColor: 'var(--color-guide-pill-bg)',
                  color: 'color-mix(in srgb, var(--color-guide-fg) 80%, transparent)',
                }}
              >
                Tap anywhere to continue
              </p>
            </div>
          </button>
        ) : null}
      </div>

      <div className="mt-auto flex flex-nowrap items-center justify-between gap-2 border-t border-[var(--color-divider)] pt-2 sm:gap-4">
        <button
          className="glass-panel whitespace-nowrap rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-3 py-2 text-sm font-semibold text-[var(--color-text-strong)] transition hover:border-[var(--color-accent-primary)] sm:px-4 sm:py-3"
          onClick={onPrev}
          type="button"
        >
          ← Previous
        </button>
        <div className="whitespace-nowrap rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-3 py-2 text-center text-sm text-[var(--color-text-body)] sm:px-4">
          Card {session.currentIndexInGroup} / {session.currentGroupSize}
        </div>
        <button
          className="glass-panel whitespace-nowrap rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-3 py-2 text-sm font-semibold text-[var(--color-text-strong)] transition hover:border-[var(--color-accent-primary)] sm:px-4 sm:py-3"
          onClick={onNext}
          type="button"
        >
          Next →
        </button>
      </div>
    </section>
  )
}
