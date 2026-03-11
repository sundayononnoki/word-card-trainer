import type { ThemeMode } from '../types'

type SettingsPageProps = {
  groupSize: number
  hideEnglishByDefault: boolean
  autoSpeakWord: boolean
  themeMode: ThemeMode
  isSpeechSupported: boolean
  preferredVoiceURI?: string
  preferredJapaneseVoiceURI?: string
  recommendedEnglishVoiceURI?: string
  recommendedJapaneseVoiceURI?: string
  voices: SpeechSynthesisVoice[]
  onGroupSizeChange: (groupSize: number) => void
  onHideEnglishChange: (checked: boolean) => void
  onAutoSpeakChange: (checked: boolean) => void
  onThemeModeChange: (themeMode: ThemeMode) => void
  onPreferredVoiceChange: (voiceURI?: string) => void
  onPreferredJapaneseVoiceChange: (voiceURI?: string) => void
}

function isBrowserTtsVoice(voice: SpeechSynthesisVoice) {
  const fingerprint = `${voice.name} ${voice.voiceURI}`.toLowerCase()
  return fingerprint.includes('google') || fingerprint.includes('chrome') || !voice.localService
}

export function SettingsPage({
  groupSize,
  hideEnglishByDefault,
  autoSpeakWord,
  themeMode,
  isSpeechSupported,
  preferredVoiceURI,
  preferredJapaneseVoiceURI,
  recommendedEnglishVoiceURI,
  recommendedJapaneseVoiceURI,
  voices,
  onGroupSizeChange,
  onHideEnglishChange,
  onAutoSpeakChange,
  onThemeModeChange,
  onPreferredVoiceChange,
  onPreferredJapaneseVoiceChange,
}: SettingsPageProps) {
  const englishBrowserVoices = voices.filter(
    (voice) => voice.lang.toLowerCase().startsWith('en') && isBrowserTtsVoice(voice),
  )
  const japaneseBrowserVoices = voices.filter(
    (voice) => voice.lang.toLowerCase().startsWith('ja') && isBrowserTtsVoice(voice),
  )

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <article className="glass-panel rounded-[2rem] p-6">
        <p className="eyebrow">Study defaults</p>
        <h2 className="mt-3 font-display text-3xl text-[var(--color-text-strong)]">Tune the session rhythm</h2>
        <div className="mt-6 space-y-5">
          <label className="block rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <span className="eyebrow">Cards per group</span>
            <input
              className="mt-4 w-full rounded-2xl border border-white/10 bg-[var(--color-input-bg)] px-4 py-3 text-lg text-[var(--color-text-strong)] outline-none transition focus:border-[var(--color-accent-primary)]/60"
              id="settings-group-size"
              max={200}
              min={5}
              name="groupSize"
              onChange={(event) => {
                const nextValue = Number(event.target.value)
                if (!Number.isFinite(nextValue)) {
                  return
                }
                onGroupSizeChange(Math.max(5, Math.min(200, Math.round(nextValue))))
              }}
              type="number"
              value={groupSize}
            />
            <span className="mt-3 block text-sm leading-6 text-[var(--color-text-muted)]">
              Change this any time. Group progress is recalculated from cards you have already
              visited.
            </span>
          </label>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <span className="eyebrow">Theme mode</span>
            <div className="mt-4 flex flex-wrap gap-3">
              {(['dark', 'light'] as const).map((value) => {
                const active = themeMode === value

                return (
                  <button
                    key={value}
                    className={`inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold capitalize leading-none transition ${
                      active
                        ? 'border-transparent'
                        : 'border-white/10 bg-white/5 text-[var(--color-text-strong)] hover:border-white/25'
                    }`}
                    onClick={() => onThemeModeChange(value)}
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
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
          <label className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div>
              <p className="font-semibold text-[var(--color-text-strong)]">Hide English title by default</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Use Japanese and the example sentence first, then tap the card to reveal the word.
              </p>
            </div>
            <input
              checked={hideEnglishByDefault}
              className="mt-1 h-5 w-5 accent-[#a6ffcb]"
              id="settings-hide-english"
              name="hideEnglishByDefault"
              onChange={(event) => onHideEnglishChange(event.target.checked)}
              type="checkbox"
            />
          </label>
          <label className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div>
              <p className="font-semibold text-[var(--color-text-strong)]">Auto-speak current word</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Read the English word automatically every time the card changes.
              </p>
            </div>
            <input
              checked={autoSpeakWord}
              className="mt-1 h-5 w-5 accent-[#a6ffcb]"
              disabled={!isSpeechSupported}
              id="settings-auto-speak"
              name="autoSpeakWord"
              onChange={(event) => onAutoSpeakChange(event.target.checked)}
              type="checkbox"
            />
          </label>
        </div>
      </article>
      <article className="glass-panel rounded-[2rem] p-6">
        <p className="eyebrow">Speech</p>
        <h2 className="mt-3 font-display text-3xl text-[var(--color-text-strong)]">Voice source</h2>
        <p className="mt-4 text-sm leading-6 text-[var(--color-text-body)]">
          The first version uses browser speech synthesis. You can pin separate Chrome-preferred
          voices for English and Japanese playback.
        </p>
        <div className="mt-6 space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <label className="block">
            <span className="eyebrow">English voice</span>
            <select
              className="mt-4 w-full rounded-2xl border border-white/10 bg-[var(--color-input-bg)] px-4 py-3 text-[var(--color-text-strong)] outline-none transition focus:border-[var(--color-accent-primary)]/60"
              disabled={!isSpeechSupported || englishBrowserVoices.length === 0}
              id="settings-english-voice"
              name="preferredEnglishVoice"
              onChange={(event) =>
                onPreferredVoiceChange(event.target.value ? event.target.value : undefined)
              }
              value={preferredVoiceURI ?? recommendedEnglishVoiceURI ?? ''}
            >
              {englishBrowserVoices.length === 0 ? (
                <option value="">No browser English voices available</option>
              ) : (
                englishBrowserVoices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} · {voice.lang}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow">Japanese voice</span>
            <select
              className="mt-4 w-full rounded-2xl border border-white/10 bg-[var(--color-input-bg)] px-4 py-3 text-[var(--color-text-strong)] outline-none transition focus:border-[var(--color-accent-secondary)]/60"
              disabled={!isSpeechSupported || japaneseBrowserVoices.length === 0}
              id="settings-japanese-voice"
              name="preferredJapaneseVoice"
              onChange={(event) =>
                onPreferredJapaneseVoiceChange(event.target.value ? event.target.value : undefined)
              }
              value={preferredJapaneseVoiceURI ?? recommendedJapaneseVoiceURI ?? ''}
            >
              {japaneseBrowserVoices.length === 0 ? (
                <option value="">No browser Japanese voices available</option>
              ) : (
                japaneseBrowserVoices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} · {voice.lang}
                  </option>
                ))
              )}
            </select>
          </label>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            {isSpeechSupported
              ? `${voices.length} browser voices detected on this device. Only voices exposed by the current browser are shown here.`
              : 'This browser does not expose speech synthesis.'}
          </p>
        </div>
      </article>
    </section>
  )
}
