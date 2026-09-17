<template>
  <div class="block-wide rise rounded-5xl relative overflow-hidden"
    style="background: var(--card); border: 1px solid var(--line); box-shadow: var(--tile-shadow)">
    <!-- alba dietro le colline: paesaggio appena accennato, dà profondità -->
    <!-- Paesaggio all'alba: sul desktop c'è spazio per svilupparlo in
         larghezza, sul telefono resta un accenno nell'angolo. -->
    <svg class="hero-scene absolute pointer-events-none" viewBox="0 0 400 200" preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true">
      <defs>
        <radialGradient :id="`sun-${uid}`" cx="50%" cy="50%">
          <stop offset="0%" stop-color="var(--food-2)" stop-opacity="1" />
          <stop offset="70%" stop-color="var(--food)" stop-opacity="0.85" />
          <stop offset="100%" stop-color="var(--food)" stop-opacity="0" />
        </radialGradient>
        <linearGradient :id="`sky-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--alcohol)" stop-opacity="0.18" />
          <stop offset="100%" stop-color="var(--food)" stop-opacity="0.10" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="400" height="200" :fill="`url(#sky-${uid})`" />
      <circle cx="300" cy="74" r="34" :fill="`url(#sun-${uid})`" />
      <circle cx="300" cy="74" r="21" fill="var(--food-2)" opacity="0.9" />

      <!-- colline sovrapposte -->
      <path d="M140 150c34-34 62-44 90-30s44 12 68-12 52-16 102-2v94H140Z" fill="var(--alcohol)" opacity=".24" />
      <path d="M170 168c30-24 52-30 74-20s36 8 56-10 44-12 100-2v64H170Z" fill="var(--food)" opacity=".18" />

      <!-- germoglio -->
      <g stroke="var(--food-2)" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85">
        <path d="M364 176v-30" />
        <path d="M364 156c-12-2-19-9-20-20 12 0 19 8 20 20Z" fill="var(--move)" fill-opacity=".45" stroke="none" />
        <path d="M364 150c11-3 17-11 17-22-11 1-17 9-17 22Z" fill="var(--move-2)" fill-opacity=".45" stroke="none" />
      </g>

      <!-- uccellini -->
      <g stroke="var(--food)" stroke-width="1.8" fill="none" opacity=".55" stroke-linecap="round">
        <path d="M212 54c4-4 8-4 11 0M223 54c3-4 7-4 10 0" />
        <path d="M250 36c3-3 6-3 8 0M258 36c2-3 5-3 7 0" />
      </g>
    </svg>

    <div class="relative flex items-center gap-4" style="padding: 16px 16px">
      <!-- anello -->
      <div class="hero-ring relative shrink-0">
        <svg viewBox="0 0 120 120" width="100%" height="100%" style="transform: rotate(-90deg); overflow: visible">
          <defs>
            <linearGradient :id="`ring-${uid}`" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="var(--food-2)" />
              <stop offset="100%" stop-color="var(--food)" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="49" fill="none" stroke="var(--line)" stroke-width="11" />
          <circle cx="60" cy="60" r="49" fill="none" :stroke="`url(#ring-${uid})`" stroke-width="11"
            stroke-linecap="round" :stroke-dasharray="`${(pct / 100) * C} ${C}`"
            style="transition: stroke-dasharray 900ms cubic-bezier(.22,1,.36,1);
                   filter: drop-shadow(0 0 8px var(--food-glow))" />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="display tabular flex items-baseline text-ink">
            <span style="font-size: 38px; font-weight: 800; line-height: 1">{{ shown }}</span>
            <span style="font-size: 15px; font-weight: 700; opacity: .85">%</span>
          </div>
          <Sprout :size="15" color="var(--food)" style="margin-top: 2px" />
        </div>
      </div>

      <!-- lettura in parole: il numero da solo non dice cosa fare -->
      <div class="min-w-0 flex-1">
        <div class="text-dim" style="font-size: 14.5px">{{ day.isToday ? "Equilibrio di oggi" : "Equilibrio del giorno" }}</div>
        <div class="display" style="color: var(--food); font-size: 27px; font-weight: 800; line-height: 1.15; margin-top: 2px">
          {{ onTrack }} {{ onTrack === 1 ? "abitudine" : "abitudini" }}
        </div>
        <div class="display" style="color: var(--food); font-size: 15px; font-weight: 700; opacity: .85">
          su 4 ben avviate
        </div>
        <div class="flex items-center gap-1.5" style="margin-top: 8px">
          <span class="text-dim" style="font-size: 13px">{{ message }}</span>
          <Heart :size="14" color="var(--food)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-scene {
  right: 0;
  top: 0;
  width: 210px;
  height: 100%;
  opacity: 0.55;
}
.hero-ring {
  width: 116px;
  height: 116px;
}

@media (min-width: 1024px) {
  .hero-scene {
    width: 58%;
    opacity: 0.75;
  }
  .hero-ring {
    width: 142px;
    height: 142px;
  }
}
</style>

<script setup lang="ts">
import { Sprout, Heart } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";

const props = defineProps<{ pct: number; onTrack: number }>();
const day = useDayStore();
const uid = Math.random().toString(36).slice(2, 7);
const C = 2 * Math.PI * 49;

const message = computed(() => {
  if (props.onTrack >= 4) return "Giornata piena!";
  if (props.onTrack >= 3) return "Stai andando bene!";
  if (props.onTrack >= 2) return "Buon ritmo, continua.";
  if (props.onTrack >= 1) return "Un passo è già partito.";
  return "Si comincia quando vuoi.";
});

// il numero sale contando: lato server resta il valore finale
const shown = ref(props.pct);
let raf = 0;
function animate(to: number, from: number) {
  cancelAnimationFrame(raf);
  const t0 = performance.now();
  const tick = (t: number) => {
    const k = Math.min(1, (t - t0) / 800);
    shown.value = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
    if (k < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}
watch(() => props.pct, (v) => (import.meta.client ? animate(v, shown.value) : (shown.value = v)));
onMounted(() => animate(props.pct, 0));
onBeforeUnmount(() => import.meta.client && cancelAnimationFrame(raf));
</script>
