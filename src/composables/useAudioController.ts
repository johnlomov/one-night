import { computed, ref } from 'vue'

export function useAudioController() {
  const isSpeaking = ref(false)
  const isPaused = ref(false)
  const currentText = ref('')
  const isSupported = computed(
    () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
  )

  function stop() {
    if (!isSupported.value) {
      isSpeaking.value = false
      isPaused.value = false
      return
    }

    window.speechSynthesis.cancel()
    isSpeaking.value = false
    isPaused.value = false
  }

  function speak(text: string) {
    stop()
    currentText.value = text

    if (!isSupported.value) {
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)

      utterance.lang = 'ru-RU'
      utterance.rate = 0.92
      utterance.pitch = 0.95
      utterance.volume = 1

      utterance.onstart = () => {
        isSpeaking.value = true
        isPaused.value = false
      }

      utterance.onend = () => {
        isSpeaking.value = false
        isPaused.value = false
        resolve()
      }

      utterance.onerror = () => {
        isSpeaking.value = false
        isPaused.value = false
        resolve()
      }

      window.speechSynthesis.speak(utterance)
    })
  }

  function pause() {
    if (!isSupported.value || !isSpeaking.value) {
      return
    }

    window.speechSynthesis.pause()
    isPaused.value = true
  }

  function resume() {
    if (!isSupported.value || !isPaused.value) {
      return
    }

    window.speechSynthesis.resume()
    isPaused.value = false
  }

  return {
    currentText,
    isPaused,
    isSpeaking,
    isSupported,
    pause,
    resume,
    speak,
    stop,
  }
}
