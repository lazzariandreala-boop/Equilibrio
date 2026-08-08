<template>
  <div class="flex flex-col" style="gap: 11px; min-height: calc(100dvh - 178px)">
    <DayNav />

    <!-- Hero: il punteggio, spiegato -->
    <div class="rise rounded-5xl shadow-soft" style="background: var(--card); border: 1px solid var(--line); padding: 14px 16px 13px">
      <BalanceRing :segments="segments" />

      <!-- legenda: dice cosa sono i quattro archi e quanto manca -->
      <div class="grid grid-cols-4" style="margin-top: 11px">
        <div v-for="s in segments" :key="s.label" class="flex flex-col items-center gap-1">
          <span class="rounded-full" :class="`grad-${s.tone}`" style="width: 22px; height: 4px" />
          <span class="text-faint" style="font-size: 10px; font-weight: 600; letter-spacing: 0.2px">{{ s.label }}</span>
          <span class="tabular" :style="{ color: `var(--${s.tone})`, fontSize: '12px', fontWeight: 700 }">
            {{ Math.round(Math.min(1, s.value) * 100) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Le quattro voci: ognuna apre la sua sezione -->
    <div class="grid grid-cols-2 flex-1" style="gap: 11px; min-height: 236px">
      <div class="rise" style="animation-delay: 60ms">
        <ToneCard to="/acqua" :icon="GlassWater" tone="water" label="Acqua" :value="today.water" unit="ml"
          :hint="`di ${settings.goals.water} ml`" :progress="(today.water / settings.goals.water) * 100" />
      </div>
      <div class="rise" style="animation-delay: 120ms">
        <ToneCard to="/alcol" :icon="Wine" tone="alcohol" label="Senza alcol" :value="day.streak"
          :unit="day.streak === 1 ? 'giorno' : 'giorni'"
          :hint="today.drinks.length ? `oggi ${day.alcGrams} g di alcol` : 'nessuna bevanda oggi'" />
      </div>
      <div class="rise" style="animation-delay: 180ms">
        <ToneCard to="/movimento" :icon="Footprints" tone="move" label="Movimento" :value="day.moveMin" unit="min"
          :hint="`di ${settings.goals.moveMin} min`" :progress="(day.moveMin / settings.goals.moveMin) * 100" />
      </div>
      <div class="rise" style="animation-delay: 240ms">
        <ToneCard to="/pasti" :icon="UtensilsCrossed" tone="food" label="Pasti" :value="day.totals.kcal" unit="kcal"
          :hint="today.meals.length ? `${today.meals.length} registrati oggi` : 'nessun pasto oggi'"
          :progress="(day.totals.kcal / settings.goals.kcal) * 100" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GlassWater, Wine, Footprints, UtensilsCrossed } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);

const segments = computed(() => [
  {
    tone: "water", label: "Acqua", from: "var(--water-2)", to: "var(--water)", glow: "var(--water-glow)",
    value: today.value.water / settings.goals.water,
  },
  {
    tone: "alcohol", label: "Alcol", from: "var(--alcohol-2)", to: "var(--alcohol)", glow: "var(--alcohol-glow)",
    value: today.value.drinks.length === 0 ? 1 : 0.15,
  },
  {
    tone: "move", label: "Movim.", from: "var(--move-2)", to: "var(--move)", glow: "var(--move-glow)",
    value: day.moveMin / settings.goals.moveMin,
  },
  {
    tone: "food", label: "Pasti", from: "var(--food-2)", to: "var(--food)", glow: "var(--food-glow)",
    value: day.totals.kcal > 0 ? Math.min(1, day.totals.kcal / settings.goals.kcal) : 0,
  },
]);
</script>
