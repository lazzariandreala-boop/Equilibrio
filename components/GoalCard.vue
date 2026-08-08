<template>
  <button class="tap w-full text-left rounded-4xl p-4 flex items-center gap-3.5" :style="{ background: `var(--${tone}-soft)` }" @click="$emit('click')">
    <div class="rounded-2xl flex items-center justify-center shrink-0" :class="`grad-${tone}`" style="width: 46px; height: 46px">
      <component :is="icon" :size="22" color="#fff" />
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-dim" style="font-size: 13px">{{ label }}</div>
      <div class="display tabular" :style="{ fontSize: '27px', fontWeight: 700, color: `var(--${tone})`, lineHeight: 1.1 }">
        {{ value }}<span class="text-dim" style="font-size: 14px; font-weight: 600"> {{ unit }}</span>
      </div>
    </div>
    <ChevronRight :size="18" class="text-faint shrink-0" />
  </button>
</template>

<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";

defineProps<{
  icon: any;
  tone: "water" | "move" | "food" | "alcohol";
  label: string;
  value: number | string;
  unit: string;
}>();
defineEmits<{ click: [] }>();
</script>
