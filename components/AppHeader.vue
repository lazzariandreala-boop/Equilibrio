<template>
  <header class="flex items-center justify-between px-4 pt-4 pb-2.5">
    <div class="flex items-center gap-3">
      <div class="relative">
        <div class="absolute rounded-3xl" :style="{ inset: '-3px', background: `var(--${tone}-soft)` }" />
        <img :src="isDark ? logoDark : logoLight" alt="" width="42" height="42"
          class="relative rounded-2xl"
          :style="{ boxShadow: `0 0 0 1.5px var(--${tone}), 0 6px 18px var(--${tone}-glow)` }" />
      </div>
      <div>
        <div class="display text-ink" style="font-size: 22px; font-weight: 800; line-height: 1.1">Equilibrio</div>
        <div :style="{ color: `var(--${tone})`, fontSize: '12.5px', textTransform: 'capitalize', fontWeight: 500 }">
          {{ date }}
        </div>
      </div>
    </div>
    <button class="tap rounded-full flex items-center justify-center"
      style="width: 42px; height: 42px; background: var(--raised); border: 1px solid var(--line)"
      :aria-label="isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro'" @click="toggle">
      <Sun v-if="isDark" :size="19" :color="`var(--${tone})`" />
      <Moon v-else :size="19" :color="`var(--${tone})`" />
    </button>
  </header>
</template>

<script setup lang="ts">
import { Sun, Moon } from "lucide-vue-next";
import { fmtIT } from "~/utils/date";
import logoLight from "~/assets/logo-light.png";
import logoDark from "~/assets/logo-dark.png";

const { isDark, toggle } = useTheme();
const date = fmtIT();

// L'intestazione prende la tinta della sezione in cui ci si trova.
const route = useRoute();
const tone = computed(() => {
  const p = route.path;
  if (p.startsWith("/pasti")) return "food";
  if (p.startsWith("/movimento")) return "move";
  if (p.startsWith("/alcol") || p.startsWith("/storico")) return "alcohol";
  return "water";
});
</script>
