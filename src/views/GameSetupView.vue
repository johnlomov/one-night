<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { roles } from '@/config/roles'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const { selectedRoles, playerCount, delayBetweenRoles, discussionDuration } = storeToRefs(game)
const router = useRouter()

function startGame() {
  game.startGame()
  void router.push('/night')
}
</script>

<template>
  <section class="screen">
    <div class="screen-header">
      <p class="eyebrow">Этап 1</p>
      <h1>Настройка партии</h1>
    </div>

    <form class="setup-panel" @submit.prevent="startGame">
      <fieldset class="role-list">
        <legend>Роли</legend>
        <label v-for="role in roles" :key="role.id" class="role-option">
          <input v-model="selectedRoles" :value="role.id" type="checkbox" />
          <span>
            <strong>{{ role.name }}</strong>
            <small>{{ role.description }}</small>
          </span>
        </label>
      </fieldset>

      <label>
        <span>Игроки</span>
        <input v-model.number="playerCount" min="3" max="10" type="number" />
      </label>

      <label>
        <span>Пауза между ролями, секунд</span>
        <input v-model.number="delayBetweenRoles" min="5000" max="15000" step="5000" type="range" />
        <strong>{{ delayBetweenRoles / 1000 }}</strong>
      </label>

      <label>
        <span>Обсуждение, минут</span>
        <input v-model.number="discussionDuration" min="180" max="600" step="60" type="range" />
        <strong>{{ discussionDuration / 60 }}</strong>
      </label>

      <button type="submit">Начать игру</button>
    </form>
  </section>
</template>
