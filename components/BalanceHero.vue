<template>
  <div class="rise rounded-5xl relative overflow-hidden"
    style="background: var(--card); border: 1px solid var(--line);
           box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 14px 34px -10px rgba(0,0,0,.5)">
    <!-- alba dietro le colline: paesaggio appena accennato, dà profondità -->
    <svg class="absolute pointer-events-none" viewBox="0 0 200 120" aria-hidden="true"
      style="right: 0; top: 0; width: 210px; height: 126px; opacity: .5">
      <defs>
        <radialGradient :id="`sun-${uid}`" cx="50%" cy="50%">
          <stop offset="0%" stop-color="var(--food-2)" stop-opacity="1" />
          <stop offset="100%" stop-color="var(--food)" stop-opacity="0.75" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="40" r="18" :fill="`url(#sun-${uid})`" />
      <path d="M96 84c16-18 30-24 44-18s22 4 34-6 26-8 26-8v34H96Z" fill="var(--food)" opacity=".22" />
      <path d="M112 92c14-12 24-15 36-11s20 2 32-6 20-5 20-5v22h-88Z" fill="var(--food)" opacity=".16" />
      <g stroke="var(--food)" stroke-width="1.6" fill="none" opacity=".5" stroke-linecap="round">
        <path d="M108 28c2-2 4-2 5 0M113 28c1-2 3-2 5 0" />
        <path d="M124 20c2-2 4-2 5 0M129 20c1-2 3-2 5 0" />
      </g>
    </svg>

    <div class="relative flex items-center gap-4" style="padding: 16px 16px">
      <!-- anello -->
      <div class="relative shrink-0" style="width: 116px; height: 116px">
        <svg viewBox="0 0 120 120" width="116" height="116" style="transform: rotate(-90deg); overflow: visible">
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
          <div class="display tabular flex items-baseline" style="color: #fff">
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
