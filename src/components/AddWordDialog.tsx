import { useState, type FormEvent } from 'react'
import type { NewVocabEntryDraft } from '../types'

type AddWordDialogProps = {
  busy: boolean
  deckName: string
  error: string | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (draft: NewVocabEntryDraft) => Promise<void>
}

const EMPTY_DRAFT: NewVocabEntryDraft = {
  english: '',
  englishSentence: '',
  japanese: '',
  japaneseSentence: '',
}

export function AddWordDialog({
  busy,
  deckName,
  error,
  isOpen,
  onClose,
  onSubmit,
}: AddWordDialogProps) {
  const [draft, setDraft] = useState<NewVocabEntryDraft>(EMPTY_DRAFT)

  if (!isOpen) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({
      english: draft.english.trim(),
      englishSentence: draft.englishSentence.trim(),
      japanese: draft.japanese.trim(),
      japaneseSentence: draft.japaneseSentence.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="glass-panel w-full max-w-2xl rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Add word</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-text-strong)]">Append a new card to {deckName}</h2>
          </div>
          <button
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-[var(--color-text-body)] transition hover:border-white/25"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="block rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <span className="eyebrow">English</span>
            <input
              className="mt-3 w-full rounded-2xl border border-white/10 bg-[var(--color-input-bg)] px-4 py-3 text-[var(--color-text-strong)] outline-none transition focus:border-[var(--color-accent-primary)]/60"
              id="add-word-english"
              name="english"
              onChange={(event) => setDraft((current) => ({ ...current, english: event.target.value }))}
              required
              type="text"
              value={draft.english}
            />
          </label>
          <label className="block rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <span className="eyebrow">English sentence</span>
            <textarea
              className="mt-3 min-h-28 w-full rounded-2xl border border-white/10 bg-[var(--color-input-bg)] px-4 py-3 text-[var(--color-text-strong)] outline-none transition focus:border-[var(--color-accent-primary)]/60"
              id="add-word-english-sentence"
              name="englishSentence"
              onChange={(event) =>
                setDraft((current) => ({ ...current, englishSentence: event.target.value }))
              }
              required
              value={draft.englishSentence}
            />
          </label>
          <label className="block rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <span className="eyebrow">Japanese</span>
            <input
              className="mt-3 w-full rounded-2xl border border-white/10 bg-[var(--color-input-bg)] px-4 py-3 text-[var(--color-text-strong)] outline-none transition focus:border-[var(--color-accent-secondary)]/60"
              id="add-word-japanese"
              name="japanese"
              onChange={(event) => setDraft((current) => ({ ...current, japanese: event.target.value }))}
              required
              type="text"
              value={draft.japanese}
            />
          </label>
          <label className="block rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <span className="eyebrow">Japanese sentence</span>
            <textarea
              className="mt-3 min-h-28 w-full rounded-2xl border border-white/10 bg-[var(--color-input-bg)] px-4 py-3 text-[var(--color-text-strong)] outline-none transition focus:border-[var(--color-accent-secondary)]/60"
              id="add-word-japanese-sentence"
              name="japaneseSentence"
              onChange={(event) =>
                setDraft((current) => ({ ...current, japaneseSentence: event.target.value }))
              }
              required
              value={draft.japaneseSentence}
            />
          </label>
          {error ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-3">
            <button
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-[var(--color-text-strong)] transition hover:border-white/30 hover:bg-white/10"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-full border border-transparent bg-[var(--color-nav-active-bg)] px-5 py-3 text-sm font-semibold text-[var(--color-nav-active-text)] transition hover:bg-[var(--color-accent-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              type="submit"
            >
              {busy ? 'Saving…' : 'Add card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
