<script setup lang="ts">
import type { Player } from '@/stores/game'

defineProps<{
  players: Player[]
  votes: Record<string, string>
  isComplete: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: []
  vote: [voterId: string, targetId: string]
}>()
</script>

<template>
  <div class="modal-backdrop" role="presentation">
    <section class="voting-modal" role="dialog" aria-modal="true" aria-labelledby="voting-title">
      <header class="voting-modal__header">
        <div>
          <p class="eyebrow">Голосование</p>
          <h2 id="voting-title">Кого казнить?</h2>
        </div>
        <button type="button" class="secondary-button" @click="emit('close')">Закрыть</button>
      </header>

      <div class="vote-list">
        <article v-for="voter in players" :key="voter.id" class="vote-row">
          <h3>{{ voter.name }}</h3>
          <div class="vote-options">
            <button
              v-for="target in players"
              :key="target.id"
              type="button"
              class="vote-option"
              :class="{ 'vote-option--active': votes[voter.id] === target.id }"
              :disabled="voter.id === target.id"
              @click="emit('vote', voter.id, target.id)"
            >
              {{ target.name }}
            </button>
          </div>
        </article>
      </div>

      <footer class="voting-modal__footer">
        <span>{{ Object.keys(votes).length }} / {{ players.length }} голосов</span>
        <button type="button" :disabled="!isComplete" @click="emit('submit')">
          Показать результат
        </button>
      </footer>
    </section>
  </div>
</template>
