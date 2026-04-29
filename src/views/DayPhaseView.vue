<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import DiscussionTimer from '@/components/DiscussionTimer.vue'
import VotingOverlay from '@/components/VotingOverlay.vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const router = useRouter()
const isVotingOpen = ref(false)

function openVoting() {
  isVotingOpen.value = true
}

function finishVoting() {
  game.showResult()
  void router.push('/result')
}
</script>

<template>
  <section class="screen">
    <div class="screen-header">
      <p class="eyebrow">Дневная фаза</p>
      <h1>Обсуждение</h1>
    </div>

    <DiscussionTimer :duration="game.discussionDuration" @complete="openVoting" />

    <VotingOverlay
      v-if="isVotingOpen"
      :is-complete="game.isVotingComplete"
      :players="game.players"
      :votes="game.votes"
      @close="isVotingOpen = false"
      @submit="finishVoting"
      @vote="game.setVote"
    />
  </section>
</template>
