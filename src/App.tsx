import { startTransition, useEffect, useState } from 'react'
import { AddWordDialog } from './components/AddWordDialog'
import { AppShell } from './components/AppShell'
import { DailyQuoteHero } from './components/DailyQuoteHero'
import { ImportDeckDialog } from './components/ImportDeckDialog'
import { DeckLibraryPage } from './pages/DeckLibraryPage'
import { SettingsPage } from './pages/SettingsPage'
import { StudyPage } from './pages/StudyPage'
import { useDailyQuote } from './hooks/useDailyQuote'
import { useDecks } from './hooks/useDecks'
import { useSpeech } from './hooks/useSpeech'
import { useStudySession } from './hooks/useStudySession'
import { DEFAULT_SETTINGS, type AppSettings, type ViewName } from './types'
import { getSettings, saveSettings } from './lib/db'

function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [settingsReady, setSettingsReady] = useState(false)
  const [view, setView] = useState<ViewName>('study')
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isAddWordOpen, setIsAddWordOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importBusy, setImportBusy] = useState(false)
  const [addWordError, setAddWordError] = useState<string | null>(null)
  const [addWordBusy, setAddWordBusy] = useState(false)
  const [revealedEntryId, setRevealedEntryId] = useState<string | null>(null)
  const dailyQuote = useDailyQuote()
  const {
    isSupported,
    voices,
    recommendedEnglishVoiceURI,
    recommendedJapaneseVoiceURI,
    speakText,
  } = useSpeech()
  const {
    ready,
    error,
    decks,
    entries,
    progressByDeck,
    activeDeck,
    importDeck,
    addWord,
  } = useDecks(settings.activeDeckId)
  const session = useStudySession({
    deckId: settings.activeDeckId,
    entryCount: entries.length,
    groupSize: settings.groupSize,
  })
  const currentEntry = entries[session.currentIndex] ?? null

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const savedSettings = await getSettings()
      if (cancelled) {
        return
      }
      setSettings(savedSettings)
      setSettingsReady(true)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!settingsReady) {
      return
    }
    void saveSettings(settings)
  }, [settings, settingsReady])

  useEffect(() => {
    document.documentElement.dataset.theme = settings.themeMode
  }, [settings.themeMode])

  useEffect(() => {
    if (
      !settingsReady ||
      (
        (settings.preferredVoiceURI || !recommendedEnglishVoiceURI) &&
        (settings.preferredJapaneseVoiceURI || !recommendedJapaneseVoiceURI)
      )
    ) {
      return
    }

    setSettings((current) => {
      if (
        (current.preferredVoiceURI || !recommendedEnglishVoiceURI) &&
        (current.preferredJapaneseVoiceURI || !recommendedJapaneseVoiceURI)
      ) {
        return current
      }

      return {
        ...current,
        preferredVoiceURI: current.preferredVoiceURI ?? recommendedEnglishVoiceURI,
        preferredJapaneseVoiceURI:
          current.preferredJapaneseVoiceURI ?? recommendedJapaneseVoiceURI,
      }
    })
  }, [
    recommendedEnglishVoiceURI,
    recommendedJapaneseVoiceURI,
    settings.preferredJapaneseVoiceURI,
    settings.preferredVoiceURI,
    settingsReady,
  ])

  useEffect(() => {
    if (!ready || decks.length === 0) {
      return
    }

    const hasActiveDeck = decks.some((deck) => deck.id === settings.activeDeckId)
    if (hasActiveDeck) {
      return
    }

    setSettings((current) => ({
      ...current,
      activeDeckId: decks[0].id,
    }))
  }, [decks, ready, settings.activeDeckId])

  useEffect(() => {
    setRevealedEntryId(null)
  }, [currentEntry?.id, settings.hideEnglishByDefault])

  useEffect(() => {
    if (!settings.autoSpeakWord || !currentEntry) {
      return
    }
    speakText(currentEntry.english, {
      lang: 'en-US',
      preferredVoiceURI: settings.preferredVoiceURI,
    })
  }, [currentEntry, settings.autoSpeakWord, settings.preferredVoiceURI, speakText])

  useEffect(() => {
    function handleStudyKeyDown(event: KeyboardEvent) {
      if (view !== 'study') {
        return
      }

      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        session.goNext()
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        session.goPrev()
      }
    }

    window.addEventListener('keydown', handleStudyKeyDown)
    return () => {
      window.removeEventListener('keydown', handleStudyKeyDown)
    }
  }, [session, view])

  async function handleImport(file: File) {
    setImportBusy(true)
    setImportError(null)
    try {
      const deck = await importDeck(file)
      setSettings((current) => ({
        ...current,
        activeDeckId: deck.id,
      }))
      startTransition(() => {
        setView('study')
        setIsImportOpen(false)
      })
    } catch (caughtError) {
      setImportError(
        caughtError instanceof Error ? caughtError.message : 'Unable to import this deck.',
      )
    } finally {
      setImportBusy(false)
    }
  }

  async function handleAddWord(draft: {
    english: string
    englishSentence: string
    japanese: string
    japaneseSentence: string
  }) {
    if (!activeDeck) {
      return
    }

    setAddWordBusy(true)
    setAddWordError(null)
    try {
      await addWord(activeDeck.id, draft)
      setIsAddWordOpen(false)
    } catch (caughtError) {
      setAddWordError(
        caughtError instanceof Error ? caughtError.message : 'Unable to add this card.',
      )
    } finally {
      setAddWordBusy(false)
    }
  }

  function updateSettings(patch: Partial<AppSettings>) {
    setSettings((current) => ({
      ...current,
      ...patch,
    }))
  }

  function handleSelectDeck(deckId: string) {
    updateSettings({ activeDeckId: deckId })
    startTransition(() => {
      setView('study')
    })
  }

  function handleSelectGroup(deckId: string, groupNumber: number) {
    if (deckId !== settings.activeDeckId) {
      updateSettings({ activeDeckId: deckId })
      return
    }

    session.goToGroup(groupNumber)
    startTransition(() => {
      setView('study')
    })
  }

  function handleRevealCard() {
    if (!currentEntry || !settings.hideEnglishByDefault) {
      return
    }
    setRevealedEntryId(currentEntry.id)
  }

  function handleSpeakEnglishWord() {
    if (!currentEntry) {
      return
    }

    handleRevealCard()
    speakText(currentEntry.english, {
      lang: 'en-US',
      preferredVoiceURI: settings.preferredVoiceURI,
    })
  }

  function handleSpeakJapaneseWord() {
    if (!currentEntry) {
      return
    }

    speakText(currentEntry.japanese, {
      lang: 'ja-JP',
      preferredVoiceURI: settings.preferredJapaneseVoiceURI,
    })
  }

  function handleSpeakEnglishSentence() {
    if (!currentEntry) {
      return
    }

    speakText(currentEntry.englishSentence, {
      lang: 'en-US',
      preferredVoiceURI: settings.preferredVoiceURI,
    })
  }

  function handleSpeakJapaneseSentence() {
    if (!currentEntry) {
      return
    }

    speakText(currentEntry.japaneseSentence, {
      lang: 'ja-JP',
      preferredVoiceURI: settings.preferredJapaneseVoiceURI,
    })
  }

  function handleSpeakDailyQuote() {
    const text = dailyQuote.author
      ? `${dailyQuote.text}. By ${dailyQuote.author}.`
      : dailyQuote.text

    speakText(text, {
      lang: 'en-US',
      preferredVoiceURI: settings.preferredVoiceURI,
    })
  }

  const isEnglishVisible =
    !settings.hideEnglishByDefault || revealedEntryId === currentEntry?.id
  const mergedProgressByDeck = session.progress
    ? {
        ...progressByDeck,
        [session.progress.deckId]: session.progress,
      }
    : progressByDeck

  return (
    <>
      <AppShell
        currentView={view}
        deckCount={decks.length}
        heroPanel={
          <DailyQuoteHero
            currentView={view}
            deckCount={decks.length}
            onChangeView={setView}
            onSpeak={handleSpeakDailyQuote}
            quote={dailyQuote}
          />
        }
        headerPanel={
          activeDeck && view === 'study' ? (
            <div className="glass-panel flex h-full items-stretch rounded-[1.75rem] border border-white/10 px-5 py-4">
              <div className="grid w-full gap-3 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
                <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="eyebrow">Active deck</p>
                  <p className="font-display text-3xl leading-[0.95] text-[var(--color-text-strong)]">
                    {activeDeck.name}
                  </p>
                </div>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="eyebrow">Visited overall</p>
                  <p className="font-display text-2xl text-[var(--color-text-strong)]">
                    {session.groupSnapshot.completedEntries}
                    <span className="ml-2 text-base text-[var(--color-text-muted)]">
                      / {session.groupSnapshot.totalEntries}
                    </span>
                  </p>
                </div>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="eyebrow">Current progress</p>
                  <p className="font-display text-2xl text-[var(--color-text-strong)]">
                    {session.groupSnapshot.currentIndexInGroup}
                    <span className="ml-2 text-base text-[var(--color-text-muted)]">
                      / {session.groupSnapshot.currentGroupSize}
                    </span>
                  </p>
                </div>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="eyebrow">Saved</p>
                  <p className="text-sm leading-6 text-[var(--color-text-strong)]">
                    {session.progress ? new Date(session.progress.updatedAt).toLocaleString() : 'Not yet'}
                  </p>
                </div>
              </div>
            </div>
          ) : activeDeck ? (
            <div className="glass-panel flex h-full items-stretch rounded-[1.75rem] border border-white/10 px-5 py-4">
              <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="eyebrow">Active deck</p>
                <p className="mt-2 font-display text-3xl text-[var(--color-text-strong)]">{activeDeck.name}</p>
              </div>
            </div>
          ) : (
            <div className="glass-panel flex h-full items-stretch rounded-[1.75rem] border border-white/10 px-5 py-4">
              <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="eyebrow">Status</p>
                <p className="mt-2 text-[var(--color-text-body)]">No deck selected</p>
              </div>
            </div>
          )
        }
        onChangeView={setView}
      >
        {!settingsReady || !ready ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="glass-panel max-w-md p-8 text-center">
              <p className="eyebrow">Loading</p>
              <h2 className="mt-3 font-display text-3xl text-[var(--color-text-strong)]">Preparing your deck room</h2>
              <p className="mt-3 text-sm text-[var(--color-text-body)]">
                The built-in 9000-word deck is being synced into IndexedDB for offline study.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="glass-panel max-w-md p-8 text-center">
              <p className="eyebrow">Database error</p>
              <h2 className="mt-3 font-display text-3xl text-[var(--color-text-strong)]">The deck room did not boot</h2>
              <p className="mt-3 text-sm text-rose-200">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {view === 'library' ? (
              <DeckLibraryPage
                activeDeckId={settings.activeDeckId}
                decks={decks}
                groupSize={settings.groupSize}
                onImport={() => setIsImportOpen(true)}
                onAddWord={() => {
                  setAddWordError(null)
                  setIsAddWordOpen(true)
                }}
                onSelectDeck={handleSelectDeck}
                onSelectGroup={handleSelectGroup}
                progressByDeck={mergedProgressByDeck}
              />
            ) : null}
            {view === 'study' ? (
              <StudyPage
                activeDeck={activeDeck}
                currentEntry={currentEntry}
                hideEnglishByDefault={settings.hideEnglishByDefault}
                isEnglishVisible={isEnglishVisible}
                isSpeechSupported={isSupported}
                onEnglishSentenceClick={handleSpeakEnglishSentence}
                onEnglishWordClick={handleSpeakEnglishWord}
                onJapaneseSentenceClick={handleSpeakJapaneseSentence}
                onJapaneseWordClick={handleSpeakJapaneseWord}
                onPrev={session.goPrev}
                onNext={session.goNext}
                direction={session.direction}
                session={session.groupSnapshot}
              />
            ) : null}
            {view === 'settings' ? (
              <SettingsPage
                groupSize={settings.groupSize}
                hideEnglishByDefault={settings.hideEnglishByDefault}
                autoSpeakWord={settings.autoSpeakWord}
                isSpeechSupported={isSupported}
                themeMode={settings.themeMode}
                preferredVoiceURI={settings.preferredVoiceURI}
                preferredJapaneseVoiceURI={settings.preferredJapaneseVoiceURI}
                recommendedEnglishVoiceURI={recommendedEnglishVoiceURI}
                recommendedJapaneseVoiceURI={recommendedJapaneseVoiceURI}
                voices={voices}
                onAutoSpeakChange={(checked) => updateSettings({ autoSpeakWord: checked })}
                onGroupSizeChange={(groupSize) => updateSettings({ groupSize })}
                onHideEnglishChange={(checked) => updateSettings({ hideEnglishByDefault: checked })}
                onThemeModeChange={(themeMode) => updateSettings({ themeMode })}
                onPreferredVoiceChange={(preferredVoiceURI) => updateSettings({ preferredVoiceURI })}
                onPreferredJapaneseVoiceChange={(preferredJapaneseVoiceURI) =>
                  updateSettings({ preferredJapaneseVoiceURI })
                }
              />
            ) : null}
          </>
        )}
      </AppShell>
      <ImportDeckDialog
        busy={importBusy}
        error={importError}
        isOpen={isImportOpen}
        onClose={() => {
          setIsImportOpen(false)
          setImportError(null)
        }}
        onImport={handleImport}
      />
      <AddWordDialog
        busy={addWordBusy}
        deckName={activeDeck?.name ?? 'current deck'}
        error={addWordError}
        isOpen={isAddWordOpen}
        key={`${activeDeck?.id ?? 'none'}-${isAddWordOpen ? 'open' : 'closed'}`}
        onClose={() => {
          setIsAddWordOpen(false)
          setAddWordError(null)
        }}
        onSubmit={handleAddWord}
      />
    </>
  )
}

export default App
