<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { roleTeamLabels, roles } from '@/config/roles'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const {
  selectedRoleCounts,
  selectedRoleCount,
  requiredRoleCount,
  playerCount,
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
      <p class="eyebrow">Этап 3</p>
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
              <div class="role-stepper" :aria-label="`Количество карт: ${role.name}`">
                <button
                  type="button"
                  class="icon-button"
                  :disabled="getSelectedRoleCount(role.id) === 0"
                  @click="game.decrementRole(role.id)"
                >
                  −
                </button>
                <output>{{ getSelectedRoleCount(role.id) }}</output>
                <button
                  type="button"
                  class="icon-button"
                  :disabled="getSelectedRoleCount(role.id) === role.maxCount"
                  @click="game.incrementRole(role.id)"
                >
                  +
                </button>
              </div>
            </header>
            <p>{{ role.description }}</p>
          </article>
        </div>
      </section>

      <aside class="setup-sidebar" aria-labelledby="setup-sidebar-title">
        <div class="section-heading">
          <h2 id="setup-sidebar-title">Параметры</h2>
        </div>

        <label class="field">
          <span>Игроки</span>
          <input v-model.number="playerCount" min="3" max="10" type="number" />
        </label>

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
