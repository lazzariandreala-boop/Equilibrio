<template>
  <div class="space-y-4">
    <DayNav />

    <!-- hero -->
    <div class="rise rounded-5xl overflow-hidden grad-water relative" style="box-shadow: 0 14px 34px var(--water-glow)">
      <div class="absolute rounded-full" style="width: 190px; height: 190px; right: -66px; top: -76px; background: rgba(255,255,255,.14)" />
      <div class="relative p-6 text-center">
        <div style="color: rgba(255,255,255,.82); font-size: 13px; font-weight: 500">{{ day.isToday ? "Acqua di oggi" : "Acqua del giorno" }}</div>
        <div class="display tabular" style="color: #fff; font-size: 52px; font-weight: 800; line-height: 1.05; margin: 4px 0 2px">
          {{ today.water }}<span style="font-size: 20px; font-weight: 600; opacity: .8"> ml</span>
        </div>
        <div style="color: rgba(255,255,255,.78); font-size: 13px">obiettivo {{ settings.goals.water }} ml</div>
        <div class="rounded-full overflow-hidden mt-4" style="height: 8px; background: rgba(255,255,255,.28)">
          <div class="fill" style="background: #fff" :style="{ width: pct }" />
        </div>
      </div>
    </div>

    <!-- aggiunta rapida -->
    <AppCard class="rise" style="animation-delay: 80ms">
      <div class="display mb-3" style="font-weight: 700; font-size: 17px">Aggiungi un bicchiere</div>
      <div class="grid grid-cols-3 gap-2.5 mb-2.5">
        <button v-for="ml in [200, 250, 500]" :key="ml" class="tap rounded-3xl py-4 font-semibold"
          style="background: var(--water-soft); color: var(--water); font-size: 17px" @click="day.addWater(ml)">
          +{{ ml }}
        </button>
      </div>
      <button class="tap w-full rounded-2xl py-2.5 font-semibold flex items-center justify-center gap-1.5 bg-raised text-dim"
        style="font-size: 14px" @click="day.addWater(-250)">
        <Minus :size="15" /> Togli 250 ml
      </button>
    </AppCard>

    <AppCard tone="water" class="rise" style="animation-delay: 140ms">
      <div class="flex items-start gap-3">
        <Info :size="18" class="text-water shrink-0" style="margin-top: 2px" />
        <p class="text-dim" style="font-size: 13px; line-height: 1.5">
          Bere regolarmente durante il giorno funziona meglio che recuperare tutto la sera. Un bicchiere a ogni pasto è già metà obiettivo.
        </p>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { Minus, Info } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);
const pct = computed(() => `${Math.min(100, (today.value.water / settings.goals.water) * 100)}%`);
</script>
