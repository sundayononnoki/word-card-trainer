import type { DailyQuoteCache, ThemeMode } from '../types'

type DailyQuoteHeroProps = {
  deckCount: number
  quote: DailyQuoteCache
  onChangeView: (view: 'study' | 'library' | 'settings') => void
  onSpeak: () => void
  onToggleTheme: () => void
  currentView: 'study' | 'library' | 'settings'
  themeMode: ThemeMode
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
  onToggleTheme,
  currentView,
  themeMode,
}: DailyQuoteHeroProps) {
  return (
    <div className="glass-panel flex min-h-[14rem] flex-col justify-between rounded-[1.75rem] border border-[var(--color-surface-border)] px-6 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Word Card Trainer</p>
          <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
            Daily quote
          </p>
        </div>
        <span className="rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-3 py-1 text-sm text-[var(--color-text-muted)]">
          {deckCount} deck{deckCount === 1 ? '' : 's'}
        </span>
      </div>

      <button
        className="mt-4 rounded-[1.5rem] border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] px-4 py-4 text-left transition hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-soft-hover)]"
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

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <nav className="flex flex-wrap gap-2">
        {NAV_ITEMS.map((item) => {
          const active = item.id === currentView

          return (
            <button
              key={item.id}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-transparent'
                  : 'border-[var(--color-surface-border)] bg-[var(--color-surface-soft)] text-[var(--color-text-strong)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-soft-hover)]'
              }`}
              onClick={() => onChangeView(item.id)}
              style={
                active
                  ? {
                      backgroundColor: 'var(--color-nav-active-bg)',
                      color: 'var(--color-nav-active-text)',
                    }
                  : undefined
              }
              type="button"
            >
              {item.label}
            </button>
          )
        })}
        </nav>
        <button
          aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
          className="rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-4 py-2 text-sm font-semibold text-[var(--color-text-strong)] transition hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-soft-hover)]"
          onClick={onToggleTheme}
          type="button"
        >
          {themeMode === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>
    </div>
  )
}
