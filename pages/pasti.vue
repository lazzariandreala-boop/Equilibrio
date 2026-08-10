<template>
  <div class="space-y-3.5">
    <DayNav />

    <HeroCard tone="food" :icon="Flame" :title="day.isToday ? 'Pasti di oggi' : 'Pasti del giorno'"
      :value="day.totals.kcal" unit="kcal" :caption="`obiettivo ${settings.goals.kcal} kcal`"
      :progress="(day.totals.kcal / settings.goals.kcal) * 100" :stats="macros">
      <div v-if="day.totals.alc > 0" class="text-center"
        style="color: rgba(255,255,255,.85); font-size: 12px; margin-top: 14px">
        Contiene alcol — registrato anche in Alcol
      </div>
    </HeroCard>

    <button class="tap w-full rounded-full py-4 font-semibold flex items-center justify-center gap-2.5 grad-food rise"
      style="color: #fff; font-size: 16px; box-shadow: 0 12px 30px var(--food-glow); animation-delay: 70ms"
      @click="open()">
      <Camera :size="19" /> Scatta o aggiungi un pasto
    </button>

    <EmptyState v-if="today.meals.length === 0" tone="food" :icon="Salad"
      :title="day.isToday ? 'Nessun pasto registrato' : 'Nessun pasto in questo giorno'"
      subtitle="Inizia con una foto: ci pensa l'app a stimare i valori."
      :actions="quick" style="animation-delay: 130ms" @action="open" />

    <div v-else class="space-y-2.5 rise" style="animation-delay: 130ms">
      <AppCard v-for="(m, i) in today.meals" :key="i" pad="p-3.5">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate" style="font-weight: 600; font-size: 15px">{{ m.name }}</div>
            <div class="text-dim tabular" style="font-size: 12.5px">
              {{ m.kcal }} kcal · C {{ m.cho }} · P {{ m.pro }} · G {{ m.fat }} · F {{ m.fib ?? 0 }}
              <span v-if="m.alc > 0" class="text-alcohol"> · alc {{ m.alc }} g</span>
            </div>
          </div>
          <button class="tap text-faint p-2 rounded-xl shrink-0 bg-raised" aria-label="Elimina pasto"
            @click="day.removeMeal(i)">
            <Trash2 :size="16" />
          </button>
        </div>
      </AppCard>
    </div>

    <BottomSheet v-model="mealOpen" :title="sheetTitle">
      <MealCapture @save="onMeal" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { Camera, Trash2, Flame, Salad, Wheat, Dna, Droplet, Leaf, Coffee, Sun, Moon } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);
const mealOpen = ref(false);
const sheetTitle = ref("Aggiungi un pasto");

const macros = computed(() => [
  { icon: Wheat, value: day.totals.cho, unit: "g", label: "Carboidrati" },
  { icon: Dna, value: day.totals.pro, unit: "g", label: "Proteine" },
  { icon: Droplet, value: day.totals.fat, unit: "g", label: "Grassi" },
  { icon: Leaf, value: day.totals.fib, unit: "g", label: "Fibre" },
]);

// Scorciatoie: aprire già sapendo di che pasto si tratta evita un passaggio.
const quick = [
  { id: "Colazione", label: "Colazione", icon: Coffee },
  { id: "Pranzo", label: "Pranzo", icon: Sun },
  { id: "Cena", label: "Cena", icon: Moon },
];

function open(kind?: string) {
  sheetTitle.value = kind ? `Aggiungi: ${kind.toLowerCase()}` : "Aggiungi un pasto";
  mealOpen.value = true;
}

function onMeal(m: any) {
  day.addMeal(m);
  mealOpen.value = false;
}
</script>
