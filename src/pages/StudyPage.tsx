import { useState } from 'react'
import { WordCard } from '../components/WordCard'
import type { DeckRecord, GroupSnapshot, VocabEntry } from '../types'

const STUDY_GUIDE_STORAGE_KEY = 'word-card-trainer-study-guide-dismissed-v1'

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
            className="absolute inset-0 z-20 flex items-center justify-center rounded-[2.5rem] bg-black/40 px-6 py-8 text-white backdrop-blur-[3px]"
            onClick={dismissGuide}
            type="button"
          >
            <div className="pointer-events-none flex max-w-md flex-col items-center justify-center gap-10 text-center">
              <div className="space-y-4">
                <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10">
                  <svg aria-hidden="true" className="h-11 w-11" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M11.5 4.2v7.5m0-7.5c0-1 .8-1.7 1.7-1.7s1.7.8 1.7 1.7v7.2m-3.4.3V6.8c0-1-.8-1.7-1.7-1.7S8.1 5.8 8.1 6.8v6.1m7 5.3c-.8.9-1.9 1.5-3.1 1.7-2.5.3-4.8-1.3-5.3-3.7l-.6-3.5c-.2-.9.4-1.8 1.3-2 .7-.1 1.4.1 1.8.7l1.2 1.7"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M5.5 5.4 4 4m14.5 1.4L20 4m-6.8-.8V1.5M3.2 9.4H1.5m21 0h-1.7"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Tap any card to hear it aloud
                </p>
              </div>

              <div className="space-y-4">
                <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10">
                  <svg aria-hidden="true" className="h-11 w-11" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M2.5 8.5h9.8m0 0-2.6-2.4m2.6 2.4-2.6 2.4M11.5 15.5H1.7m0 0 2.6-2.4m-2.6 2.4 2.6 2.4"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M17.2 4.4v7.4m0-7.4c0-1 .8-1.7 1.7-1.7s1.7.8 1.7 1.7v7.2m-3.4.3V7c0-1-.8-1.7-1.7-1.7S13.8 6 13.8 7v6m7 5.3c-.8.9-1.9 1.5-3.1 1.7-2.5.3-4.8-1.3-5.3-3.7l-.6-3.5c-.2-.9.4-1.8 1.3-2 .7-.1 1.4.1 1.8.7l1.2 1.7"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Swipe left or right to change cards
                </p>
              </div>

              <p className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.22em] text-white/80">
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
