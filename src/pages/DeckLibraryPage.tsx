import { useState } from 'react'
import { DeckProgressBar } from '../components/DeckProgressBar'
import { getDeckCompletionRatio } from '../lib/study'
import type { DeckRecord, StudyProgress } from '../types'

const GROUP_BUTTONS_PER_PAGE = 12

type DeckLibraryPageProps = {
  decks: DeckRecord[]
  activeDeckId: string
  groupSize: number
  progressByDeck: Record<string, StudyProgress>
  onAddWord: () => void
  onSelectDeck: (deckId: string) => void
  onSelectGroup: (deckId: string, groupNumber: number) => void
  onImport: () => void
}

export function DeckLibraryPage({
  decks,
  activeDeckId,
  groupSize,
  progressByDeck,
  onAddWord,
  onSelectDeck,
  onSelectGroup,
  onImport,
}: DeckLibraryPageProps) {
  const [groupPageByDeck, setGroupPageByDeck] = useState<Record<string, number>>({})

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-4 lg:grid-cols-2">
        {decks.map((deck) => {
          const progress = progressByDeck[deck.id]
          const completionRatio = getDeckCompletionRatio(
            deck.entryCount,
            progress?.completedEntryOrders ?? [],
          )
          const currentOrder = progress?.currentEntryOrder ?? 0
          const currentGroup = Math.floor(currentOrder / groupSize) + 1
          const totalGroups = Math.max(1, Math.ceil(deck.entryCount / groupSize))
          const currentGroupPage = Math.max(1, Math.ceil(currentGroup / GROUP_BUTTONS_PER_PAGE))
          const groupPage = Math.min(
            groupPageByDeck[deck.id] ?? currentGroupPage,
            Math.max(1, Math.ceil(totalGroups / GROUP_BUTTONS_PER_PAGE)),
          )
          const pageCount = Math.max(1, Math.ceil(totalGroups / GROUP_BUTTONS_PER_PAGE))
          const pageStartGroup = (groupPage - 1) * GROUP_BUTTONS_PER_PAGE + 1
          const pageEndGroup = Math.min(pageStartGroup + GROUP_BUTTONS_PER_PAGE - 1, totalGroups)
          const visibleGroups = Array.from(
            { length: Math.max(0, pageEndGroup - pageStartGroup + 1) },
            (_, index) => pageStartGroup + index,
          )
          const currentTrackRatio = totalGroups === 0 ? 0 : currentGroup / totalGroups
          const isActive = deck.id === activeDeckId

          function updateGroupPage(nextPage: number) {
            setGroupPageByDeck((current) => ({
              ...current,
              [deck.id]: Math.max(1, Math.min(nextPage, pageCount)),
            }))
          }

          return (
            <article
              key={deck.id}
              className={`glass-panel rounded-[2rem] p-6 ${
                isActive ? 'ring-1 ring-[#a6ffcb]/40 lg:col-span-2' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{deck.source === 'builtin' ? 'Built-in deck' : 'Imported deck'}</p>
                  <h2 className="mt-3 font-display text-3xl text-[var(--color-text-strong)]">{deck.name}</h2>
                </div>
                <span className="rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  {deck.entryCount} cards
                </span>
              </div>
              <div className="mt-6 space-y-5">
                <DeckProgressBar
                  detail={`${Math.round(completionRatio * 100)}%`}
                  label="Visited cards"
                  value={completionRatio}
                />
                <DeckProgressBar
                  detail={`Group ${Math.min(currentGroup, totalGroups)}`}
                  label="Current track"
                  value={currentTrackRatio}
                />
              </div>
              {isActive ? (
                <div className="mt-8 border-t border-white/8 pt-6">
                  <div className="mb-6 flex flex-wrap gap-3">
                    <button
                      className="inline-flex rounded-full border border-transparent bg-[var(--color-nav-active-bg)] px-5 py-3 text-sm font-semibold text-[var(--color-nav-active-text)] transition hover:opacity-90"
                      onClick={onAddWord}
                      type="button"
                    >
                      Add word to this deck
                    </button>
                    <button
                      className="inline-flex rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-5 py-3 text-sm font-semibold text-[var(--color-text-strong)] transition hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-soft-hover)]"
                      onClick={onImport}
                      type="button"
                    >
                      Create deck from workbook
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {visibleGroups.map((groupNumber) => {
                      const groupStart = (groupNumber - 1) * groupSize + 1
                      const groupEnd = Math.min(groupNumber * groupSize, deck.entryCount)
                      const isCurrentGroup = groupNumber === Math.min(currentGroup, totalGroups)

                      return (
                        <button
                          key={groupNumber}
                          className={`rounded-[1.5rem] border px-5 py-6 text-left transition ${
                            isCurrentGroup
                              ? 'border-[#a6ffcb]/45 bg-[#a6ffcb]/10 shadow-[0_0_0_1px_rgba(166,255,203,0.16)]'
                              : 'border-[var(--color-surface-border)] bg-[var(--color-surface-soft)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-soft-hover)]'
                          }`}
                          onClick={() => onSelectGroup(deck.id, groupNumber)}
                          type="button"
                        >
                          <p className="font-display text-2xl text-[var(--color-text-strong)]">Group {groupNumber}</p>
                          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                            Cards {groupStart}-{groupEnd}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-5">
                    <button
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] text-xl text-[var(--color-text-strong)] transition hover:border-[var(--color-accent-primary)] disabled:cursor-not-allowed disabled:opacity-35"
                      disabled={groupPage <= 1}
                      onClick={() => updateGroupPage(groupPage - 1)}
                      type="button"
                    >
                      ‹
                    </button>
                    <div className="min-w-20 text-center font-display text-3xl text-[var(--color-text-strong)]">
                      {groupPage}
                      <span className="ml-2 text-lg text-[var(--color-text-muted)]">/ {pageCount}</span>
                    </div>
                    <button
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] text-xl text-[var(--color-text-strong)] transition hover:border-[var(--color-accent-primary)] disabled:cursor-not-allowed disabled:opacity-35"
                      disabled={groupPage >= pageCount}
                      onClick={() => updateGroupPage(groupPage + 1)}
                      type="button"
                    >
                      ›
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="mt-6 inline-flex rounded-full border border-transparent bg-[var(--color-nav-active-bg)] px-5 py-3 text-sm font-semibold text-[var(--color-nav-active-text)] transition hover:opacity-90"
                  onClick={() => onSelectDeck(deck.id)}
                  type="button"
                >
                  Study this deck
                </button>
              )}
            </article>
          )
        })}
      </div>
      <aside className="glass-panel h-fit rounded-[2rem] p-6">
        <p className="eyebrow">Deck creation</p>
        <h2 className="mt-3 font-display text-3xl text-[var(--color-text-strong)]">Create a new deck from workbook</h2>
        <p className="mt-4 text-sm leading-6 text-[var(--color-text-body)]">
          Upload a workbook and save it as a separate IndexedDB deck. Your built-in deck, imported
          decks, and progress stay isolated from each other.
        </p>
        <dl className="mt-6 space-y-4 text-sm text-[var(--color-text-body)]">
          <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-4">
            <dt className="eyebrow">Expected columns</dt>
            <dd className="mt-2 leading-6">A: English, B: English sentence, C: Japanese, D: Japanese sentence.</dd>
          </div>
          <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-4">
            <dt className="eyebrow">Storage mode</dt>
            <dd className="mt-2 leading-6">
              Each upload becomes its own deck in IndexedDB. Importing never merges into another deck.
            </dd>
          </div>
          <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-4">
            <dt className="eyebrow">Current group size</dt>
            <dd className="mt-2 leading-6">
              {groupSize} cards per set. Change it in Settings and the app will recompute all groups.
            </dd>
          </div>
        </dl>
        <button
          className="mt-6 inline-flex rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-5 py-3 text-sm font-semibold text-[var(--color-text-strong)] transition hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-soft-hover)]"
          onClick={onImport}
          type="button"
        >
          Create deck
        </button>
      </aside>
    </section>
  )
}
