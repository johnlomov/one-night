function createAudioContext() {
  const AudioContext =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext

  if (!AudioContext) {
    return null
  }

  return new AudioContext()
}

export function useTimerSounds() {
  function playWarningTone() {
    const audioContext = createAudioContext()

    if (!audioContext) {
      return
    }

    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const startTime = audioContext.currentTime

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(660, startTime)
    gain.gain.setValueAtTime(0.0001, startTime)
    gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.24)

    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(startTime)
    oscillator.stop(startTime + 0.26)
    oscillator.onended = () => void audioContext.close()
  }

  function playTimeUpTone() {
    const audioContext = createAudioContext()

    if (!audioContext) {
      return
    }

    const gain = audioContext.createGain()
    const startTime = audioContext.currentTime
    const firstTone = audioContext.createOscillator()
    const secondTone = audioContext.createOscillator()

    firstTone.type = 'triangle'
    firstTone.frequency.setValueAtTime(520, startTime)
    secondTone.type = 'triangle'
    secondTone.frequency.setValueAtTime(390, startTime + 0.18)

    gain.gain.setValueAtTime(0.0001, startTime)
    gain.gain.exponentialRampToValueAtTime(0.26, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.56)

    firstTone.connect(gain)
    secondTone.connect(gain)
    gain.connect(audioContext.destination)

    firstTone.start(startTime)
    firstTone.stop(startTime + 0.22)
    secondTone.start(startTime + 0.18)
    secondTone.stop(startTime + 0.58)
    secondTone.onended = () => void audioContext.close()
  }

  function playDiscussionWarningTone() {
    const audioContext = createAudioContext()

    if (!audioContext) {
      return
    }

    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const startTime = audioContext.currentTime

    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(440, startTime)
    oscillator.frequency.setValueAtTime(520, startTime + 0.14)
    gain.gain.setValueAtTime(0.0001, startTime)
    gain.gain.exponentialRampToValueAtTime(0.16, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.36)

    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(startTime)
    oscillator.stop(startTime + 0.38)
    oscillator.onended = () => void audioContext.close()
  }

  return {
    playDiscussionWarningTone,
    playTimeUpTone,
    playWarningTone,
  }
}
