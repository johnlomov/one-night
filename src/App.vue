<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import PwaInstallPrompt from '@/components/PwaInstallPrompt.vue'
</script>

<template>
  <div class="app-shell">
    <header class="app-header" aria-label="Основная навигация">
      <RouterLink class="brand" to="/">One Night</RouterLink>
      <nav class="main-nav">
        <RouterLink to="/">Настройка</RouterLink>
        <RouterLink to="/night">Ночь</RouterLink>
        <RouterLink to="/day">День</RouterLink>
        <RouterLink to="/result">Итог</RouterLink>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <PwaInstallPrompt />
  </div>
</template>
