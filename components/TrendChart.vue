<template>
  <div class="relative w-full" :style="{ height: height + 'px' }">
    <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="w-full h-full" style="overflow: visible">
      <defs>
        <linearGradient :id="`fill-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="`var(--${tone})`" stop-opacity="0.35" />
          <stop offset="100%" :stop-color="`var(--${tone})`" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- righe guida: danno la scala senza appesantire -->
      <line v-for="g in 3" :key="g" x1="0" :y1="(H / 4) * g" :x2="W" :y2="(H / 4) * g"
        stroke="var(--line)" stroke-width="1" stroke-dasharray="4 6" vector-effect="non-scaling-stroke" />

      <template v-if="path">
        <path :d="`${path} L ${W} ${H} L 0 ${H} Z`" :fill="`url(#fill-${uid})`" />
        <path :d="path" fill="none" :stroke="`var(--${tone})`" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"
          :style="{ filter: `drop-shadow(0 0 6px var(--${tone}-glow))` }" />
        <circle :cx="lastX" :cy="lastY" r="4" :fill="`var(--${tone})`" vector-effect="non-scaling-stroke" />
      </template>
    </svg>

    <!-- estremi della scala: senza, il grafico non dice quanto vale -->
    <div v-if="points.length" class="absolute text-faint tabular" style="top: -2px; right: 0; font-size: 10px">
      {{ fmt(max) }}
    </div>
    <div v-if="points.length" class="absolute text-faint tabular" style="bottom: -2px; right: 0; font-size: 10px">
      {{ fmt(min) }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    points: { t: number; v: number }[];
    tone: "water" | "alcohol" | "move" | "food";
    height?: number;
    decimals?: number;
  }>(),
  { height: 120, decimals: 1 },
);

const uid = Math.random().toString(36).slice(2, 7);
const W = 300;
const H = 100;

const values = computed(() => props.points.map((p) => p.v));
const min = computed(() => (values.value.length ? Math.min(...values.value) : 0));
const max = computed(() => (values.value.length ? Math.max(...values.value) : 0));

const coords = computed(() => {
  const n = props.points.length;
  if (!n) return [];
  // Con un solo punto la linea sarebbe invisibile: si disegna piatta.
  const span = max.value - min.value || 1;
  const pad = span * 0.12; // margine sopra e sotto, così la linea non tocca i bordi
  const lo = min.value - pad;
  const hi = max.value + pad;

  return props.points.map((p, i) => ({
    x: n === 1 ? W / 2 : (i / (n - 1)) * W,
    y: H - ((p.v - lo) / (hi - lo)) * H,
  }));
});

const path = computed(() => {
  const c = coords.value;
  if (!c.length) return "";
  if (c.length === 1) return `M 0 ${c[0].y} L ${W} ${c[0].y}`;
  return c.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
});

const lastX = computed(() => coords.value[coords.value.length - 1]?.x ?? 0);
const lastY = computed(() => coords.value[coords.value.length - 1]?.y ?? 0);

const fmt = (v: number) => v.toFixed(props.decimals);
</script>
