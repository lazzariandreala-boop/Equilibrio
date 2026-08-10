<template>
  <button class="tap w-full text-left rounded-4xl relative overflow-hidden"
    :style="{
      background: `linear-gradient(120deg, var(--${tone}-soft), var(--card) 92%)`,
      boxShadow: `inset 0 0 0 1.5px var(--${tone}-soft), 0 0 22px -10px var(--${tone}-glow), var(--tile-shadow)`,
    }"
    @click="$emit('click')">
    <!-- filigrana dedicata a ciascun obiettivo -->
    <svg class="absolute pointer-events-none" viewBox="0 0 120 70" aria-hidden="true"
      style="right: 28px; top: 0; width: 150px; height: 88px; opacity: .34">
      <g fill="none" :stroke="`var(--${tone})`" stroke-width="1.8" stroke-linecap="round">
        <template v-if="tone === 'water'">
          <path d="M6 40c12-9 24-9 36 0s24 9 36 0 24-9 36 0" />
          <path d="M18 52c10-7 20-7 30 0s20 7 30 0" opacity=".7" />
          <circle cx="92" cy="18" r="5" /><circle cx="106" cy="30" r="3" /><circle cx="80" cy="28" r="2" />
        </template>
        <template v-else-if="tone === 'move'">
          <path d="M0 62c22-4 34-16 40-30S56 8 76 6s34 4 44 12" />
          <path d="M14 66c18-5 28-15 34-27" opacity=".65" />
        </template>
        <template v-else-if="tone === 'food'">
          <path d="M52 40h48c0 13-11 22-24 22S52 53 52 40Z" />
          <path d="M70 30c-2-8 1-14 7-17 2 8-1 14-7 17ZM82 32c6-7 14-9 22-7-4 7-13 10-22 7Z" />
        </template>
        <template v-else>
          <path d="M4 56c14 2 22-6 30-16s16-20 30-18 24 12 38 10" />
          <circle cx="102" cy="32" r="3" />
        </template>
      </g>
    </svg>

    <div class="relative flex items-center gap-3.5" style="padding: 13px 14px">
      <!-- pastiglia quadrata con angoli morbidi, come nell'app -->
      <div class="flex items-center justify-center shrink-0"
        :style="{
          width: '52px', height: '52px', borderRadius: '16px',
          background: `var(--${tone}-soft)`,
          boxShadow: `inset 0 0 0 1.5px var(--${tone}), 0 0 18px -5px var(--${tone}-glow)`,
        }">
        <component :is="icon" :size="24" :color="`var(--${tone})`" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="text-ink" style="font-size: 14.5px; font-weight: 500">
          {{ label }}<span v-if="hint" class="text-faint" style="font-size: 12px"> ({{ hint }})</span>
        </div>
        <div class="display tabular flex items-baseline gap-1" style="margin-top: 1px">
          <span :style="{ color: `var(--${tone})`, fontSize: '29px', fontWeight: 800, lineHeight: 1.05 }">{{ value }}</span>
          <span class="text-dim" style="font-size: 14px; font-weight: 600">{{ unit }}</span>
        </div>
      </div>

      <ChevronRight :size="20" class="text-faint shrink-0" />
    </div>

    <!-- nota interna alla card, non staccata sotto -->
    <div v-if="note" class="relative flex items-start gap-2.5 rounded-3xl"
      :style="{ margin: '0 12px 12px', padding: '10px 12px', background: 'var(--card)', border: `1px solid var(--${tone}-soft)` }">
      <Info :size="16" :color="`var(--${tone})`" class="shrink-0" style="margin-top: 1px" />
      <span class="text-dim" style="font-size: 12.5px; line-height: 1.4">{{ note }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ChevronRight, Info } from "lucide-vue-next";

withDefaults(
  defineProps<{
    icon: any;
    tone: "water" | "move" | "food" | "alcohol";
    label: string;
    value: number | string;
    unit: string;
    hint?: string;
    note?: string;
  }>(),
  { hint: "", note: "" },
);
defineEmits<{ click: [] }>();
</script>
