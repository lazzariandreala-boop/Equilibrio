<template>
  <div class="relative flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- alone radiale: stacca l'illustrazione dal fondo scuro -->
    <div class="absolute rounded-full"
      :style="{ inset: '0', background: `radial-gradient(closest-side, var(--${tone}-soft), transparent 78%)`, opacity: 0.9 }" />
    <div class="absolute rounded-full"
      :style="{ inset: '14%', background: `var(--${tone}-soft)` }" />

    <svg :width="size * 0.62" :height="size * 0.62" viewBox="0 0 100 100" class="relative">
      <!-- ── PASTI: ciotola con verdure ── -->
      <g v-if="variant === 'food'">
        <path d="M22 52h56c0 16-12 26-28 26S22 68 22 52Z" :fill="c2" />
        <path d="M22 52h56c0 4-1 8-2 11H24c-1-3-2-7-2-11Z" :fill="c1" opacity="0.55" />
        <circle cx="40" cy="44" r="10" :fill="c3" />
        <circle cx="59" cy="45" r="9" :fill="c1" />
        <path d="M40 34c0-5 4-8 8-9-1 5-3 8-8 9Z" :fill="green" />
        <path d="M52 36c4-7 11-10 18-9-4 7-11 11-18 9Z" :fill="green" />
        <path d="M46 40c-6-4-8-11-6-17 6 4 8 11 6 17Z" :fill="greenDark" />
        <!-- bottiglia dell'olio -->
        <path d="M78 40h6v6c3 2 5 5 5 9v17c0 2-2 4-4 4h-8c-2 0-4-2-4-4V55c0-4 2-7 5-9v-6Z" :fill="c4" />
        <rect x="78" y="34" width="6" height="7" rx="2" :fill="greenDark" />
      </g>

      <!-- ── ACQUA: bicchiere e gocce ── -->
      <g v-else-if="variant === 'water'">
        <path d="M32 28h36l-5 48c-.4 4-4 7-8 7H45c-4 0-7.6-3-8-7L32 28Z" :fill="c2" opacity="0.5" />
        <path d="M35 50h30l-3 26c-.3 3-3 5-6 5H44c-3 0-5.7-2-6-5l-3-26Z" :fill="c1" />
        <ellipse cx="50" cy="50" rx="15" ry="3.4" :fill="c3" />
        <path d="M50 12c5 7 8 12 8 16a8 8 0 0 1-16 0c0-4 3-9 8-16Z" :fill="c3" />
        <circle cx="24" cy="34" r="4" :fill="c3" opacity="0.75" />
        <circle cx="76" cy="40" r="3" :fill="c3" opacity="0.6" />
      </g>

      <!-- ── ALCOL: calice barrato, segno di sobrietà ── -->
      <g v-else-if="variant === 'alcohol'">
        <path d="M32 20h36c0 16-6 27-15 30v22h10a4 4 0 0 1 0 8H37a4 4 0 0 1 0-8h10V50c-9-3-15-14-15-30Z" :fill="c2" opacity="0.55" />
        <path d="M35 24h30c-.6 11-5 19-11 21h-8c-6-2-10-10-11-21Z" :fill="c1" opacity="0.5" />
        <circle cx="68" cy="66" r="17" :fill="c3" />
        <path d="M61 66h14" stroke="#fff" stroke-width="4.5" stroke-linecap="round" />
        <path d="M20 26l6-8M80 22l7-6" :stroke="c3" stroke-width="3.5" stroke-linecap="round" opacity="0.6" />
      </g>

      <!-- ── MOVIMENTO: scarpa in corsa ── -->
      <g v-else>
        <path d="M14 62c0-4 3-7 7-7h16l14-12c3-3 8-3 11 0l16 14c6 5 10 10 10 16v5c0 3-2 5-5 5H21c-4 0-7-3-7-7v-14Z" :fill="c2" />
        <path d="M14 70h74v6c0 3-2 5-5 5H21c-4 0-7-3-7-7v-4Z" :fill="c1" />
        <path d="M37 55l7 6M46 47l8 7M55 41l8 7" :stroke="c3" stroke-width="3.5" stroke-linecap="round" />
        <path d="M18 40c6 2 10 5 13 9M26 28c6 3 11 7 14 12" :stroke="c3" stroke-width="3.5" stroke-linecap="round" opacity="0.55" />
      </g>

      <!-- scintille: presenti in tutte le varianti -->
      <g :fill="c3" opacity="0.9">
        <path d="M14 18l1.6 4.4L20 24l-4.4 1.6L14 30l-1.6-4.4L8 24l4.4-1.6L14 18Z" />
        <path d="M86 12l1.2 3.3L90 16.5l-2.8 1.2L86 21l-1.2-3.3L82 16.5l2.8-1.2L86 12Z" />
        <path d="M90 78l1.2 3.3L94 82.5l-2.8 1.2L90 87l-1.2-3.3L86 82.5l2.8-1.2L90 78Z" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant: "food" | "water" | "alcohol" | "move";
    size?: number;
  }>(),
  { size: 92 },
);

// I colori derivano dai token della sezione, così l'illustrazione
// resta coerente col tema chiaro e con quello scuro.
const tone = computed(() => props.variant);
const c1 = computed(() => `var(--${tone.value})`);
const c2 = computed(() => `var(--${tone.value}-2)`);
const c3 = computed(() => `var(--${tone.value}-2)`);
const c4 = computed(() => `var(--${tone.value})`);
const green = "var(--move-2)";
const greenDark = "var(--move)";
</script>
