<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { getRoleById, roleTeamLabels } from '@/config/roles'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const router = useRouter()

const playerNamesById = computed(() =>
  game.players.reduce<Record<string, string>>((names, player) => {
    names[player.id] = player.name
    return names
  }, {}),
)
const finalPlayerRoles = computed(() => game.finalPlayerRoles ?? {})
const eliminatedPlayers = computed(
  () =>
    game.votingResult?.eliminatedPlayerIds.map((playerId) => playerNamesById.value[playerId]) ?? [],
)
const voteRows = computed(() =>
  game.players.map((player) => {
    const targetId = game.votes[player.id]

    return {
      id: player.id,
      voterName: player.name,
      targetName: targetId ? playerNamesById.value[targetId] : 'нет голоса',
      voteCount: game.votingResult?.tally[player.id] ?? 0,
    }
  }),
)
const finalRoleRows = computed(() =>
  game.players.map((player) => {
    const roleId = finalPlayerRoles.value[player.id] ?? ''
    const role = roleId ? getRoleById(roleId) : undefined

    return {
      id: player.id,
      name: player.name,
      role,
      roleId,
    }
  }),
)
const selectedFinalRoleCounts = computed(() =>
  Object.values(finalPlayerRoles.value).reduce<Record<string, number>>((counts, roleId) => {
    counts[roleId] = (counts[roleId] ?? 0) + 1
    return counts
  }, {}),
)
const partyRoleCounts = computed(() =>
  game.selectedRoles.reduce<Record<string, number>>((counts, roleId) => {
    counts[roleId] = (counts[roleId] ?? 0) + 1
    return counts
  }, {}),
)
const availableFinalRoleOptions = computed(() =>
  Object.entries(partyRoleCounts.value)
    .map(([roleId, count]) => {
      const role = getRoleById(roleId)

      if (!role) {
        return null
      }

      return {
        count,
        role,
        roleId,
      }
    })
    .filter(
      (
        option,
      ): option is {
        count: number
        role: NonNullable<ReturnType<typeof getRoleById>>
        roleId: string
      } => Boolean(option),
    ),
)
const killedPlayerIds = computed(() => {
  const killedIds = new Set(game.votingResult?.eliminatedPlayerIds ?? [])

  for (const playerId of [...killedIds]) {
    if (finalPlayerRoles.value[playerId] === 'hunter') {
      const hunterTargetId = game.votes[playerId]

      if (hunterTargetId) {
        killedIds.add(hunterTargetId)
      }
    }
  }

  return [...killedIds]
})
const winnerResult = computed(() => {
  if (!game.areFinalRolesComplete) {
    return null
  }

  const playersWithRoles = game.players.map((player) => ({
    ...player,
    role: getRoleById(finalPlayerRoles.value[player.id]),
  }))
  const tannerWinners = playersWithRoles.filter(
    (player) => player.role?.id === 'tanner' && killedPlayerIds.value.includes(player.id),
  )

  if (tannerWinners.length > 0) {
    return {
      title: 'Побеждает кожевник',
      description: 'Кожевник хотел быть казнённым, и деревня выполнила его условие победы.',
      winners: tannerWinners.map((player) => player.name),
    }
  }

  const werewolves = playersWithRoles.filter((player) => player.role?.id === 'werewolf')
  const killedWerewolves = werewolves.filter((player) => killedPlayerIds.value.includes(player.id))

  if (werewolves.length > 0) {
    if (killedWerewolves.length > 0) {
      return {
        title: 'Побеждает деревня',
        description: `Казнён оборотень: ${killedWerewolves.map((player) => player.name).join(', ')}.`,
        winners: playersWithRoles
          .filter((player) => player.role?.team === 'village')
          .map((player) => player.name),
      }
    }

    return {
      title: 'Побеждают оборотни',
      description: 'В игре был оборотень, но ни один оборотень не был казнён.',
      winners: playersWithRoles
        .filter((player) => player.role?.team === 'werewolf')
        .map((player) => player.name),
    }
  }

  if (killedPlayerIds.value.length === 0) {
    return {
      title: 'Побеждает деревня',
      description: 'Оборотней среди игроков не было, и деревня никого не казнила.',
      winners: playersWithRoles
        .filter((player) => player.role?.team === 'village')
        .map((player) => player.name),
    }
  }

  return {
    title: 'Деревня проиграла',
    description: 'Оборотней среди игроков не было, но деревня всё равно казнила игрока.',
    winners: [] as string[],
  }
})
const resultTitle = computed(() => {
  if (!game.votingResult) {
    return 'Голосование не завершено'
  }

  if (eliminatedPlayers.value.length === 0) {
    return 'Никто не казнён'
  }

  if (eliminatedPlayers.value.length === 1) {
    return `${eliminatedPlayers.value[0]} казнён`
  }

  return 'Казнено несколько игроков'
})
const resultDescription = computed(() => {
  if (!game.votingResult) {
    return 'Завершите голосование, чтобы увидеть итог партии.'
  }

  if (eliminatedPlayers.value.length === 0) {
    return 'Максимум голосов был один, поэтому по правилам никто не погибает.'
  }

  return `Больше всего голосов: ${game.votingResult.maxVotes}.`
})

