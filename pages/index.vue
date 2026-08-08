<template>
  <div class="space-y-4">
    <DayNav />

    <!-- Hero: il ring è la tesi dell'app -->
    <div class="rise rounded-5xl shadow-soft" style="background: var(--card); border: 1px solid var(--line); padding: 22px 18px 20px">
      <BalanceRing :segments="segments" />
      <p class="text-dim text-center" style="font-size: 14px; margin-top: 14px; line-height: 1.45">
        {{ message }}
      </p>
    </div>

    <!-- Le quattro voci: ognuna apre la sua sezione -->
    <div class="grid grid-cols-2 gap-3">
      <div class="rise" style="animation-delay: 60ms">
        <ToneCard
          to="/acqua" :icon="Droplet" tone="water" label="Acqua"
          :value="today.water" unit="ml" :progress="(today.water / settings.goals.water) * 100" />
      </div>
      <div class="rise" style="animation-delay: 120ms">
        <ToneCard
          to="/alcol" :icon="Wine" tone="alcohol" label="Senza alcol"
          :value="day.streak" :unit="day.streak === 1 ? 'giorno' : 'giorni'"
          :hint="today.drinks.length ? `oggi ${day.alcGrams} g registrati` : 'nessuna bevanda oggi'" />
      </div>
      <div class="rise" style="animation-delay: 180ms">
        <ToneCard
          to="/movimento" :icon="Bike" tone="move" label="Movimento"
          :value="day.moveMin" unit="min" :progress="(day.moveMin / settings.goals.moveMin) * 100" />
      </div>
      <div class="rise" style="animation-delay: 240ms">
        <ToneCard
          to="/pasti" :icon="Apple" tone="food" label="Pasti"
          :value="day.totals.kcal" unit="kcal" :progress="(day.totals.kcal / settings.goals.kcal) * 100" />
      </div>
    </div>

    <!-- Azione rapida: la cosa che si fa più spesso resta a un tap -->
    <button class="tap w-full rounded-4xl flex items-center justify-center gap-2 py-3.5 font-semibold grad-food rise"
      style="color: #fff; font-size: 15px; box-shadow: 0 12px 28px var(--food-glow); animation-delay: 300ms"
      @click="mealOpen = true">
      <Camera :size="19" /> Scatta un pasto
    </button>

    <BottomSheet v-model="mealOpen" title="Aggiungi un pasto">
      <MealCapture @save="onMeal" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { Droplet, Wine, Bike, Apple, Camera } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);
const mealOpen = ref(false);

const segments = computed(() => [
  { from: "var(--water-2)", to: "var(--water)", glow: "var(--water-glow)", value: today.value.water / settings.goals.water },
  { from: "var(--alcohol-2)", to: "var(--alcohol)", glow: "var(--alcohol-glow)", value: today.value.drinks.length === 0 ? 1 : 0.15 },
  { from: "var(--move-2)", to: "var(--move)", glow: "var(--move-glow)", value: day.moveMin / settings.goals.moveMin },
  { from: "var(--food-2)", to: "var(--food)", glow: "var(--food-glow)", value: day.totals.kcal > 0 ? Math.min(1, day.totals.kcal / settings.goals.kcal) : 0 },
]);

const message = computed(() =>
  today.value.drinks.length === 0
    ? "Oggi stai tenendo il filo. Un passo per volta."
    : "Ogni giorno è a sé. Domani si ricomincia, senza colpe.",
);

function onMeal(m: any) {
  day.addMeal(m);
  mealOpen.value = false;
}
</script>
