<template>
  <div>
    <div class="relative w-full" :style="{ height: height + 'px' }">
      <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="w-full h-full" style="overflow: visible">
        <defs>
          <linearGradient :id="`band-${uid}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--move)" stop-opacity="0.18" />
            <stop offset="100%" stop-color="var(--move)" stop-opacity="0.08" />
          </linearGradient>
        </defs>

        <!-- Fascia dell'obiettivo: è il riferimento su cui si legge tutto -->
        <rect x="0" :y="y(params.targetMax)" :width="W" :height="Math.max(1, y(params.targetMin) - y(params.targetMax))"
          :fill="`url(#band-${uid})`" />
        <line x1="0" :y1="y(params.targetMax)" :x2="W" :y2="y(params.targetMax)" stroke="var(--move)"
          stroke-width="1" stroke-dasharray="4 5" opacity="0.6" vector-effect="non-scaling-stroke" />
        <line x1="0" :y1="y(params.targetMin)" :x2="W" :y2="y(params.targetMin)" stroke="var(--move)"
          stroke-width="1" stroke-dasharray="4 5" opacity="0.6" vector-effect="non-scaling-stroke" />

        <!-- Intervallo minimo-massimo della giornata, quando si aggrega -->
        <path v-if="aggregated && bandPath" :d="bandPath" fill="var(--water)" opacity="0.16" />

        <path v-if="linePath" :d="linePath" fill="none" stroke="var(--water)" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"
          style="filter: drop-shadow(0 0 6px var(--water-glow))" />

        <!-- Nella vista di dettaglio ogni misurazione è un punto, colorato
             secondo la sua fascia: si vede subito dove si è usciti. -->
        <template v-if="!aggregated">
          <circle v-for="(p, i) in plotted" :key="i" :cx="p.x" :cy="p.y" r="3.5"
            :fill="`var(--${p.tone})`" vector-effect="non-scaling-stroke" />
        </template>
      </svg>

      <div class="absolute text-faint tabular" style="top: -2px; right: 0; font-size: 10px">{{ max }}</div>
      <div class="absolute text-faint tabular" style="bottom: -2px; right: 0; font-size: 10px">{{ min }}</div>
    </div>

    <!-- Etichette dell'asse orizzontale -->
    <div class="flex justify-between" style="margin-top: 6px">
      <span v-for="(l, i) in axisLabels" :key="i" class="text-faint" style="font-size: 10.5px">{{ l }}</span>
    </div>

    <p v-if="plotted.length < 2" class="text-faint text-center" style="font-size: 12.5px; margin-top: 10px">
      Servono almeno due misurazioni in questo periodo per disegnare l'andamento.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Reading } from "~/stores/glucose";
import { classify, RANGE_TONE, type DiabetesParams } from "~/utils/diabetes";

const props = withDefaults(
  defineProps<{
    readings: Reading[];
    params: DiabetesParams;
    /** Ampiezza del periodo in giorni: 1 = giornata. */
    days: number;
    height?: number;
  }>(),
  { height: 150 },
);

const uid = Math.random().toString(36).slice(2, 7);
const W = 300;
const H = 100;

/** Oltre una settimana i singoli punti diventano illeggibili: si aggrega per giorno. */
const aggregated = computed(() => props.days > 7);

const from = computed(() => {
  const d = new Date();
  if (props.days === 1) d.setHours(0, 0, 0, 0);
  else d.setTime(Date.now() - props.days * 86400000);
  return d.getTime();
});

const inPeriod = computed(() =>
  props.readings.filter((r) => r.at >= from.value).sort((a, b) => a.at - b.at),
);

interface Point { t: number; v: number; lo: number; hi: number; tone: string }

const series = computed<Point[]>(() => {
  if (!aggregated.value) {
    return inPeriod.value.map((r) => ({
      t: r.at,
      v: r.value,
      lo: r.value,
      hi: r.value,
      tone: RANGE_TONE[classify(r.value, props.params)],
    }));
  }

  // Media giornaliera con il suo intervallo minimo-massimo.
  const byDay = new Map<number, number[]>();
  for (const r of inPeriod.value) {
    const d = new Date(r.at);
    d.setHours(0, 0, 0, 0);
    const key = d.getTime();
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(r.value);
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([t, vs]) => {
      const avg = Math.round(vs.reduce((a, b) => a + b, 0) / vs.length);
      return {
        t,
        v: avg,
        lo: Math.min(...vs),
        hi: Math.max(...vs),
        tone: RANGE_TONE[classify(avg, props.params)],
      };
    });
});

// La scala include sempre la fascia obiettivo, altrimenti sparirebbe dal grafico.
const bounds = computed(() => {
  const vals = series.value.flatMap((p) => [p.lo, p.hi]);
  const lo = Math.min(props.params.targetMin, ...(vals.length ? vals : [props.params.targetMin]));
  const hi = Math.max(props.params.targetMax, ...(vals.length ? vals : [props.params.targetMax]));
  const pad = Math.max(10, (hi - lo) * 0.12);
  return { lo: Math.max(0, Math.floor(lo - pad)), hi: Math.ceil(hi + pad) };
});

const min = computed(() => bounds.value.lo);
const max = computed(() => bounds.value.hi);

const y = (v: number) => {
  const { lo, hi } = bounds.value;
  const span = Math.max(1, hi - lo);
  return H - ((v - lo) / span) * H;
};

const xOf = (t: number) => {
  const first = series.value[0]?.t ?? from.value;
  const last = series.value[series.value.length - 1]?.t ?? Date.now();
  const span = Math.max(1, last - first);
  return ((t - first) / span) * W;
};

const plotted = computed(() =>
  series.value.map((p) => ({ ...p, x: xOf(p.t), y: y(p.v) })),
);

const linePath = computed(() => {
  if (plotted.value.length < 2) return "";
  return plotted.value.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
});

/** Area fra minimo e massimo giornalieri. */
const bandPath = computed(() => {
  if (plotted.value.length < 2) return "";
  const up = plotted.value.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${y(p.hi).toFixed(1)}`).join(" ");
  const down = [...plotted.value]
    .reverse()
    .map((p) => `L ${p.x.toFixed(1)} ${y(p.lo).toFixed(1)}`)
    .join(" ");
  return `${up} ${down} Z`;
});

const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

const axisLabels = computed(() => {
  if (!series.value.length) return [];
  const first = series.value[0].t;
  const last = series.value[series.value.length - 1].t;

  const fmt = (t: number) => {
    const d = new Date(t);
    return props.days === 1
      ? d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
      : `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };

  if (last - first < 3600000) return [fmt(first), fmt(last)];
  return [fmt(first), fmt((first + last) / 2), fmt(last)];
});
</script>
