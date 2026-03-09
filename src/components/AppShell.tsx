import type { ReactNode } from 'react'
import type { ViewName } from '../types'

type AppShellProps = {
  currentView: ViewName
  deckCount: number
  headerPanel?: ReactNode
  onChangeView: (view: ViewName) => void
  children: ReactNode
}

const NAV_ITEMS: Array<{ id: ViewName; label: string }> = [
  { id: 'study', label: 'Study' },
  { id: 'library', label: 'Decks' },
  { id: 'settings', label: 'Settings' },
]

export function AppShell({
  currentView,
  deckCount,
  headerPanel,
  onChangeView,
  children,
}: AppShellProps) {
  return (
    <div className="surface-grid relative min-h-screen overflow-hidden px-4 py-4 text-stone-50 sm:px-6 sm:py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_100%_20%,rgba(166,255,203,0.1),transparent_18%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-6">
        <header className="glass-panel rounded-[2rem] px-5 py-5 sm:px-7">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(520px,0.95fr)] xl:items-stretch">
            <div className="glass-panel flex min-h-[14rem] flex-col justify-between rounded-[1.75rem] border border-white/10 px-6 py-6">
              <p className="eyebrow">Word Card Trainer</p>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <h1 className="font-display text-4xl tracking-tight text-stone-100 sm:text-5xl">
                  Built for deep, daily review.
                </h1>
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-sm text-stone-300">
                  {deckCount} deck{deckCount === 1 ? '' : 's'}
                </span>
              </div>
              <nav className="mt-6 flex flex-wrap gap-2">
                {NAV_ITEMS.map((item) => {
                  const active = item.id === currentView

                  return (
                    <button
                      key={item.id}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? 'border-transparent bg-stone-100 text-stone-900'
                          : 'border-white/10 bg-white/5 text-stone-200 hover:border-white/25'
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
            <div className="min-h-[14rem]">{headerPanel}</div>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  )
}
