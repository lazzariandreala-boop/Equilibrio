<template>
  <div>
    <!-- Finché non si sa se c'è un utente non si mostra nulla: prima
         comparivano header e schede, poi il salto al login. -->
    <div v-if="!ready" class="fixed inset-0 flex flex-col items-center justify-center bg-surface" style="z-index: 100">
      <div class="relative">
        <div class="absolute rounded-full" style="inset: -26px; background: radial-gradient(closest-side, var(--water-glow), transparent 70%)" />
        <img :src="logo" alt="" width="96" height="96" class="relative" style="border-radius: 24px" />
      </div>
      <div class="display text-ink" style="font-size: 24px; font-weight: 800; margin-top: 18px">Equilibrio</div>
      <div class="flex gap-1.5" style="margin-top: 16px">
        <span v-for="(t, i) in ['water', 'alcohol', 'move', 'food']" :key="t" class="rounded-full pulse-dot"
          :class="`grad-${t}`" :style="{ width: '9px', height: '9px', animationDelay: `${i * 140}ms` }" />
      </div>
    </div>

    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useDayStore } from "~/stores/day";
import logo from "~/assets/logo-dark.png";

const { init: initTheme } = useTheme();
const { init: initAuth, ready } = useAuth();
const { start: startSync } = useCloudSync();
const day = useDayStore();
const route = useRoute();
const { user } = useAuth();

// Quando l'autenticazione si risolve, la rotta corrente va rivalutata:
// il middleware era già passato quando ancora non si sapeva nulla.
watch(ready, (isReady) => {
  if (!isReady) return;
  if (!user.value && route.path !== "/login") navigateTo("/login");
  else if (user.value && route.path === "/login") navigateTo("/");
});

onMounted(async () => {
  initTheme();
  initAuth();
  startSync();

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

<style>
@keyframes pulse-dot {
  0%, 100% { opacity: 0.3; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1); }
}
.pulse-dot {
  animation: pulse-dot 1.1s ease-in-out infinite;
}
</style>
