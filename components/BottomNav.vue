<template>
  <nav class="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none" style="z-index: 45">
    <div class="pointer-events-auto w-full" style="max-width: 560px; padding: 0 12px 12px">
      <!-- Con le sezioni salute attive le voci possono superare lo spazio
           disponibile: la barra scorre invece di comprimere le etichette
           fino a renderle illeggibili. -->
      <div class="flex rounded-4xl px-1.5 py-1.5"
        :class="scrollable ? 'overflow-x-auto' : ''"
        :style="{
          background: 'var(--card)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--nav-shadow)',
          scrollbarWidth: 'none',
        }">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to"
          class="tap rounded-3xl flex flex-col items-center relative shrink-0"
          :style="{
            padding: '8px 0 7px',
            flex: scrollable ? '0 0 auto' : '1 1 0',
            minWidth: scrollable ? '62px' : '0',
            ...(active(item.to) ? { background: `var(--${item.tone}-soft)` } : {}),
          }">
          <component :is="item.icon" :size="20"
            :color="active(item.to) ? `var(--${item.tone})` : 'var(--faint)'" />
          <span :style="{
            fontSize: '9.5px', fontWeight: 600, marginTop: '3px', whiteSpace: 'nowrap',
            color: active(item.to) ? `var(--${item.tone})` : 'var(--faint)',
          }">{{ item.label }}</span>
          <span v-if="active(item.to)" class="absolute rounded-full"
            :style="{ bottom: '3px', width: '5px', height: '5px', background: `var(--${item.tone})` }" />
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  Home, Utensils, Activity, CalendarDays, User, Scale, Droplet, Baby, CalendarHeart,
} from "lucide-vue-next";
import { useSettingsStore } from "~/stores/settings";

const route = useRoute();
const settings = useSettingsStore();

const items = computed(() => {
  const list = [
    { to: "/", icon: Home, label: "Oggi", tone: "water" },
    { to: "/pasti", icon: Utensils, label: "Pasti", tone: "food" },
    { to: "/movimento", icon: Activity, label: "Sport", tone: "move" },
    { to: "/corpo", icon: Scale, label: "Corpo", tone: "water" },
  ];

  if (settings.profile.diabetes) {
    list.push({ to: "/glicemia", icon: Droplet, label: "Glicemia", tone: "water" });
  }
  // In gravidanza le previsioni del ciclo sono sospese: si mostra la sezione
  // dedicata al posto di quella del ciclo, non entrambe.
  if (settings.profile.pregnant) {
    list.push({ to: "/gravidanza", icon: Baby, label: "Gravidanza", tone: "alcohol" });
  } else if (settings.profile.cycleTracking) {
    list.push({ to: "/ciclo", icon: CalendarHeart, label: "Ciclo", tone: "alcohol" });
  }

  list.push(
    { to: "/storico", icon: CalendarDays, label: "Storico", tone: "alcohol" },
    { to: "/profilo", icon: User, label: "Profilo", tone: "water" },
  );
  return list;
});

/** Oltre sei voci le etichette non ci stanno più: si passa allo scorrimento. */
const scrollable = computed(() => items.value.length > 6);

// Acqua e Alcol sono figlie della dashboard: la voce "Oggi" resta accesa.
const active = (to: string) =>
  to === "/" ? ["/", "/acqua", "/alcol"].includes(route.path) : route.path === to;
</script>

<style scoped>
nav div::-webkit-scrollbar {
  display: none;
}
</style>
