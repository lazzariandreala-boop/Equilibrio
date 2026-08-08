<template>
  <div class="space-y-4">
    <DayNav />
    <AppCard class="!p-5">
      <BalanceRing :segments="segments" />
      <p class="text-dim" style="font-size: 13px; text-align: center; margin-top: 8px">
        {{ today.drinks.length === 0 ? "Oggi stai tenendo il filo. Un passo per volta." : "Ogni giorno è a sé. Domani si ricomincia, senza colpe." }}
      </p>
    </AppCard>

    <!-- Acqua -->
    <AppCard>
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Droplet :size="18" class="text-water" />
          <span style="font-weight: 600">Acqua</span>
        </div>
        <span class="text-dim tabular" style="font-size: 13px">{{ today.water }} / {{ settings.goals.water }} ml</span>
      </div>
      <div class="bg-line rounded-full overflow-hidden mb-3" style="height: 10px">
        <div class="bg-water h-full rounded-full" :style="{ width: pct(today.water, settings.goals.water), transition: 'width 500ms' }" />
      </div>
      <div class="flex gap-2">
        <button v-for="ml in [200, 250, 500]" :key="ml" class="flex-1 bg-water-soft text-water rounded-xl py-2.5 font-semibold" style="font-size: 14px" @click="day.addWater(ml)">
          +{{ ml }}
        </button>
        <button class="bg-raised text-dim rounded-xl px-3" @click="day.addWater(-250)"><Minus :size="16" /></button>
      </div>
    </AppCard>

    <!-- Alcol -->
    <AppCard>
      <div class="flex items-center gap-2 mb-1">
        <Wine :size="18" class="text-alcohol" />
        <span style="font-weight: 600">Senza alcol</span>
      </div>
      <div class="flex items-end gap-2 mb-3">
        <span class="text-alcohol tabular" style="font-size: 34px; font-weight: 700; line-height: 1">{{ day.streak }}</span>
        <span class="text-dim" style="font-size: 14px; margin-bottom: 4px">{{ day.streak === 1 ? "giorno" : "giorni" }} di fila</span>
      </div>

      <div v-if="today.drinks.length" class="bg-raised rounded-2xl p-3 mb-3 space-y-1.5">
        <div class="text-dim tabular" style="font-size: 12px">
          Oggi: {{ today.drinks.length }} {{ today.drinks.length === 1 ? "bevanda" : "bevande" }} · {{ day.alcGrams }} g alcol
        </div>
        <div v-for="(d, i) in today.drinks" :key="i" class="flex items-center justify-between">
          <span class="text-ink truncate" style="font-size: 13px">{{ d.name }}</span>
          <div class="flex items-center gap-2">
            <span class="text-faint tabular" style="font-size: 12px">{{ d.alc }} g</span>
            <button class="text-faint" @click="day.removeDrink(i)"><X :size="14" /></button>
          </div>
        </div>
      </div>

      <button
        class="w-full bg-alcohol-soft text-alcohol rounded-xl py-2.5 font-semibold flex items-center justify-center gap-1 mb-2"
        style="font-size: 14px"
        @click="drinkOpen = true">
        <Plus :size="16" /> Registra cosa ho bevuto
      </button>
      <div class="flex gap-2">
        <button class="flex-1 bg-raised text-ink rounded-xl py-2.5 font-semibold flex items-center justify-center gap-1" style="font-size: 14px" @click="day.cleanDay()">
          <Check :size="16" /> Giornata pulita
        </button>
        <button class="flex-1 bg-raised text-ink rounded-xl py-2.5 font-semibold flex items-center justify-center gap-1" style="font-size: 14px" @click="urgeOpen = true">
          <Wind :size="16" /> Ho voglia
        </button>
      </div>
    </AppCard>

    <!-- Movimento -->
    <button class="w-full text-left" style="border: none; background: none; padding: 0" @click="navigateTo('/movimento')">
      <AppCard :style="{ background: 'var(--move-soft)', border: 'none' }">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Bike :size="18" class="text-move" />
            <span style="font-weight: 600">Movimento</span>
          </div>
          <ChevronRight :size="16" class="text-faint" />
        </div>
        <div class="flex items-end gap-2 mb-3">
          <span class="text-move tabular" style="font-size: 34px; font-weight: 700; line-height: 1">{{ day.moveMin }}</span>
          <span class="text-dim" style="font-size: 14px; margin-bottom: 4px">′ · obiettivo {{ settings.goals.moveMin }}′</span>
        </div>
        <div class="bg-line rounded-full overflow-hidden" style="height: 10px">
          <div class="bg-move h-full rounded-full" :style="{ width: pct(day.moveMin, settings.goals.moveMin), transition: 'width 500ms' }" />
        </div>
      </AppCard>
    </button>

    <!-- Pasti -->
    <button class="w-full text-left" style="border: none; background: none; padding: 0" @click="navigateTo('/pasti')">
      <AppCard :style="{ background: 'var(--food-soft)', border: 'none' }">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Apple :size="18" class="text-food" />
            <span style="font-weight: 600">Pasti</span>
          </div>
          <ChevronRight :size="16" class="text-faint" />
        </div>
        <div class="flex items-end gap-2 mb-3">
          <span class="text-food tabular" style="font-size: 34px; font-weight: 700; line-height: 1">{{ day.totals.kcal }}</span>
          <span class="text-dim" style="font-size: 14px; margin-bottom: 4px">kcal · {{ today.meals.length }} {{ today.meals.length === 1 ? "voce" : "voci" }}</span>
        </div>
        <div class="bg-line rounded-full overflow-hidden" style="height: 10px">
          <div class="bg-food h-full rounded-full" :style="{ width: pct(day.totals.kcal, settings.goals.kcal), transition: 'width 500ms' }" />
        </div>
      </AppCard>
    </button>

    <!-- FAB -->
    <button
      class="fixed flex items-center gap-2 font-semibold px-4 py-3 rounded-3xl shadow-soft bg-food"
      style="bottom: 88px; right: max(20px, calc(50% - 240px)); z-index: 40; color: var(--on-food)"
      @click="mealOpen = true">
      <Camera :size="18" /> Scatta pasto
    </button>

    <BottomSheet v-model="mealOpen" title="Aggiungi un pasto">
      <MealCapture @save="onMeal" />
    </BottomSheet>
    <BottomSheet v-model="urgeOpen" title="Aspetta un attimo">
      <UrgeSurf @water="day.addWater(250); urgeOpen = false" />
    </BottomSheet>
    <BottomSheet v-model="drinkOpen" title="Cosa hai bevuto">
      <DrinkLog @log="onDrink" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { Droplet, Minus, Wine, Check, Wind, Plus, X, Bike, Apple, Camera, ChevronRight } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);

const mealOpen = ref(false);
const urgeOpen = ref(false);
const drinkOpen = ref(false);

const pct = (v: number, goal: number) => `${Math.min(100, (v / goal) * 100)}%`;

const segments = computed(() => [
  { color: "var(--water)", value: today.value.water / settings.goals.water },
  { color: "var(--alcohol)", value: today.value.drinks.length === 0 ? 1 : 0.15 },
  { color: "var(--move)", value: day.moveMin / settings.goals.moveMin },
  { color: "var(--food)", value: day.totals.kcal > 0 ? Math.min(1, day.totals.kcal / settings.goals.kcal) : 0 },
]);

function onMeal(m: any) {
  day.addMeal(m);
  mealOpen.value = false;
}
function onDrink(d: { name: string; alc: number; kcal: number }) {
  day.logDrink(d);
  drinkOpen.value = false;
}
</script>