function resetGame() {
  game.resetGame()
  void router.push('/')
}

function updateFinalRole(playerId: string, event: Event) {
  const select = event.target as HTMLSelectElement
  game.setFinalPlayerRole(playerId, select.value)
}

function isFinalRoleOptionDisabled(roleId: string, currentRoleId: string) {
  if (roleId === currentRoleId) {
    return false
  }

  return (selectedFinalRoleCounts.value[roleId] ?? 0) >= (partyRoleCounts.value[roleId] ?? 0)
}
</script>

<template>
  <section class="screen">
    <div class="screen-header">
      <p class="eyebrow">Итог</p>
      <h1>Результаты партии</h1>
    </div>

    <section class="result-layout">
      <div class="result-summary">
        <p class="eyebrow">Решение деревни</p>
        <h2>{{ resultTitle }}</h2>
        <p>{{ resultDescription }}</p>
        <p v-if="eliminatedPlayers.length > 1" class="result-summary__names">
          {{ eliminatedPlayers.join(', ') }}
        </p>
      </div>

      <div class="result-details">
        <section class="result-panel result-panel--wide">
          <h2>Финальные роли</h2>
          <div class="final-role-list">
            <label v-for="row in finalRoleRows" :key="row.id" class="final-role-field">
              <span>{{ row.name }}</span>
              <select :value="row.roleId" @change="updateFinalRole(row.id, $event)">
                <option value="">Выберите роль</option>
                <option
                  v-for="option in availableFinalRoleOptions"
                  :key="option.roleId"
                  :disabled="isFinalRoleOptionDisabled(option.roleId, row.roleId)"
                  :value="option.roleId"
                >
                  {{ option.role.name }} ×{{ option.count }}
                </option>
              </select>
            </label>
          </div>
        </section>

        <section class="result-panel">
          <h2>Голоса</h2>
          <div class="result-table">
            <div v-for="row in voteRows" :key="row.id" class="result-row">
              <span>{{ row.voterName }}</span>
              <strong>{{ row.targetName }}</strong>
            </div>
          </div>
        </section>

        <section class="result-panel">
          <h2>Счёт</h2>
          <div class="result-table">
            <div v-for="row in voteRows" :key="`${row.id}-score`" class="result-row">
              <span>{{ row.voterName }}</span>
              <strong>{{ row.voteCount }}</strong>
            </div>
          </div>
        </section>

        <section v-if="winnerResult" class="result-panel result-panel--wide winner-panel">
          <p class="eyebrow">Победители</p>
          <h2>{{ winnerResult.title }}</h2>
          <p>{{ winnerResult.description }}</p>
          <p v-if="winnerResult.winners.length > 0" class="winner-panel__names">
            {{ winnerResult.winners.join(', ') }}
          </p>
        </section>

        <section v-else class="result-panel result-panel--wide">
          <h2>Кто выигрывает</h2>
          <ul class="result-rules">
            <li>Деревня выигрывает, если казнён хотя бы один оборотень.</li>
            <li>Оборотни выигрывают, если в игре был оборотень и ни один оборотень не казнён.</li>
            <li>
              Если оборотней среди игроков не было, деревня выигрывает, когда никто не казнён.
            </li>
            <li>Кожевник выигрывает один, если казнили именно его.</li>
          </ul>
        </section>

        <section v-if="game.areFinalRolesComplete" class="result-panel result-panel--wide">
          <h2>Роли игроков</h2>
          <div class="result-table">
            <div v-for="row in finalRoleRows" :key="`${row.id}-role`" class="result-row">
              <span>{{ row.name }}</span>
              <strong>
                {{ row.role?.name }}
                <small v-if="row.role">({{ roleTeamLabels[row.role.team] }})</small>
              </strong>
            </div>
          </div>
        </section>
      </div>

      <div class="player-controls result-actions">
        <button type="button" @click="resetGame">Новая игра</button>
      </div>
    </section>
  </section>
</template>
