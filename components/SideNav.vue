<template>
  <aside class="side-nav">
    <div class="flex items-center gap-3" style="padding: 4px 6px 18px">
      <img :src="isDark ? logoDark : logoLight" alt="" width="42" height="42"
        style="border-radius: 13px; box-shadow: 0 0 0 1px var(--line)" />
      <div class="min-w-0">
        <div class="display text-ink" style="font-size: 19px; font-weight: 800; line-height: 1.1">Equilibrio</div>
        <div class="text-faint truncate" style="font-size: 12px; text-transform: capitalize">{{ date }}</div>
      </div>
    </div>

    <nav class="flex flex-col" style="gap: 4px">
      <NuxtLink v-for="item in items" :key="item.to" :to="item.to"
        class="tap flex items-center gap-3 rounded-3xl"
        style="padding: 11px 13px"
        :style="isActive(item.to)
          ? { background: `var(--${item.tone}-soft)`, boxShadow: `inset 0 0 0 1px var(--${item.tone}-soft)` }
          : {}">
        <component :is="item.icon" :size="20"
          :color="isActive(item.to) ? `var(--${item.tone})` : 'var(--faint)'" />
        <span :style="{
          fontSize: '14.5px', fontWeight: 600,
          color: isActive(item.to) ? `var(--${item.tone})` : 'var(--dim)',
        }">{{ item.label }}</span>
        <span v-if="isActive(item.to)" class="rounded-full ml-auto"
          :style="{ width: '6px', height: '6px', background: `var(--${item.tone})` }" />
      </NuxtLink>
    </nav>

    <button class="tap flex items-center gap-3 rounded-3xl mt-auto" style="padding: 11px 13px"
      :aria-label="isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro'" @click="toggle">
      <Sun v-if="isDark" :size="19" color="var(--food)" />
      <Moon v-else :size="19" color="var(--alcohol)" />
      <span class="text-dim" style="font-size: 14px; font-weight: 600">
        {{ isDark ? "Tema chiaro" : "Tema scuro" }}
      </span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { Sun, Moon } from "lucide-vue-next";
import { fmtIT } from "~/utils/date";
import logoLight from "~/assets/logo-light.png";
import logoDark from "~/assets/logo-dark.png";

const { isDark, toggle } = useTheme();
const { items, isActive } = useNavItems();
const date = fmtIT();
</script>

<style scoped>
.side-nav {
  display: none;
}

/* Da qui in su c'è spazio per un menù laterale: comprende i tablet in
   orizzontale. Sotto questa soglia resta la barra in basso. */
@media (min-width: 1024px) {
  .side-nav {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 238px;
    padding: 20px 14px 18px;
    background: var(--card);
    border-right: 1px solid var(--line);
    overflow-y: auto;
  }
}
</style>
