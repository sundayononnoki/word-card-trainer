import type { DailyQuoteCache } from '../types'

type DailyQuoteHeroProps = {
  deckCount: number
  quote: DailyQuoteCache
  onChangeView: (view: 'study' | 'library' | 'settings') => void
  onSpeak: () => void
  currentView: 'study' | 'library' | 'settings'
}

const NAV_ITEMS = [
  { id: 'study', label: 'Study' },
  { id: 'library', label: 'Decks' },
  { id: 'settings', label: 'Settings' },
] as const

export function DailyQuoteHero({
  deckCount,
  quote,
  onChangeView,
  onSpeak,
  currentView,
}: DailyQuoteHeroProps) {
  return (
    <div className="glass-panel flex min-h-[14rem] flex-col justify-between rounded-[1.75rem] border border-white/10 px-6 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Word Card Trainer</p>
          <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
            Daily quote
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-sm text-[var(--color-text-muted)]">
          {deckCount} deck{deckCount === 1 ? '' : 's'}
        </span>
      </div>

      <button
        className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-white/25 hover:bg-white/8"
        onClick={onSpeak}
        type="button"
      >
        <p className="font-display text-3xl leading-tight tracking-tight text-[var(--color-text-strong)] sm:text-4xl">
          “{quote.text}”
        </p>
        {quote.author ? (
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            {quote.author}
          </p>
        ) : null}
      </button>

      <nav className="mt-6 flex flex-wrap gap-2">
        {NAV_ITEMS.map((item) => {
          const active = item.id === currentView

          return (
            <button
              key={item.id}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-transparent bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active-text)]'
                  : 'border-white/10 bg-white/5 text-[var(--color-text-strong)] hover:border-white/25'
              }`}
              onClick={() => onChangeView(item.id)}
              type="button"
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
