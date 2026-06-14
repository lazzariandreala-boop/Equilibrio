<template>
  <header class="flex items-center justify-between px-5 pt-6 pb-2">
    <div class="flex items-center gap-3">
      <img :src="logo" alt="Equilibrio" width="36" height="36" class="rounded-xl shadow-soft" />
      <div>
        <div class="text-ink" style="font-size: 22px; font-weight: 700; letter-spacing: -0.5px">Equilibrio</div>
        <div class="text-faint" style="font-size: 12px; text-transform: capitalize">{{ date }}</div>
      </div>
    </div>
    <button class="bg-card border border-line text-ink rounded-2xl p-2.5" @click="toggle">
      <Sun v-if="isDark" :size="18" />
      <Moon v-else :size="18" />
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
