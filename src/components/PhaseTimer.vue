<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { useTimerSounds } from '@/composables/useTimerSounds'

const props = defineProps<{
  duration: number
  isRunning: boolean
  resetKey: string | number
}>()

const emit = defineEmits<{
  complete: []
}>()

const remainingMs = ref(props.duration)
const lastBeepSecond = ref<number | null>(null)
const { playTimeUpTone, playWarningTone } = useTimerSounds()
let intervalId: number | undefined

const remainingSeconds = computed(() => Math.ceil(remainingMs.value / 1000))
const urgencySecond = computed(() => {
  if (!props.isRunning || remainingMs.value === 0 || remainingSeconds.value > 3) {
    return null
  }

  return remainingSeconds.value
})
const progress = computed(() => {
  if (props.duration <= 0) {
    return 100
  }

  return Math.min(100, Math.max(0, ((props.duration - remainingMs.value) / props.duration) * 100))
})

function clearTimer() {
  if (intervalId) {
    window.clearInterval(intervalId)
    intervalId = undefined
  }
}

function startTimer() {
  clearTimer()

  intervalId = window.setInterval(() => {
    remainingMs.value = Math.max(0, remainingMs.value - 100)
    const second = remainingSeconds.value

    if (second <= 3 && second > 0 && lastBeepSecond.value !== second) {
      lastBeepSecond.value = second
      playWarningTone()
    }

    if (remainingMs.value === 0) {
      clearTimer()
      playTimeUpTone()
      emit('complete')
    }
  }, 100)
}

watch(
  () => props.resetKey,
  () => {
    remainingMs.value = props.duration
    lastBeepSecond.value = null

    if (props.isRunning) {
      startTimer()
    } else {
      clearTimer()
    }
  },
)

watch(
  () => props.isRunning,
  (isRunning) => {
    if (isRunning && remainingMs.value > 0) {
      startTimer()
      return
    }

    clearTimer()
  },
  { immediate: true },
)

watch(
  () => props.duration,
  (duration) => {
    remainingMs.value = duration
    lastBeepSecond.value = null
  },
)

onBeforeUnmount(clearTimer)
</script>

<template>
  <div>
    <div class="phase-timer" role="timer" :aria-label="`Осталось ${remainingSeconds} секунд`">
      <div class="phase-timer__track">
        <span class="phase-timer__bar" :style="{ width: `${progress}%` }" />
      </div>
      <strong>{{ remainingSeconds }}</strong>
    </div>
    <div v-if="urgencySecond" class="countdown-overlay" aria-live="assertive">
      <span :key="urgencySecond">{{ urgencySecond }}</span>
    </div>
  </div>
</template>
