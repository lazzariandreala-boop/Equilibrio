<template>
  <div class="flex items-center justify-between gap-3 py-3" :style="last ? {} : { borderBottom: '1px solid var(--line)' }">
    <span class="text-ink" style="font-size: 15px">{{ label }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label: string; last?: boolean }>(), { last: false });
</script>
