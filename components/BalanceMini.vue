<template>
  <!-- Stessa card di "Equilibrio di oggi", ridotta a metà larghezza:
       resta il conteggio delle abitudini, sparisce solo l'anello con la percentuale. -->
  <div class="rounded-5xl relative overflow-hidden h-full"
    :style="{ background: 'var(--card)', border: '1px solid var(--line)', boxShadow: 'var(--tile-shadow)' }">
    <!-- alba dietro le colline, come nella versione intera -->
    <svg class="absolute pointer-events-none" viewBox="0 0 120 80" aria-hidden="true"
      style="right: 0; top: 0; width: 130px; height: 86px; opacity: .5">
      <defs>
        <radialGradient :id="`mini-sun-${uid}`" cx="50%" cy="50%">
          <stop offset="0%" stop-color="var(--food-2)" />
          <stop offset="100%" stop-color="var(--food)" stop-opacity="0.75" />
        </radialGradient>
      </defs>
      <circle cx="92" cy="24" r="12" :fill="`url(#mini-sun-${uid})`" />
      <path d="M52 58c10-12 19-16 28-12s14 3 22-4 17-5 17-5v23H52Z" fill="var(--food)" opacity=".22" />
      <path d="M62 66c9-8 15-10 23-7s13 1 20-4 13-3 13-3v14H62Z" fill="var(--food)" opacity=".16" />
    </svg>

    <div class="relative flex flex-col h-full" style="padding: 14px">
      <div class="text-dim" style="font-size: 13px">
        {{ day.isToday ? "Equilibrio di oggi" : "Equilibrio del giorno" }}
      </div>

      <div style="margin-top: 6px">
        <div class="display" style="color: var(--food); font-size: 27px; font-weight: 800; line-height: 1.1">
          {{ onTrack }} {{ onTrack === 1 ? "abitudine" : "abitudini" }}
        </div>
        <div class="display" style="color: var(--food); font-size: 14px; font-weight: 700; opacity: .85">
          su 4 ben avviate
        </div>
      </div>

      <!-- una tacca per voce: si vede quali sono a posto senza leggere -->
      <div class="flex gap-1.5" style="margin-top: 10px">
        <span v-for="(ok, i) in marks" :key="i" class="flex-1 rounded-full"
          :style="{ height: '5px', background: ok ? `var(--${tones[i]})` : 'var(--line)' }" />
      </div>

      <div class="flex items-center gap-1.5 mt-auto" style="padding-top: 10px">
        <span class="text-dim" style="font-size: 12.5px; line-height: 1.3">{{ message }}</span>
        <Heart :size="13" color="var(--food)" class="shrink-0" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Heart } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";

const props = defineProps<{ marks: boolean[]; message: string }>();
const day = useDayStore();
const uid = Math.random().toString(36).slice(2, 7);
const tones = ["water", "move", "food", "alcohol"];
const onTrack = computed(() => props.marks.filter(Boolean).length);
</script>
