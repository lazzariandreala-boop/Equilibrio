<template>
  <nav class="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none" style="z-index: 45">
    <div class="pointer-events-auto w-full" style="max-width: 520px; padding: 0 14px 14px">
      <div class="flex rounded-4xl px-1.5 py-1.5"
        style="background: var(--card); border: 1px solid var(--line); box-shadow: var(--shadow-lift); backdrop-filter: blur(12px)">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to"
          class="tap flex-1 py-2 flex flex-col items-center gap-1 rounded-3xl"
          :style="active(item.to) ? { background: `var(--${item.tone}-soft)`, color: `var(--${item.tone})` } : { color: 'var(--faint)' }">
          <component :is="item.icon" :size="20" />
          <span style="font-size: 10.5px; font-weight: 600">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Home, Utensils, Activity, CalendarDays, User } from "lucide-vue-next";
const route = useRoute();

const items = [
  { to: "/", icon: Home, label: "Oggi", tone: "water" },
  { to: "/pasti", icon: Utensils, label: "Pasti", tone: "food" },
  { to: "/movimento", icon: Activity, label: "Movimento", tone: "move" },
  { to: "/storico", icon: CalendarDays, label: "Storico", tone: "alcohol" },
  { to: "/profilo", icon: User, label: "Profilo", tone: "water" },
];

// Acqua e Alcol sono figlie della dashboard: la voce "Oggi" resta accesa.
const active = (to: string) =>
  to === "/" ? ["/", "/acqua", "/alcol"].includes(route.path) : route.path === to;
</script>
