<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import { useTimerSounds } from '@/composables/useTimerSounds'

const props = defineProps<{
  duration: number
}>()

const emit = defineEmits<{
  complete: []
}>()

const remainingSeconds = ref(props.duration)
const isRunning = ref(false)
const hasPlayedFinalWarning = ref(false)
const lastBeepSecond = ref<number | null>(null)
const { playDiscussionWarningTone, playTimeUpTone, playWarningTone } = useTimerSounds()
let intervalId: number | undefined

const countdownSecond = computed(() => {
  if (!isRunning.value || remainingSeconds.value === 0 || remainingSeconds.value > 15) {
    return null
  }

  return remainingSeconds.value
})
const isFinalWarningVisible = computed(
  () => remainingSeconds.value > 0 && remainingSeconds.value <= 15,
)
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})
const progress = computed(() => {
  if (props.duration <= 0) {
    return 100
  }

  return Math.min(
    100,
    Math.max(0, ((props.duration - remainingSeconds.value) / props.duration) * 100),
  )
})

function clearTimer() {
  if (intervalId) {
    window.clearInterval(intervalId)
    intervalId = undefined
  }
}

function startTimer() {
  if (isRunning.value) {
    return
  }

  if (remainingSeconds.value === 0) {
    remainingSeconds.value = props.duration
    hasPlayedFinalWarning.value = false
    lastBeepSecond.value = null
  }

  isRunning.value = true
  clearTimer()
  intervalId = window.setInterval(() => {
    remainingSeconds.value = Math.max(0, remainingSeconds.value - 1)

    if (remainingSeconds.value === 15 && !hasPlayedFinalWarning.value) {
      hasPlayedFinalWarning.value = true
      playDiscussionWarningTone()
    }

    if (
      remainingSeconds.value <= 3 &&
      remainingSeconds.value > 0 &&
      lastBeepSecond.value !== remainingSeconds.value
    ) {
      lastBeepSecond.value = remainingSeconds.value
      playWarningTone()
    }

    if (remainingSeconds.value === 0) {
      clearTimer()
      isRunning.value = false
      playTimeUpTone()
      emit('complete')
    }
  }, 1000)
}

function pauseTimer() {
  isRunning.value = false
  clearTimer()
}

function resetTimer() {
  pauseTimer()
  remainingSeconds.value = props.duration
  hasPlayedFinalWarning.value = false
  lastBeepSecond.value = null
}

function completeDiscussion() {
  pauseTimer()
  emit('complete')
}

onBeforeUnmount(clearTimer)
</script>

<template>
  <section class="discussion-timer" aria-live="polite">
    <div class="discussion-timer__time">{{ formattedTime }}</div>
    <p v-if="isFinalWarningVisible" class="discussion-timer__warning">
      До голосования осталось {{ remainingSeconds }} сек.
    </p>
    <div class="phase-timer discussion-timer__progress">
      <div class="phase-timer__track">
        <span class="phase-timer__bar" :style="{ width: `${progress}%` }" />
      </div>
    </div>
    <div class="player-controls discussion-timer__controls">
      <button v-if="!isRunning" type="button" @click="startTimer">
        {{
          remainingSeconds === duration || remainingSeconds === 0
            ? 'Начать обсуждение'
            : 'Продолжить'
        }}
      </button>
      <button v-else type="button" class="secondary-button" @click="pauseTimer">Пауза</button>
      <button type="button" class="secondary-button" @click="resetTimer">Сбросить</button>
      <button type="button" class="secondary-button" @click="completeDiscussion">
        К голосованию
      </button>
    </div>
    <div v-if="countdownSecond" class="countdown-overlay" aria-live="assertive">
      <span :key="countdownSecond">{{ countdownSecond }}</span>
    </div>
  </section>
</template>
