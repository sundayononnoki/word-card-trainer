type GroupNavigatorProps = {
  currentGroupNumber: number
  totalGroups: number
  onPrevGroup: () => void
  onNextGroup: () => void
}

export function GroupNavigator({
  currentGroupNumber,
  totalGroups,
  onPrevGroup,
  onNextGroup,
}: GroupNavigatorProps) {
  return (
    <div className="glass-panel flex items-center justify-between rounded-[1.5rem] px-4 py-3">
      <button
        className="rounded-full border border-white/10 px-3 py-2 text-sm text-stone-200 transition hover:border-white/30"
        onClick={onPrevGroup}
        type="button"
      >
        ← Prev group
      </button>
      <div className="text-center">
        <p className="eyebrow">Group</p>
        <p className="mt-1 font-display text-2xl text-stone-100">
          {currentGroupNumber}
          <span className="ml-2 text-base text-stone-400">/ {totalGroups}</span>
        </p>
      </div>
      <button
        className="rounded-full border border-white/10 px-3 py-2 text-sm text-stone-200 transition hover:border-white/30"
        onClick={onNextGroup}
        type="button"
      >
        Next group →
      </button>
    </div>
  )
}
