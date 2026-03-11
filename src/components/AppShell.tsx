import type { ReactNode } from 'react'
import type { ThemeMode, ViewName } from '../types'

type AppShellProps = {
  currentView: ViewName
  deckCount: number
  themeMode: ThemeMode
  heroPanel?: ReactNode
  headerPanel?: ReactNode
  onChangeView: (view: ViewName) => void
  onToggleTheme: () => void
  children: ReactNode
}

const NAV_ITEMS: Array<{ id: ViewName; label: string }> = [
  { id: 'study', label: 'Study' },
  { id: 'library', label: 'Decks' },
  { id: 'settings', label: 'Settings' },
]

function ThemeModeIcon({ mode }: { mode: ThemeMode }) {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      {mode === 'dark' ? (
        <path
          d="M21 12.8A9 9 0 1 1 11.2 3a7.2 7.2 0 1 0 9.8 9.8Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      ) : (
        <>
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </>
      )}
    </svg>
  )
}

export function AppShell({
  currentView,
  deckCount,
  themeMode,
  heroPanel,
  headerPanel,
  onChangeView,
  onToggleTheme,
  children,
}: AppShellProps) {
  return (
    <div className="surface-grid relative min-h-screen overflow-hidden px-4 py-4 text-[var(--color-text-body)] sm:px-6 sm:py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,var(--color-glow-warm),transparent_22%),radial-gradient(circle_at_100%_20%,var(--color-glow-cool),transparent_18%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-4 z-40 px-4 sm:top-5 sm:px-6 lg:px-8">
        <div className="pointer-events-auto mx-auto flex max-w-7xl justify-center xl:justify-start">
          <div className="glass-panel flex min-h-16 items-center rounded-[1.75rem] border border-[var(--color-surface-border)] px-3 py-3 shadow-[0_20px_60px_var(--color-shadow-strong)]">
            <div className="flex flex-wrap items-center gap-2 rounded-[1.25rem] bg-[var(--color-surface-soft)]/60 p-1.5">
              {NAV_ITEMS.map((item) => {
                const active = item.id === currentView

                return (
                  <button
                    key={item.id}
                    className={`inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold leading-none transition ${
                      active
                        ? 'border-transparent'
                        : 'border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-strong)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-soft-hover)]'
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
              <button
                aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
                className="group inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-pill-border)] bg-[var(--color-pill-bg)] px-2 text-[var(--color-text-strong)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-soft-hover)]"
                onClick={onToggleTheme}
                type="button"
              >
                <span className="relative grid grid-cols-2 items-center gap-1 rounded-full bg-[var(--color-surface-soft)]/55 p-1">
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-1 top-1 inline-flex h-7 w-7 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      themeMode === 'dark' ? 'translate-x-0 scale-100' : 'translate-x-8 scale-100'
                    }`}
                    style={{
                      backgroundColor: 'var(--color-nav-active-bg)',
                      boxShadow: '0 8px 24px var(--color-shadow-strong)',
                    }}
                  />
                  <span
                    className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      themeMode === 'dark'
                        ? 'scale-100 text-[var(--color-nav-active-text)]'
                        : 'scale-95 text-[var(--color-text-muted)] group-hover:scale-100 group-hover:text-[var(--color-text-strong)]'
                    }`}
                  >
                    <ThemeModeIcon mode="dark" />
                  </span>
                  <span
                    className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      themeMode === 'light'
                        ? 'scale-100 text-[var(--color-nav-active-text)]'
                        : 'scale-95 text-[var(--color-text-muted)] group-hover:scale-100 group-hover:text-[var(--color-text-strong)]'
                    }`}
                  >
                    <ThemeModeIcon mode="light" />
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-6 pt-24 sm:pt-26">
        <header className="glass-panel rounded-[2rem] px-5 py-5 sm:px-7">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(520px,0.95fr)] xl:items-stretch">
            {heroPanel ?? (
              <div className="glass-panel flex min-h-[14rem] flex-col justify-between rounded-[1.75rem] border border-white/10 px-6 py-6">
                <p className="eyebrow">Word Card Trainer</p>
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <h1 className="font-display text-4xl tracking-tight text-[var(--color-text-strong)] sm:text-5xl">
                    Built for deep, daily review.
                  </h1>
                  <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-sm text-[var(--color-text-muted)]">
                    {deckCount} deck{deckCount === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="mt-6 max-w-xl text-sm leading-6 text-[var(--color-text-body)]">
                  One focused card per screen, local-first deck progress, and fast switching between study, deck management, and settings.
                </p>
              </div>
            )}
            <div className="min-h-[14rem]">{headerPanel}</div>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  )
}
