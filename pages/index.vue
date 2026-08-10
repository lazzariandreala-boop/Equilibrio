<template>
  <div class="flex flex-col" style="gap: 11px; min-height: calc(100dvh - 178px)">
    <DayNav />

    <!-- Senza alcol: il dato più importante, quindi in evidenza -->
    <NuxtLink to="/alcol" class="tap block rounded-4xl overflow-hidden grad-alcohol relative rise"
      style="box-shadow: 0 10px 26px var(--alcohol-glow)">
      <div class="absolute rounded-full" style="width: 150px; height: 150px; right: -52px; top: -58px; background: rgba(255,255,255,.15)" />
      <div class="relative p-4 flex items-center gap-4">
        <div>
          <div style="color: rgba(255,255,255,.85); font-size: 12.5px; font-weight: 600">Senza alcol</div>
          <div class="flex items-baseline gap-1.5">
            <span class="display tabular" style="color: #fff; font-size: 40px; font-weight: 800; line-height: 1.05">{{ day.streak }}</span>
            <span style="color: rgba(255,255,255,.9); font-size: 14px; font-weight: 600">
              {{ day.streak === 1 ? "giorno" : "giorni" }} di fila
            </span>
          </div>
        </div>

        <!-- Ultimi 14 giorni: pieno = pulito, vuoto = c'era alcol -->
        <div class="flex gap-1 ml-auto">
          <span v-for="(clean, i) in soberDots" :key="i" class="rounded-full"
            :style="{
              width: '7px', height: '26px',
              background: clean ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.28)',
            }" />
        </div>
      </div>
    </NuxtLink>

    <!-- Le altre tre voci, ognuna col proprio andamento a 7 giorni -->
    <div class="grid grid-cols-2 flex-1" style="gap: 11px">
      <div class="rise" style="animation-delay: 60ms">
        <MetricCard to="/acqua" :icon="GlassWater" tone="water" label="Acqua" :value="today.water" unit="ml"
          :hint="`di ${settings.goals.water} ml`" :week="weekOf('water')" />
      </div>
      <div class="rise" style="animation-delay: 120ms">
        <MetricCard to="/movimento" :icon="Footprints" tone="move" label="Movimento" :value="day.moveMin" unit="min"
          :hint="`di ${settings.goals.moveMin} min`" :week="weekOf('move')" />
      </div>
      <div class="rise col-span-2" style="animation-delay: 180ms">
        <MetricCard to="/pasti" :icon="UtensilsCrossed" tone="food" label="Pasti" :value="day.totals.kcal" unit="kcal"
          :hint="today.meals.length ? `${today.meals.length} registrati oggi · obiettivo ${settings.goals.kcal}` : `nessun pasto oggi · obiettivo ${settings.goals.kcal}`"
          :week="weekOf('kcal')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GlassWater, Footprints, UtensilsCrossed } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";
import { lastNDays } from "~/utils/date";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);

// lastNDays restituisce dal più recente: qui serve l'ordine cronologico
const week = computed(() => lastNDays(7).reverse());

function weekOf(kind: "water" | "move" | "kcal") {
  const goal =
    kind === "water" ? settings.goals.water : kind === "move" ? settings.goals.moveMin : settings.goals.kcal;
  return week.value.map((k) => {
    const s = day.summaryOf(k);
    const v = kind === "water" ? s.water : kind === "move" ? s.moveMin : s.kcal;
    return goal > 0 ? Math.min(1, v / goal) : 0;
  });
}

const soberDots = computed(() => lastNDays(14).reverse().map((k) => day.summaryOf(k).alcGrams === 0));
</script>
