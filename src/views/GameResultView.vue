<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useGameStore } from '@/stores/game'

const game = useGameStore()
const router = useRouter()

function resetGame() {
  game.resetGame()
  void router.push('/')
}
</script>

<template>
  <section class="screen">
    <div class="screen-header">
      <p class="eyebrow">Итог</p>
      <h1>Результаты партии</h1>
    </div>

    <div class="phase-panel">
      <p>Экран результата подготовлен для логики следующих этапов.</p>
      <button type="button" @click="resetGame">Новая игра</button>
    </div>
  </section>
</template>
