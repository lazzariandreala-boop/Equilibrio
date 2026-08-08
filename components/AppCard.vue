<template>
  <div
    class="rounded-4xl"
    :class="[flat ? '' : 'shadow-soft', pad]"
    :style="{
      background: tone ? `var(--${tone}-soft)` : 'var(--card)',
      border: tone ? '1px solid transparent' : '1px solid var(--line)',
    }">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: "water" | "alcohol" | "move" | "food" | null;
    flat?: boolean;
    pad?: string;
  }>(),
  { tone: null, flat: false, pad: "p-4" },
);
</script>
