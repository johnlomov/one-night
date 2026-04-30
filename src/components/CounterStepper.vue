<script setup lang="ts">
defineProps<{
  decrementDisabled?: boolean
  incrementDisabled?: boolean
  label: string
  value: number
}>()

const emit = defineEmits<{
  decrement: []
  increment: []
}>()
</script>

<template>
  <div class="counter-stepper" :aria-label="label">
    <button
      type="button"
      class="icon-button"
      :disabled="decrementDisabled"
      @click="emit('decrement')"
    >
      −
    </button>
    <output>{{ value }}</output>
    <button
      type="button"
      class="icon-button"
      :disabled="incrementDisabled"
      @click="emit('increment')"
    >
      +
    </button>
  </div>
</template>
