<template>
  <nav class="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none" style="z-index: 45">
    <div class="pointer-events-auto w-full" style="max-width: 520px; padding: 0 12px 12px">
      <div class="flex rounded-4xl px-1.5 py-1.5"
        style="background: var(--card); border: 1px solid var(--line);
               box-shadow: var(--nav-shadow)">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to"
          class="tap flex-1 rounded-3xl flex flex-col items-center relative"
          style="padding: 8px 0 7px"
          :style="active(item.to) ? { background: `var(--${item.tone}-soft)` } : {}">
          <component :is="item.icon" :size="21"
            :color="active(item.to) ? `var(--${item.tone})` : 'var(--faint)'" />
          <span :style="{
            fontSize: '10.5px', fontWeight: 600, marginTop: '3px',
            color: active(item.to) ? `var(--${item.tone})` : 'var(--faint)',
          }">{{ item.label }}</span>
          <!-- pallino: rende evidente la scheda attiva anche in visione periferica -->
          <span v-if="active(item.to)" class="absolute rounded-full"
            :style="{ bottom: '3px', width: '5px', height: '5px', background: `var(--${item.tone})` }" />
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
