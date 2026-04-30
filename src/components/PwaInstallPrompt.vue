<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const isDismissed = ref(false)
const isInstalled = ref(false)
const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
const isStandalone = computed(
  () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true,
)
const canInstall = computed(
  () =>
    !isInstalled.value &&
    !isDismissed.value &&
    !isStandalone.value &&
    Boolean(deferredPrompt.value),
)
const showIosHint = computed(
  () => isIos && !isInstalled.value && !isDismissed.value && !isStandalone.value,
)

function handleBeforeInstallPrompt(event: Event) {
  event.preventDefault()
  deferredPrompt.value = event as BeforeInstallPromptEvent
}

function handleAppInstalled() {
  isInstalled.value = true
  deferredPrompt.value = null
}

async function installApp() {
  if (!deferredPrompt.value) {
    return
  }

  const promptEvent = deferredPrompt.value
  deferredPrompt.value = null
  await promptEvent.prompt()
  const choice = await promptEvent.userChoice

  if (choice.outcome !== 'accepted') {
    isDismissed.value = true
  }
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
</script>

<template>
  <aside v-if="canInstall || showIosHint" class="install-prompt" aria-live="polite">
    <div>
      <strong>Установить One Night</strong>
      <p v-if="canInstall">
        Приложение откроется без адресной строки и будет доступно с экрана телефона.
      </p>
      <p v-else>На iPhone нажмите «Поделиться», затем «На экран Домой».</p>
    </div>
    <div class="install-prompt__actions">
      <button v-if="canInstall" type="button" @click="installApp">Установить</button>
      <button type="button" class="secondary-button" @click="isDismissed = true">Скрыть</button>
    </div>
  </aside>
</template>
