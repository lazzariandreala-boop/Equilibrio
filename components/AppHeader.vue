<template>
  <header class="flex items-center justify-between px-5 pt-6 pb-3">
    <div class="flex items-center gap-3">
      <img :src="logo" alt="" width="40" height="40" class="rounded-2xl shadow-soft" />
      <div>
        <div class="display text-ink" style="font-size: 23px; font-weight: 800; line-height: 1.1">Equilibrio</div>
        <div class="text-faint" style="font-size: 12px; text-transform: capitalize">{{ date }}</div>
      </div>
    </div>
    <button class="tap rounded-2xl p-2.5" style="background: var(--card); border: 1px solid var(--line)"
      :aria-label="isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro'" @click="toggle">
      <Sun v-if="isDark" :size="18" class="text-food" />
      <Moon v-else :size="18" class="text-alcohol" />
    </button>
  </header>
</template>

<script setup lang="ts">
import { Sun, Moon } from "lucide-vue-next";
import { fmtIT } from "~/utils/date";
import logo from "~/assets/Logo_Equilibrio.png";
const { isDark, toggle } = useTheme();
const date = fmtIT();
</script>
