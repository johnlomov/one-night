import { defineStore } from 'pinia'

import {
  defaultSelectedRoleIds,
  getNightRoles,
  getRoleById,
  getRoleCount,
  recommendedRoleOrder,
  roles,
} from '@/config/roles'

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

function createRecommendedRoles(requiredRoleCount: number) {
  const selectedRoleIds: string[] = []

  for (const roleId of recommendedRoleOrder) {
    const role = getRoleById(roleId)

    if (role && getRoleCount(selectedRoleIds, role.id) < role.maxCount) {
      selectedRoleIds.push(role.id)
    }
  }

  return selectedRoleIds.slice(0, requiredRoleCount)
}

function createRandomRoles(requiredRoleCount: number) {
  const pool = roles.flatMap((role) => Array.from({ length: role.maxCount }, () => role.id))
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5)
  const selectedRoleIds = shuffledPool.slice(0, requiredRoleCount)

  if (!selectedRoleIds.includes('werewolf')) {
    const firstVillageIndex = selectedRoleIds.findIndex(
      (roleId) => getRoleById(roleId)?.team === 'village',
    )

    selectedRoleIds[firstVillageIndex === -1 ? 0 : firstVillageIndex] = 'werewolf'
  }

  return selectedRoleIds
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
    requiredRoleCount: (state) => state.playerCount + 3,
    selectedRoleCount: (state) => state.selectedRoles.length,
    selectedRoleCounts: (state) =>
      roles.reduce<Record<string, number>>((counts, role) => {
        counts[role.id] = getRoleCount(state.selectedRoles, role.id)
        return counts
      }, {}),
    currentAction: (state) => state.nightQueue[state.currentActionIndex] ?? null,
    isNightComplete: (state) =>
      state.nightQueue.length > 0 && state.currentActionIndex >= state.nightQueue.length,
    setupIssue(): string | null {
      if (this.selectedRoleCount < this.requiredRoleCount) {
        return `Добавьте ещё ${this.requiredRoleCount - this.selectedRoleCount} карт.`
      }

      if (this.selectedRoleCount > this.requiredRoleCount) {
        return `Уберите ${this.selectedRoleCount - this.requiredRoleCount} карт.`
      }

      if (!this.selectedRoles.includes('werewolf')) {
        return 'Добавьте хотя бы одного оборотня.'
      }

      return null
    },
    canStartGame(): boolean {
      return this.setupIssue === null
    },
  },
  actions: {
    setRoleCount(roleId: string, count: number) {
      const role = getRoleById(roleId)

      if (!role) {
        return
      }

      const normalizedCount = Math.max(0, Math.min(count, role.maxCount))
      const otherRoleIds = this.selectedRoles.filter((selectedRoleId) => selectedRoleId !== roleId)

      this.selectedRoles = [
        ...otherRoleIds,
        ...Array.from({ length: normalizedCount }, () => roleId),
      ]
    },
    incrementRole(roleId: string) {
      const currentCount = getRoleCount(this.selectedRoles, roleId)
      this.setRoleCount(roleId, currentCount + 1)
    },
    decrementRole(roleId: string) {
      const currentCount = getRoleCount(this.selectedRoles, roleId)
      this.setRoleCount(roleId, currentCount - 1)
    },
    applyRecommendedRoles() {
      this.selectedRoles = createRecommendedRoles(this.requiredRoleCount)
    },
    randomizeRoles() {
      this.selectedRoles = createRandomRoles(this.requiredRoleCount)
    },
    startGame() {
      if (!this.canStartGame) {
        return
      }

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
