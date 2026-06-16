<template>
  <nav class="fixed bottom-0 left-0 right-0 flex justify-center" style="z-index: 45">
    <div class="bg-card border-t border-line w-full flex" style="max-width: 520px">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex-1 py-3 flex flex-col items-center gap-1"
        :class="route.path === item.to ? 'text-ink' : 'text-faint'">
        <component :is="item.icon" :size="20" />
        <span style="font-size: 11px">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Home, Utensils, Activity, CalendarDays, User } from "lucide-vue-next";
const route = useRoute();
const items = [
  { to: "/", icon: Home, label: "Oggi" },
  { to: "/pasti", icon: Utensils, label: "Pasti" },
  { to: "/movimento", icon: Activity, label: "Movimento" },
  { to: "/storico", icon: CalendarDays, label: "Storico" },
  { to: "/profilo", icon: User, label: "Profilo" },
];
</script>
