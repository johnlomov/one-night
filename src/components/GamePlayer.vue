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

type PlayerStatus = 'idle' | 'speaking' | 'waiting' | 'paused' | 'complete'

const audio = useAudioController()
const status = ref<PlayerStatus>('idle')
const timerKey = ref(0)
const lastActiveStatus = ref<PlayerStatus>('idle')
const activeRunId = ref(0)

const currentStep = computed(() => Math.min(props.actionIndex + 1, props.actionCount))
const progressLabel = computed(() => `${currentStep.value} / ${props.actionCount}`)
const isTimerRunning = computed(() => status.value === 'waiting')
const canReplay = computed(() => Boolean(props.action) && status.value !== 'speaking')
const canPause = computed(() => status.value === 'speaking' || status.value === 'waiting')
const canResume = computed(() => status.value === 'paused')

async function playAction() {
  if (!props.action) {
    status.value = 'complete'
    return
  }

  const runId = activeRunId.value + 1
  activeRunId.value = runId
  timerKey.value += 1
  status.value = 'speaking'

  await audio.speak(props.action.instruction)

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

  if (lastActiveStatus.value === 'speaking') {
    audio.resume()
  }

  status.value = lastActiveStatus.value === 'idle' ? 'waiting' : lastActiveStatus.value
}

function goNext() {
  activeRunId.value += 1
  audio.stop()

  if (props.actionIndex >= props.actionCount - 1) {
    status.value = 'complete'
    emit('completeNight')
    return
  }

  emit('nextAction')
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
  audio.stop()
})
</script>

<template>
  <section class="game-player" aria-live="polite">
    <div class="game-player__meta">
      <span>Шаг {{ progressLabel }}</span>
      <span v-if="!audio.isSupported">Озвучка недоступна</span>
    </div>

    <div class="game-player__focus">
      <p class="eyebrow">Просыпается</p>
      <h2>{{ action?.title ?? 'Ночь завершена' }}</h2>
      <p>{{ action?.instruction ?? 'Все ночные действия выполнены.' }}</p>
    </div>

    <PhaseTimer
      :duration="delayBetweenRoles"
      :is-running="isTimerRunning"
      :reset-key="`${action?.id ?? 'empty'}-${timerKey}`"
      @complete="goNext"
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
