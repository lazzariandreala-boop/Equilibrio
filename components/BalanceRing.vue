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
          v-if="s.value > 0.01"
          cx="100" cy="100" :r="r" fill="none" :stroke="`url(#ring-${uid}-${i})`"
          stroke-width="13" stroke-linecap="round"
          :stroke-dasharray="`${Math.min(1, s.value) * arc} ${C}`"
          :style="{ transition: 'stroke-dasharray 900ms cubic-bezier(.22,1,.36,1)', filter: `drop-shadow(0 0 7px ${s.glow})` }" />
      </g>
    </svg>

    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <div class="flex items-baseline gap-0.5">
        <span class="display tabular text-ink" style="font-size: 42px; font-weight: 800; line-height: 1">{{ shown }}</span>
        <span class="text-faint" style="font-size: 15px; font-weight: 600">%</span>
      </div>
      <span class="text-dim" style="font-size: 11px; font-weight: 600; margin-top: 1px">obiettivi di oggi</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    segments: { from: string; to: string; glow: string; value: number }[];
    size?: number;
  }>(),
  { size: 168 },
);

const uid = Math.random().toString(36).slice(2, 8);
const r = 78;
const C = 2 * Math.PI * r;
const arc = (C * 86) / 360;

const score = computed(() =>
  Math.round((props.segments.reduce((a, s) => a + Math.min(1, s.value), 0) / props.segments.length) * 100),
);

// Lato server niente requestAnimationFrame: si mostra subito il valore finale.
const shown = ref(score.value);
let raf = 0;

function animateTo(target: number, from: number) {
  cancelAnimationFrame(raf);
  const t0 = performance.now();
  const tick = (t: number) => {
    const k = Math.min(1, (t - t0) / 850);
    const eased = 1 - Math.pow(1 - k, 3);
    shown.value = Math.round(from + (target - from) * eased);
    if (k < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

watch(score, (target) => {
  if (import.meta.client) animateTo(target, shown.value);
  else shown.value = target;
});

onMounted(() => animateTo(score.value, 0));
onBeforeUnmount(() => {
  if (import.meta.client) cancelAnimationFrame(raf);
});
</script>
