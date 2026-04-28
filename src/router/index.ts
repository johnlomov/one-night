import { createRouter, createWebHistory } from 'vue-router'

import DayPhaseView from '@/views/DayPhaseView.vue'
import GameResultView from '@/views/GameResultView.vue'
import GameSetupView from '@/views/GameSetupView.vue'
import NightPhaseView from '@/views/NightPhaseView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'setup',
      component: GameSetupView,
    },
    {
      path: '/night',
      name: 'night',
      component: NightPhaseView,
    },
    {
      path: '/day',
      name: 'day',
      component: DayPhaseView,
    },
    {
      path: '/result',
      name: 'result',
      component: GameResultView,
    },
  ],
})

export default router
