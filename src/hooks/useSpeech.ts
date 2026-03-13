import { useCallback, useEffect, useRef, useState } from 'react'

type SpeakLanguage = 'en-US' | 'ja-JP'

type SpeakOptions = {
  lang?: SpeakLanguage
  preferredVoiceURI?: string
}

function isChromePreferredVoice(voice: SpeechSynthesisVoice) {
  const fingerprint = `${voice.name} ${voice.voiceURI}`.toLowerCase()
  return fingerprint.includes('google') || fingerprint.includes('chrome') || !voice.localService
}

function rankVoice(voice: SpeechSynthesisVoice, lang: SpeakLanguage, preferredVoiceURI?: string) {
  const normalizedLang = lang.toLowerCase()
  const languagePrefix = normalizedLang.split('-')[0]
  const voiceLang = voice.lang.toLowerCase()

  let score = 0

  if (preferredVoiceURI && voice.voiceURI === preferredVoiceURI) {
    score += 1000
  }

  if (voiceLang.startsWith(normalizedLang)) {
    score += 140
  } else if (voiceLang.startsWith(languagePrefix)) {
    score += 100
  }

  if (isChromePreferredVoice(voice)) {
    score += 50
  }

  if (voice.default) {
    score += 20
  }

  return score
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: SpeakLanguage,
  preferredVoiceURI?: string,
) {
  const ranked = voices
    .filter((voice) => rankVoice(voice, lang, preferredVoiceURI) > 0)
    .slice()
    .sort(
      (left, right) =>
        rankVoice(right, lang, preferredVoiceURI) - rankVoice(left, lang, preferredVoiceURI),
    )

  return ranked[0] ?? null
}

export function useSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const isSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window

  useEffect(() => {
    voicesRef.current = voices
  }, [voices])

  useEffect(() => {
    if (!isSupported) {
      return
    }

    const syncVoices = () => {
      setVoices(window.speechSynthesis.getVoices())
    }

    syncVoices()
    window.speechSynthesis.addEventListener('voiceschanged', syncVoices)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', syncVoices)
    }
  }, [isSupported])

  const recommendedEnglishVoice = pickVoice(voices, 'en-US')
  const recommendedJapaneseVoice = pickVoice(voices, 'ja-JP')

  const speakText = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (!isSupported || !text.trim()) {
        return
      }

      const { lang = 'en-US', preferredVoiceURI } = options
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang

      const voice = pickVoice(voicesRef.current, lang, preferredVoiceURI)
      if (voice) {
        utterance.voice = voice
      }

      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    },
    [isSupported],
  )

  return {
    isSupported,
    voices,
    recommendedEnglishVoiceURI: recommendedEnglishVoice?.voiceURI,
    recommendedJapaneseVoiceURI: recommendedJapaneseVoice?.voiceURI,
    speakText,
  }
}
