<script setup lang="ts">
import { useGameStore } from '@/stores/game'

const game = useGameStore()
</script>

<template>
  <section class="screen">
    <div class="screen-header">
      <p class="eyebrow">Ночная фаза</p>
      <h1>Ведущий готовит очередь действий</h1>
    </div>

    <div class="phase-panel">
      <p>Текущий шаг: {{ game.currentAction?.title ?? 'пока нет действий' }}</p>
      <button type="button" @click="game.startDiscussion()">Перейти к обсуждению</button>
    </div>
  </section>
</template>
