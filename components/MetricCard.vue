<template>
  <NuxtLink :to="to" class="tap block rounded-4xl overflow-hidden h-full"
    :style="{ background: 'var(--card)', border: `1px solid var(--${tone}-soft)` }">
    <div class="p-3.5 flex flex-col h-full">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="rounded-full flex items-center justify-center" style="width: 32px; height: 32px"
            :style="{ background: `var(--${tone}-soft)` }">
            <component :is="icon" :size="16" :color="`var(--${tone})`" />
          </div>
          <span class="text-dim" style="font-size: 12.5px; font-weight: 600">{{ label }}</span>
        </div>
        <ChevronRight :size="15" class="text-faint" />
      </div>

      <div class="flex items-baseline gap-1" style="margin-top: 10px">
        <span class="display tabular" :style="{ color: `var(--${tone})`, fontSize: '28px', fontWeight: 700, lineHeight: 1 }">
          {{ value }}
        </span>
        <span class="text-dim" style="font-size: 12px; font-weight: 600">{{ unit }}</span>
      </div>
      <div class="text-faint" style="font-size: 11px; margin-top: 2px">{{ hint }}</div>

      <!-- Ultimi 7 giorni: oggi è l'ultima barra a destra -->
      <div class="flex items-end gap-1 mt-auto" style="height: 34px; padding-top: 8px">
        <div v-for="(d, i) in week" :key="i" class="flex-1 rounded-sm relative" style="height: 100%">
          <div class="absolute bottom-0 left-0 right-0 rounded-sm" style="background: var(--line); height: 100%" />
          <div class="absolute bottom-0 left-0 right-0 rounded-sm"
            :style="{
              background: `var(--${tone})`,
              height: `${Math.max(d > 0 ? 8 : 0, Math.min(100, d * 100))}%`,
              opacity: i === week.length - 1 ? 1 : 0.55,
              transition: 'height 500ms',
            }" />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";

defineProps<{
  to: string;
  icon: any;
  tone: "water" | "alcohol" | "move" | "food";
  label: string;
  value: number | string;
  unit: string;
  hint: string;
  week: number[]; // 7 valori 0..1, dal più vecchio al più recente
}>();
</script>
