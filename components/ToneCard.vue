<template>
  <NuxtLink :to="to" class="tap block rounded-5xl overflow-hidden" :class="`grad-${tone}`" :style="{ boxShadow: `0 12px 30px var(--${tone}-glow)` }">
    <div class="relative p-4" style="min-height: 148px">
      <!-- alone decorativo -->
      <div
        class="absolute rounded-full pointer-events-none"
        style="width: 130px; height: 130px; right: -46px; top: -46px; background: rgba(255, 255, 255, 0.16)" />

      <div class="relative flex flex-col h-full" style="min-height: 116px">
        <div class="flex items-center justify-between mb-auto">
          <div class="rounded-2xl flex items-center justify-center" style="width: 38px; height: 38px; background: rgba(255, 255, 255, 0.22)">
            <component :is="icon" :size="20" color="#fff" />
          </div>
          <ArrowUpRight :size="18" color="rgba(255,255,255,.75)" />
        </div>

        <div style="margin-top: 18px">
          <div style="color: rgba(255, 255, 255, 0.82); font-size: 13px; font-weight: 500">{{ label }}</div>
          <div class="display tabular" style="color: #fff; font-size: 32px; font-weight: 700; line-height: 1.05">
            {{ value }}<span style="font-size: 15px; font-weight: 600; opacity: 0.8"> {{ unit }}</span>
          </div>
        </div>

        <div v-if="progress !== null" class="mt-2.5 rounded-full overflow-hidden" style="height: 6px; background: rgba(255, 255, 255, 0.25)">
          <div class="fill" style="background: #fff" :style="{ width: `${Math.min(100, Math.max(0, progress)) }%` }" />
        </div>
        <div v-else-if="hint" style="color: rgba(255, 255, 255, 0.72); font-size: 12px; margin-top: 8px">{{ hint }}</div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { ArrowUpRight } from "lucide-vue-next";

withDefaults(
  defineProps<{
    to: string;
    icon: any;
    tone: "water" | "alcohol" | "move" | "food";
    label: string;
    value: number | string;
    unit?: string;
    progress?: number | null;
    hint?: string;
  }>(),
  { unit: "", progress: null, hint: "" },
);
</script>
