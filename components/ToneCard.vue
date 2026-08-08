<template>
  <NuxtLink :to="to" class="tap block rounded-4xl overflow-hidden h-full" :class="`grad-${tone}`"
    :style="{ boxShadow: `0 10px 24px var(--${tone}-glow)` }">
    <div class="relative p-3.5 flex flex-col h-full">
      <div class="absolute rounded-full pointer-events-none"
        style="width: 116px; height: 116px; right: -42px; top: -42px; background: rgba(255, 255, 255, 0.16)" />

      <div class="relative flex items-center justify-between">
        <div class="rounded-2xl flex items-center justify-center" style="width: 34px; height: 34px; background: rgba(255, 255, 255, 0.24)">
          <component :is="icon" :size="19" color="#fff" />
        </div>
        <ArrowUpRight :size="16" color="rgba(255,255,255,.7)" />
      </div>

      <div class="relative mt-auto" style="padding-top: 10px">
        <div style="color: rgba(255, 255, 255, 0.85); font-size: 12.5px; font-weight: 600; line-height: 1.2">{{ label }}</div>
        <div class="display tabular flex items-baseline gap-1" style="color: #fff; line-height: 1.05; margin-top: 1px">
          <span style="font-size: 27px; font-weight: 700">{{ value }}</span>
          <span style="font-size: 13px; font-weight: 600; opacity: 0.85">{{ unit }}</span>
        </div>
        <div style="color: rgba(255, 255, 255, 0.75); font-size: 11px; line-height: 1.25; margin-top: 2px">{{ hint }}</div>
      </div>

      <div v-if="progress !== null" class="relative rounded-full overflow-hidden"
        style="height: 5px; background: rgba(255, 255, 255, 0.28); margin-top: 8px">
        <div class="fill" style="background: #fff" :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }" />
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
