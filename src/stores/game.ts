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

export interface Player {
  id: string
  name: string
}

export interface VotingResult {
  eliminatedPlayerIds: string[]
  maxVotes: number
  tally: Record<string, number>
}

interface GameState {
  phase: GamePhase
  selectedRoles: string[]
  playerCount: number
  playerNames: string[]
  delayBetweenRoles: number
  discussionDuration: number
  nightQueue: NightAction[]
  currentActionIndex: number
  votes: Record<string, string>
  votingResult: VotingResult | null
  finalPlayerRoles: Record<string, string>
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

function createDefaultPlayerNames(playerCount: number) {
  return Array.from({ length: playerCount }, (_, index) => `Игрок ${index + 1}`)
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    phase: 'setup',
    selectedRoles: [...defaultSelectedRoleIds],
    playerCount: 3,
    playerNames: createDefaultPlayerNames(3),
    delayBetweenRoles: 10_000,
    discussionDuration: 300,
    nightQueue: [],
    currentActionIndex: 0,
    votes: {},
    votingResult: null,
    finalPlayerRoles: {},
  }),
  getters: {
    players: (state): Player[] =>
      Array.from({ length: state.playerCount }, (_, index) => ({
        id: `player-${index + 1}`,
        name: state.playerNames[index]?.trim() || `Игрок ${index + 1}`,
      })),
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
    isVotingComplete(): boolean {
      return this.players.every((player) => Boolean(this.votes[player.id]))
    },
    areFinalRolesComplete(): boolean {
      const finalPlayerRoles = this.finalPlayerRoles ?? {}

      return this.players.every((player) => Boolean(finalPlayerRoles[player.id]))
    },
  },
  actions: {
    setPlayerCount(playerCount: number) {
      const normalizedPlayerCount = Math.max(3, Math.min(10, playerCount))
      const nextPlayerNames = createDefaultPlayerNames(normalizedPlayerCount)

      for (let index = 0; index < normalizedPlayerCount; index += 1) {
        nextPlayerNames[index] = this.playerNames[index] ?? nextPlayerNames[index]
      }

      this.playerCount = normalizedPlayerCount
      this.playerNames = nextPlayerNames
      this.finalPlayerRoles = Object.fromEntries(
        Object.entries(this.finalPlayerRoles ?? {}).filter(([playerId]) =>
          Array.from(
            { length: normalizedPlayerCount },
            (_, index) => `player-${index + 1}`,
          ).includes(playerId),
        ),
      )
    },
    setPlayerName(playerIndex: number, name: string) {
      const playerNames = [...this.playerNames]
      playerNames[playerIndex] = name
      this.playerNames = playerNames
    },
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
      this.votes = {}
      this.votingResult = null
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
      this.votes = {}
      this.votingResult = null
    },
    setVote(voterId: string, targetId: string) {
      if (voterId === targetId) {
        return
      }

      this.votes = {
        ...this.votes,
        [voterId]: targetId,
      }
    },
    clearVote(voterId: string) {
      const votes = { ...this.votes }
      delete votes[voterId]
      this.votes = votes
    },
    setFinalPlayerRole(playerId: string, roleId: string) {
      if (!roleId) {
        const finalPlayerRoles = { ...(this.finalPlayerRoles ?? {}) }
        delete finalPlayerRoles[playerId]
        this.finalPlayerRoles = finalPlayerRoles
        return
      }

      this.finalPlayerRoles = {
        ...(this.finalPlayerRoles ?? {}),
        [playerId]: roleId,
      }
    },
    resolveVoting() {
      const tally = this.players.reduce<Record<string, number>>((counts, player) => {
        counts[player.id] = 0
        return counts
      }, {})

      for (const targetId of Object.values(this.votes)) {
        tally[targetId] = (tally[targetId] ?? 0) + 1
      }

      const maxVotes = Math.max(0, ...Object.values(tally))
      const eliminatedPlayerIds =
        maxVotes > 1
          ? Object.entries(tally)
              .filter(([, voteCount]) => voteCount === maxVotes)
              .map(([playerId]) => playerId)
          : []

      this.votingResult = {
        eliminatedPlayerIds,
        maxVotes,
        tally,
      }
    },
    showResult() {
      this.resolveVoting()
      this.phase = 'result'
    },
    resetGame() {
      this.phase = 'setup'
      this.currentActionIndex = 0
      this.nightQueue = []
      this.votes = {}
      this.votingResult = null
      this.finalPlayerRoles = {}
    },
  },
})
