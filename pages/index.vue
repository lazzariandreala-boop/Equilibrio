<template>
  <div class="flex flex-col" style="gap: 11px; min-height: calc(100dvh - 178px)">
    <DayNav />

    <NuxtLink to="/alcol" class="block">
      <HeroCard tone="alcohol" :icon="ShieldCheck" title="Senza alcol" :value="day.streak"
        :unit="day.streak === 1 ? 'giorno' : 'giorni'" :caption="caption">
        <div class="flex gap-1 justify-center" style="margin-top: 14px">
          <span v-for="(clean, i) in soberDots" :key="i" class="rounded-full"
            :style="{ width: '8px', height: '22px', background: clean ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.26)' }" />
        </div>
      </HeroCard>
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
import { GlassWater, Footprints, UtensilsCrossed, ShieldCheck } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";
import { lastNDays, keyToDate } from "~/utils/date";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);

// Le finestre temporali terminano sul giorno selezionato: navigando indietro
// i grafici mostrano la situazione di quel giorno, non quella di oggi.
const anchor = computed(() => keyToDate(day.date));
const week = computed(() => lastNDays(7, anchor.value).reverse());

function weekOf(kind: "water" | "move" | "kcal") {
  const goal =
    kind === "water" ? settings.goals.water : kind === "move" ? settings.goals.moveMin : settings.goals.kcal;
  return week.value.map((k) => {
    const s = day.summaryOf(k);
    const v = kind === "water" ? s.water : kind === "move" ? s.moveMin : s.kcal;
    return goal > 0 ? Math.min(1, v / goal) : 0;
  });
}

const soberDots = computed(() =>
  lastNDays(14, anchor.value)
    .reverse()
    .map((k) => day.summaryOf(k).alcGrams === 0),
);

// Cosa è successo nel giorno selezionato (non in quello odierno).
const drinksToday = computed(() => today.value.drinks.length);
const alcToday = computed(() => Math.round(today.value.drinks.reduce((a, d) => a + d.alc, 0)));
const caption = computed(() =>
  drinksToday.value
    ? `${drinksToday.value} ${drinksToday.value === 1 ? "bevanda" : "bevande"} · ${alcToday.value} g in questo giorno`
    : "nessuna bevanda in questo giorno",
);
</script>
