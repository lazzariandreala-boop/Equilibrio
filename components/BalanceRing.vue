<template>
  <div class="relative mx-auto" :style="{ width: size + 'px', height: size + 'px' }">
    <svg viewBox="0 0 200 200" :width="size" :height="size" style="transform: rotate(-90deg)">
      <g v-for="(s, i) in segments" :key="i" :transform="`rotate(${i * 90 + 2} 100 100)`">
        <circle
          cx="100" cy="100" :r="r" fill="none" stroke="var(--line)"
          stroke-width="11" stroke-linecap="round" :stroke-dasharray="`${arc} ${C}`" />
        <circle
          cx="100" cy="100" :r="r" fill="none" :stroke="s.color"
          stroke-width="11" stroke-linecap="round"
          :stroke-dasharray="`${Math.min(1, s.value) * arc} ${C}`"
          style="transition: stroke-dasharray 700ms cubic-bezier(.22,1,.36,1)" />
      </g>
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-ink tabular" style="font-size: 34px; font-weight: 700; letter-spacing: -1px">{{ score }}</span>
      <span class="text-dim" style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase">equilibrio</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{ segments: { color: string; value: number }[]; size?: number }>(),
  { size: 188 },
);
const r = 78;
const C = 2 * Math.PI * r;
const arc = (C * 86) / 360;
const score = computed(() =>
  Math.round((props.segments.reduce((a, s) => a + Math.min(1, s.value), 0) / props.segments.length) * 100),
);
</script>
