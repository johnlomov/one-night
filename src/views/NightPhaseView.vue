<script setup lang="ts">
import { useRouter } from 'vue-router'

import GamePlayer from '@/components/GamePlayer.vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const router = useRouter()

function startDiscussion() {
  game.startDiscussion()
  void router.push('/day')
}
</script>

<template>
  <section class="screen">
    <div class="screen-header">
      <p class="eyebrow">Ночная фаза</p>
      <h1>Все закрывают глаза</h1>
    </div>

    <GamePlayer
      v-if="game.nightQueue.length > 0"
      :action="game.currentAction"
      :action-count="game.nightQueue.length"
      :action-index="game.currentActionIndex"
      :delay-between-roles="game.delayBetweenRoles"
      @complete-night="startDiscussion"
      @next-action="game.nextAction()"
    />

    <div v-else class="phase-panel">
      <p>В выбранном наборе нет ролей с ночными действиями.</p>
      <button type="button" @click="startDiscussion">Перейти к обсуждению</button>
    </div>
  </section>
</template>
