import { WordCard } from '../components/WordCard'
import type { DeckRecord, GroupSnapshot, VocabEntry } from '../types'

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
  if (!activeDeck || !currentEntry) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="glass-panel max-w-lg rounded-[2rem] p-8 text-center">
          <p className="eyebrow">No cards loaded</p>
          <h2 className="mt-3 font-display text-3xl text-stone-100">Choose a deck to begin</h2>
          <p className="mt-4 text-sm leading-6 text-stone-300">
            Once a deck is active, the study page will show exactly one card at a time and remember
            your position automatically.
          </p>
        </div>
      </div>
    )
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex min-h-0 w-full md:flex-1">
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
      </div>

      <div className="mt-auto flex flex-nowrap items-center justify-between gap-2 border-t border-white/8 pt-2 sm:gap-4">
        <button
          className="glass-panel whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-stone-200 transition hover:border-white/30 sm:px-4 sm:py-3"
          onClick={onPrev}
          type="button"
        >
          ← Previous
        </button>
        <div className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-stone-300 sm:px-4">
          Card {session.currentIndexInGroup} / {session.currentGroupSize}
        </div>
        <button
          className="glass-panel whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-stone-200 transition hover:border-white/30 sm:px-4 sm:py-3"
          onClick={onNext}
          type="button"
        >
          Next →
        </button>
      </div>
    </section>
  )
}
