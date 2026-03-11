import { useState } from 'react'

type ImportDeckDialogProps = {
  isOpen: boolean
  busy: boolean
  error: string | null
  onClose: () => void
  onImport: (file: File) => Promise<void>
}

export function ImportDeckDialog({
  isOpen,
  busy,
  error,
  onClose,
  onImport,
}: ImportDeckDialogProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="glass-panel w-full max-w-xl rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Create deck</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-text-strong)]">Create a new deck from workbook</h2>
          </div>
          <button
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-[var(--color-text-body)] transition hover:border-white/25"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--color-text-body)]">
          Upload an `.xlsx` file with four columns mapped as English, English sentence, Japanese,
          and Japanese sentence. The workbook will be indexed as a separate deck in IndexedDB.
        </p>
        <label className="mt-6 block rounded-[1.5rem] border border-dashed border-white/18 bg-white/5 p-6 text-center transition hover:border-white/35">
          <input
            accept=".xlsx,.xlsm,.xls,.csv"
            className="sr-only"
            disabled={busy}
            id="import-deck-file"
            name="deckWorkbook"
            onChange={(event) => {
              const file = event.target.files?.[0]
              setSelectedFileName(file?.name ?? null)
              if (!file) {
                return
              }
              void onImport(file)
            }}
            type="file"
          />
          <span className="block font-semibold text-[var(--color-text-strong)]">
            {selectedFileName ?? 'Choose a workbook to import'}
          </span>
          <span className="mt-2 block text-sm text-[var(--color-text-muted)]">
            {busy ? 'Importing and indexing your deck…' : 'Click to select an Excel workbook'}
          </span>
        </label>
        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
