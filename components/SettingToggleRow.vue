<template>
  <button class="tap w-full rounded-3xl flex items-center justify-between" style="padding: 12px 14px"
    :style="{ background: on ? `var(--${tone}-soft)` : 'var(--raised)' }" @click="$emit('toggle')">
    <span class="text-ink" style="font-size: 14.5px; font-weight: 500">{{ label }}</span>
    <Toggle :on="on" :tone="tone" />
  </button>
</template>

<script setup lang="ts">
defineProps<{ label: string; tone: string; on: boolean }>();
defineEmits<{ toggle: [] }>();
</script>
