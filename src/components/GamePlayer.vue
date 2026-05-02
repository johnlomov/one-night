<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import PhaseTimer from '@/components/PhaseTimer.vue'
import { useAudioController } from '@/composables/useAudioController'
import type { NightAction } from '@/stores/game'

const props = defineProps<{
  action: NightAction | null
  actionIndex: number
  actionCount: number
  delayBetweenRoles: number
}>()

const emit = defineEmits<{
  completeNight: []
  nextAction: []
}>()

const AUTO_ADVANCE_DELAY = 1_000
const NIGHT_COMPLETE_ANNOUNCEMENT =
  'Ночь окончена. Все игроки открывают глаза. Начинается дневное обсуждение.'

type PlayerStatus =
  | 'idle'
  | 'speaking'
  | 'waiting'
  | 'advancing'
  | 'announcing'
  | 'paused'
  | 'complete'

const audio = useAudioController()
const status = ref<PlayerStatus>('idle')
const timerKey = ref(0)
const lastActiveStatus = ref<PlayerStatus>('idle')
const activeRunId = ref(0)
let advanceTimeoutId: number | undefined

const currentStep = computed(() => Math.min(props.actionIndex + 1, props.actionCount))
const progressLabel = computed(() => `${currentStep.value} / ${props.actionCount}`)
const isTimerRunning = computed(() => status.value === 'waiting')
const canReplay = computed(
  () =>
    Boolean(props.action) &&
    status.value !== 'speaking' &&
    status.value !== 'advancing' &&
    status.value !== 'announcing',
)
const canPause = computed(
  () => status.value === 'speaking' || status.value === 'waiting' || status.value === 'announcing',
)
const canResume = computed(() => status.value === 'paused')

function clearAdvanceTimeout() {
  if (advanceTimeoutId) {
    window.clearTimeout(advanceTimeoutId)
    advanceTimeoutId = undefined
  }
}

async function playAction() {
  if (!props.action) {
    status.value = 'complete'
    return
  }

  const runId = activeRunId.value + 1
  activeRunId.value = runId
  clearAdvanceTimeout()
  timerKey.value += 1
  status.value = 'speaking'

  await audio.speak(props.action.speechText)

  if (activeRunId.value !== runId) {
    return
  }

  status.value = 'waiting'
}

function replayAction() {
  void playAction()
}

function pausePlayback() {
  if (!canPause.value) {
    return
  }

  lastActiveStatus.value = status.value
  status.value = 'paused'
  audio.pause()
}

function resumePlayback() {
  if (!canResume.value) {
    return
  }

  if (lastActiveStatus.value === 'speaking' || lastActiveStatus.value === 'announcing') {
    audio.resume()
  }

  status.value = lastActiveStatus.value === 'idle' ? 'waiting' : lastActiveStatus.value
}

async function completeNight() {
  const runId = activeRunId.value + 1
  activeRunId.value = runId
  clearAdvanceTimeout()
  status.value = 'announcing'

  await audio.speak(NIGHT_COMPLETE_ANNOUNCEMENT)

  if (activeRunId.value !== runId) {
    return
  }

  status.value = 'complete'
  emit('completeNight')
}

function goNext() {
  activeRunId.value += 1
  clearAdvanceTimeout()
  audio.stop()

  if (props.actionIndex >= props.actionCount - 1) {
    void completeNight()
    return
  }

  emit('nextAction')
}

function autoAdvanceAfterTimer() {
  activeRunId.value += 1
  status.value = 'advancing'
  clearAdvanceTimeout()
  advanceTimeoutId = window.setTimeout(() => {
    goNext()
  }, AUTO_ADVANCE_DELAY)
}

watch(
  () => props.action?.id,
  () => {
    if (props.action) {
      void playAction()
    } else {
      status.value = 'complete'
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  activeRunId.value += 1
  clearAdvanceTimeout()
  audio.stop()
})
</script>

<template>
  <section class="game-player" aria-live="polite">
    <div class="game-player__meta">
      <span>Шаг {{ progressLabel }}</span>
      <span v-if="status === 'advancing'">Время вышло</span>
      <span v-if="status === 'announcing'">Ночь окончена</span>
      <span v-if="!audio.isSupported">Озвучка недоступна</span>
    </div>

    <div class="game-player__focus">
      <p class="eyebrow">{{ status === 'announcing' ? 'Объявление' : 'Просыпается' }}</p>
      <h2>
        {{ status === 'announcing' ? 'Ночь завершена' : (action?.title ?? 'Ночь завершена') }}
      </h2>
      <p>
        {{
          status === 'announcing'
            ? NIGHT_COMPLETE_ANNOUNCEMENT
            : (action?.instruction ?? 'Все ночные действия выполнены.')
        }}
      </p>
      <p v-if="status === 'advancing'" class="game-player__notice">
        Время вышло. Следующая роль через секунду.
      </p>
    </div>

    <PhaseTimer
      :duration="delayBetweenRoles"
      :is-running="isTimerRunning"
      :reset-key="`${action?.id ?? 'empty'}-${timerKey}`"
      @complete="autoAdvanceAfterTimer"
    />

    <div class="player-controls">
      <button v-if="canPause" type="button" class="secondary-button" @click="pausePlayback">
        Пауза
      </button>
      <button v-if="canResume" type="button" class="secondary-button" @click="resumePlayback">
        Продолжить
      </button>
      <button type="button" class="secondary-button" :disabled="!canReplay" @click="replayAction">
        Повторить
      </button>
      <button type="button" @click="goNext">
        {{ actionIndex >= actionCount - 1 ? 'Перейти к дню' : 'Следующая роль' }}
      </button>
    </div>
  </section>
</template>
