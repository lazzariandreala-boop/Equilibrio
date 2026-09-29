<template>
  <header class="flex items-center gap-3 px-4 pt-4 pb-2.5">
    <img :src="isDark ? logoDark : logoLight" alt="" width="42" height="42" class="shrink-0"
      style="border-radius: 13px"
      :style="{ boxShadow: `0 0 0 1px var(--line), 0 6px 16px -4px var(--${tone}-glow)` }" />

    <div class="min-w-0 flex-1">
      <div class="display text-ink truncate" style="font-size: 1.3125rem; font-weight: 800; line-height: 1.1">Equilibrio</div>
      <div class="truncate" :style="{ color: `var(--${tone})`, fontSize: '0.78125rem', textTransform: 'capitalize', fontWeight: 500 }">
        {{ date }}
      </div>
    </div>

    <!-- Scorciatoie ai moduli attivi: compaiono solo se accesi nel Profilo,
         così la barra in basso resta di cinque voci per tutti. -->
    <nav v-if="modules.length" class="flex items-center gap-1.5 shrink-0" aria-label="Moduli attivi">
      <NuxtLink v-for="m in modules" :key="m.to" :to="m.to"
        class="tap rounded-full flex items-center justify-center"
        style="width: 38px; height: 38px"
        :aria-label="m.label"
        :aria-current="isActive(m.to) ? 'page' : undefined"
        :style="isActive(m.to)
          ? { background: `var(--${m.tone})`, boxShadow: `0 4px 12px -3px var(--${m.tone}-glow)` }
          : { background: `var(--${m.tone}-soft)`, border: `1px solid var(--${m.tone}-soft)` }">
        <component :is="m.icon" :size="18" :color="isActive(m.to) ? '#fff' : `var(--${m.tone})`" />
      </NuxtLink>
    </nav>

    <button class="tap rounded-full flex items-center justify-center shrink-0"
      style="width: 38px; height: 38px; background: var(--raised); border: 1px solid var(--line)"
      :aria-label="isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro'" @click="toggle">
      <Sun v-if="isDark" :size="18" :color="`var(--${tone})`" />
      <Moon v-else :size="18" :color="`var(--${tone})`" />
    </button>
  </header>
</template>

<script setup lang="ts">
import { Sun, Moon } from "lucide-vue-next";
import { fmtIT } from "~/utils/date";
import logoLight from "~/assets/logo-light.png";
import logoDark from "~/assets/logo-dark.png";

const { isDark, toggle } = useTheme();
const { modules, isActive } = useNavItems();
const date = fmtIT();

// L'intestazione prende la tinta della sezione in cui ci si trova.
const route = useRoute();
const tone = computed(() => {
  const p = route.path;
  if (p.startsWith("/pasti")) return "food";
  if (p.startsWith("/movimento")) return "move";
  if (["/alcol", "/ciclo", "/gravidanza", "/salute", "/storico"].some((x) => p.startsWith(x))) return "alcohol";
  return "water";
});
</script>
