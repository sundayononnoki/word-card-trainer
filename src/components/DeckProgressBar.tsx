type DeckProgressBarProps = {
  label: string
  value: number
  detail: string
}

export function DeckProgressBar({ label, value, detail }: DeckProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        <span>{label}</span>
        <span className="text-[var(--color-text-body)]">{detail}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#a6ffcb,#ffb183)]"
          style={{ width: `${Math.max(0, Math.min(value * 100, 100))}%` }}
        />
      </div>
    </div>
  )
}
