<template>
  <!-- Diario, ricette e spesa stanno sotto la stessa voce Pasti: la barra in basso resta di cinque voci. -->
  <nav class="flex gap-1.5 rounded-full p-1" style="background: var(--raised); border: 1px solid var(--line)" aria-label="Sezioni dei pasti">
    <NuxtLink v-for="t in tabs" :key="t.to" :to="t.to"
      class="tap flex-1 rounded-full flex items-center justify-center gap-1.5"
      style="padding: 9px 6px; font-size: 0.875rem; font-weight: 600"
      :aria-current="active(t.to) ? 'page' : undefined"
      :style="active(t.to) ? { background: 'var(--food)', color: '#fff', boxShadow: '0 4px 12px -4px var(--food-glow)' } : { color: 'var(--dim)' }">
      <component :is="t.icon" :size="16" />
      {{ t.label }}
      <span v-if="t.badge" class="tabular rounded-full"
        style="font-size: 0.6875rem; padding: 1px 6px; min-width: 18px"
        :style="active(t.to) ? { background: 'rgba(255,255,255,.25)' } : { background: 'var(--food-soft)', color: 'var(--food)' }">
        {{ t.badge }}
      </span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { NotebookPen, ChefHat, ShoppingBasket } from "lucide-vue-next";
import { useSettingsStore } from "~/stores/settings";

const settings = useSettingsStore();
const route = useRoute();
const toBuy = computed(() => settings.shopping.filter((s) => !s.done).length);
const tabs = computed(() => [
  { to: "/pasti", label: "Diario", icon: NotebookPen, badge: 0 },
  { to: "/ricette", label: "Ricette", icon: ChefHat, badge: 0 },
  { to: "/spesa", label: "Spesa", icon: ShoppingBasket, badge: toBuy.value },
]);
const active = (to: string) => (to === "/ricette" ? ["/ricette", "/ricetta"].includes(route.path) : route.path === to);
</script>
