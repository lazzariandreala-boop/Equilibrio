<template>
  <div class="relative mx-auto" :style="{ width: size + 'px', height: size + 'px' }">
    <svg viewBox="0 0 200 200" :width="size" :height="size" style="transform: rotate(-90deg); overflow: visible">
      <defs>
        <linearGradient v-for="(s, i) in segments" :key="`g${i}`" :id="`ring-${uid}-${i}`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="s.from" />
          <stop offset="100%" :stop-color="s.to" />
        </linearGradient>
      </defs>

      <g v-for="(s, i) in segments" :key="i" :transform="`rotate(${i * 90 + 2} 100 100)`">
        <circle
          cx="100" cy="100" :r="r" fill="none" stroke="var(--line)"
          stroke-width="13" stroke-linecap="round" :stroke-dasharray="`${arc} ${C}`" />
        <circle
          cx="100" cy="100" :r="r" fill="none" :stroke="`url(#ring-${uid}-${i})`"
          stroke-width="13" stroke-linecap="round"
          :stroke-dasharray="`${Math.min(1, s.value) * arc} ${C}`"
          :style="{ transition: 'stroke-dasharray 900ms cubic-bezier(.22,1,.36,1)', filter: `drop-shadow(0 0 7px ${s.glow})` }" />
      </g>
    </svg>

    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="display tabular text-ink" style="font-size: 46px; font-weight: 800; line-height: 1">{{ shown }}</span>
      <span class="text-faint" style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; margin-top: 2px">
        equilibrio
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    segments: { from: string; to: string; glow: string; value: number }[];
    size?: number;
  }>(),
  { size: 196 },
);

const uid = Math.random().toString(36).slice(2, 8);
const r = 78;
const C = 2 * Math.PI * r;
const arc = (C * 86) / 360;

const score = computed(() =>
  Math.round((props.segments.reduce((a, s) => a + Math.min(1, s.value), 0) / props.segments.length) * 100),
);

// il punteggio sale contando, non appare di colpo.
// Lato server non esiste requestAnimationFrame: si mostra subito il valore finale.
const shown = ref(score.value);
let raf = 0;

watch(score, (target) => {
  if (!import.meta.client) {
    shown.value = target;
    return;
  }
  cancelAnimationFrame(raf);
  const start = shown.value;
  const t0 = performance.now();
  const tick = (t: number) => {
    const k = Math.min(1, (t - t0) / 850);
    const eased = 1 - Math.pow(1 - k, 3);
    shown.value = Math.round(start + (target - start) * eased);
    if (k < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
});

onMounted(() => {
  // all'ingresso il numero parte da zero e sale fino al punteggio reale
  const target = score.value;
  shown.value = 0;
  const t0 = performance.now();
  const tick = (t: number) => {
    const k = Math.min(1, (t - t0) / 850);
    shown.value = Math.round(target * (1 - Math.pow(1 - k, 3)));
    if (k < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  if (import.meta.client) cancelAnimationFrame(raf);
});
</script>
