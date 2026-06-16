<template>
  <div class="space-y-4">
    <DayNav />
    <AppCard class="!p-5">
      <div class="flex items-baseline justify-between mb-3">
        <span class="text-dim" style="font-size: 14px">{{ day.isToday ? "Oggi" : "Giorno selezionato" }}</span>
        <span class="tabular" style="font-size: 28px; font-weight: 700">
          {{ day.totals.kcal }} <span class="text-dim" style="font-size: 15px">kcal</span>
        </span>
      </div>
      <div class="bg-line rounded-full overflow-hidden mb-4" style="height: 8px">
        <div class="bg-food h-full" :style="{ width: pct }" />
      </div>
      <div class="flex gap-3">
        <div class="flex-1 text-center">
          <div class="text-food tabular" style="font-weight: 700; font-size: 18px">{{ day.totals.cho }}g</div>
          <div class="text-faint" style="font-size: 11px">Carboidrati</div>
        </div>
        <div class="flex-1 text-center">
          <div class="text-move tabular" style="font-weight: 700; font-size: 18px">{{ day.totals.pro }}g</div>
          <div class="text-faint" style="font-size: 11px">Proteine</div>
        </div>
        <div class="flex-1 text-center">
          <div class="text-alcohol tabular" style="font-weight: 700; font-size: 18px">{{ day.totals.fat }}g</div>
          <div class="text-faint" style="font-size: 11px">Grassi</div>
        </div>
      </div>
      <div v-if="day.totals.alc > 0" class="text-alcohol text-center" style="font-size: 12px; margin-top: 10px">
        Contiene alcol — registrato anche nella sezione Alcol
      </div>
    </AppCard>

    <button class="bg-food-soft text-food w-full py-3 rounded-3xl font-semibold flex items-center justify-center gap-2" @click="mealOpen = true">
      <Camera :size="18" /> Scatta o aggiungi un pasto
    </button>

    <p v-if="today.meals.length === 0" class="text-faint text-center" style="font-size: 14px; padding-top: 12px">
      Nessun pasto registrato. Inizia con una foto.
    </p>

    <div class="space-y-3">
      <AppCard v-for="(m, i) in today.meals" :key="i" class="!p-3.5">
        <div class="flex items-center justify-between">
          <div class="min-w-0">
            <div class="truncate" style="font-weight: 600">{{ m.name }}</div>
            <div class="text-dim" style="font-size: 12px">
              {{ m.kcal }} kcal · C {{ m.cho }} · P {{ m.pro }} · G {{ m.fat }}<span v-if="m.alc > 0"> · alc {{ m.alc }}g</span>
            </div>
          </div>
          <button class="text-faint p-2" @click="day.removeMeal(i)"><Trash2 :size="16" /></button>
        </div>
      </AppCard>
    </div>

    <BottomSheet v-model="mealOpen" title="Aggiungi un pasto">
      <MealCapture @save="onMeal" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { Camera, Trash2 } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);
const mealOpen = ref(false);
const pct = computed(() => `${Math.min(100, (day.totals.kcal / settings.goals.kcal) * 100)}%`);

function onMeal(m: any) {
  day.addMeal(m);
  mealOpen.value = false;
}
</script>
