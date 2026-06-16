<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useDayStore } from "~/stores/day";

const { init: initTheme } = useTheme();
const { init: initAuth } = useAuth();
const { start: startSync } = useCloudSync();
const day = useDayStore();

onMounted(async () => {
  initTheme();
  initAuth();
  startSync();

  // Avanza automaticamente a "oggi" quando l'app torna in primo piano o cambia il giorno
  // (l'app nativa resta viva: senza questo, a mezzanotte il giorno non avanzerebbe).
  day.refreshDay();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) day.refreshDay();
  });

  const { Capacitor } = await import("@capacitor/core");
  if (Capacitor.isNativePlatform()) {
    const { App } = await import("@capacitor/app");
    App.addListener("resume", () => day.refreshDay());
  }
});
</script>
