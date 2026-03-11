import type { DailyQuoteCache } from '../types'

type DailyQuoteHeroProps = {
  deckCount: number
  quote: DailyQuoteCache
  onSpeak: () => void
}

export function DailyQuoteHero({
  deckCount,
  quote,
  onSpeak,
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

      <p className="mt-6 max-w-xl text-sm leading-6 text-[var(--color-text-body)]">
        Tap the quote to hear it. The top floating header keeps study, decks, settings, and theme controls always within reach while this card stays focused on the daily quote.
      </p>
    </div>
  )
}
