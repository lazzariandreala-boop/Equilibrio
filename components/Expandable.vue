<template>
  <div class="rounded-4xl overflow-hidden"
    :style="{ background: 'var(--card)', border: '1px solid var(--line)', boxShadow: 'var(--tile-shadow)' }">
    <button class="tap w-full flex items-center gap-3" style="padding: 13px 14px" @click="open = !open">
      <div v-if="icon" class="rounded-2xl flex items-center justify-center shrink-0"
        :style="{ width: '40px', height: '40px', background: `var(--${tone}-soft)` }">
        <component :is="icon" :size="19" :color="`var(--${tone})`" />
      </div>
      <div class="min-w-0 flex-1 text-left">
        <div class="text-ink" style="font-weight: 700; font-size: 16px">{{ title }}</div>
        <div v-if="subtitle" class="text-faint truncate" style="font-size: 12.5px">{{ subtitle }}</div>
      </div>
      <ChevronDown :size="19" class="text-faint shrink-0"
        :style="{ transition: 'transform 260ms cubic-bezier(.22,1,.36,1)', transform: open ? 'rotate(180deg)' : 'none' }" />
    </button>

    <div v-show="open" style="padding: 0 12px 12px">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    icon?: any;
    tone?: "water" | "alcohol" | "move" | "food";
    defaultOpen?: boolean;
  }>(),
  { subtitle: "", icon: null, tone: "water", defaultOpen: false },
);

const open = ref(props.defaultOpen);
</script>
