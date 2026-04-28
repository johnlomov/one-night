<script setup lang="ts">
import { useGameStore } from '@/stores/game'

const game = useGameStore()
</script>

<template>
  <section class="screen">
    <div class="screen-header">
      <p class="eyebrow">Дневная фаза</p>
      <h1>Обсуждение</h1>
    </div>

    <div class="phase-panel">
      <p>Длительность: {{ game.discussionDuration / 60 }} минут</p>
      <button type="button" @click="game.showResult()">Завершить голосование</button>
    </div>
  </section>
</template>
