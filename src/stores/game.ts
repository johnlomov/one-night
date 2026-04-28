import { defineStore } from 'pinia'

import { defaultSelectedRoleIds, getNightRoles } from '@/config/roles'

export type GamePhase = 'setup' | 'night' | 'day' | 'result'

export interface NightAction {
  id: string
  roleId: string
  title: string
  instruction: string
}

interface GameState {
  phase: GamePhase
  selectedRoles: string[]
  playerCount: number
  delayBetweenRoles: number
  discussionDuration: number
  nightQueue: NightAction[]
  currentActionIndex: number
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    phase: 'setup',
    selectedRoles: [...defaultSelectedRoleIds],
    playerCount: 3,
    delayBetweenRoles: 10_000,
    discussionDuration: 300,
    nightQueue: [],
    currentActionIndex: 0,
  }),
  getters: {
    currentAction: (state) => state.nightQueue[state.currentActionIndex] ?? null,
    isNightComplete: (state) =>
      state.nightQueue.length > 0 && state.currentActionIndex >= state.nightQueue.length,
  },
  actions: {
    startGame() {
      this.phase = 'night'
      this.currentActionIndex = 0
      this.nightQueue = getNightRoles(this.selectedRoles).map((role) => ({
        id: `night-${role.id}`,
        roleId: role.id,
        title: role.name,
        instruction: role.nightAction,
      }))
    },
    nextAction() {
      if (this.currentActionIndex < this.nightQueue.length) {
        this.currentActionIndex += 1
      }
    },
    startDiscussion() {
      this.phase = 'day'
    },
    showResult() {
      this.phase = 'result'
    },
    resetGame() {
      this.phase = 'setup'
      this.currentActionIndex = 0
      this.nightQueue = []
    },
  },
})
