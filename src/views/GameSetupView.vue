<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import CounterStepper from '@/components/CounterStepper.vue'
import { roleTeamLabels, roles } from '@/config/roles'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const {
  selectedRoleCounts,
  selectedRoleCount,
  requiredRoleCount,
  playerNames,
  delayBetweenRoles,
  discussionDuration,
  setupIssue,
  canStartGame,
} = storeToRefs(game)
const router = useRouter()

const nightRoleCount = computed(
  () => roles.filter((role) => role.nightAction && getSelectedRoleCount(role.id) > 0).length,
)

function getSelectedRoleCount(roleId: string) {
  return selectedRoleCounts.value[roleId] ?? 0
}

function startGame() {
  if (!canStartGame.value) {
    return
  }

  game.startGame()
  void router.push('/night')
}
</script>

<template>
  <section class="screen">
    <div class="screen-header">
      <p class="eyebrow">Перед партией</p>
      <h1>Настройка партии</h1>
    </div>

    <form class="setup-workspace" @submit.prevent="startGame">
      <section class="role-picker" aria-labelledby="role-picker-title">
        <div class="section-heading">
          <h2 id="role-picker-title">Роли</h2>
          <div class="role-actions">
            <button type="button" class="secondary-button" @click="game.applyRecommendedRoles">
              Рекомендовать
            </button>
            <button type="button" class="secondary-button" @click="game.randomizeRoles">
              Случайно
            </button>
          </div>
        </div>

        <div class="role-grid">
          <article
            v-for="role in roles"
            :key="role.id"
            class="role-card"
            :class="{ 'role-card--active': getSelectedRoleCount(role.id) > 0 }"
          >
            <header class="role-card__header">
              <div>
                <h3>{{ role.name }}</h3>
                <span :class="['team-badge', `team-badge--${role.team}`]">
                  {{ roleTeamLabels[role.team] }}
                </span>
              </div>
              <CounterStepper
                :decrement-disabled="getSelectedRoleCount(role.id) === 0"
                :increment-disabled="getSelectedRoleCount(role.id) === role.maxCount"
                :label="`Количество карт: ${role.name}`"
                :value="getSelectedRoleCount(role.id)"
                @decrement="game.decrementRole(role.id)"
                @increment="game.incrementRole(role.id)"
              />
            </header>
            <p>{{ role.description }}</p>
          </article>
        </div>
      </section>

      <aside class="setup-sidebar" aria-labelledby="setup-sidebar-title">
        <div class="section-heading">
          <h2 id="setup-sidebar-title">Параметры</h2>
        </div>

        <div class="player-count-stepper">
          <span>Игроки</span>
          <CounterStepper
            :decrement-disabled="game.playerCount <= 3"
            :increment-disabled="game.playerCount >= 10"
            label="Количество игроков"
            :value="game.playerCount"
            @decrement="game.setPlayerCount(game.playerCount - 1)"
            @increment="game.setPlayerCount(game.playerCount + 1)"
          />
        </div>

        <section class="player-name-list" aria-labelledby="player-name-list-title">
          <h3 id="player-name-list-title">Имена игроков</h3>
          <label v-for="(_, index) in playerNames" :key="index" class="field">
            <span>Игрок {{ index + 1 }}</span>
            <input
              :value="playerNames[index]"
              maxlength="24"
              type="text"
              @input="game.setPlayerName(index, ($event.target as HTMLInputElement).value)"
            />
          </label>
        </section>

        <label class="field">
          <span>Пауза между ролями</span>
          <input
            v-model.number="delayBetweenRoles"
            min="5000"
            max="15000"
            step="5000"
            type="range"
          />
          <strong>{{ delayBetweenRoles / 1000 }} сек.</strong>
        </label>

        <label class="field">
          <span>Обсуждение</span>
          <input v-model.number="discussionDuration" min="180" max="600" step="60" type="range" />
          <strong>{{ discussionDuration / 60 }} мин.</strong>
        </label>

        <div class="setup-summary" aria-live="polite">
          <div>
            <span>Карты</span>
            <strong>{{ selectedRoleCount }} / {{ requiredRoleCount }}</strong>
          </div>
          <div>
            <span>Ночные действия</span>
            <strong>{{ nightRoleCount }}</strong>
          </div>
        </div>

        <p v-if="setupIssue" class="setup-alert">{{ setupIssue }}</p>
        <p v-else class="setup-ready">Набор готов.</p>

        <button type="submit" :disabled="!canStartGame">Начать игру</button>
      </aside>
    </form>
  </section>
</template>
