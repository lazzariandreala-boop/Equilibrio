<template>
  <div class="space-y-4">
    <DayNav />

    <div class="rise rounded-5xl overflow-hidden grad-food relative" style="box-shadow: 0 14px 34px var(--food-glow)">
      <div class="absolute rounded-full" style="width: 180px; height: 180px; left: -64px; bottom: -80px; background: rgba(255,255,255,.14)" />
      <div class="relative p-6">
        <div class="text-center">
          <div style="color: rgba(255,255,255,.82); font-size: 13px; font-weight: 500">
            {{ day.isToday ? "Oggi" : "Giorno selezionato" }}
          </div>
          <div class="display tabular" style="color: #fff; font-size: 52px; font-weight: 800; line-height: 1.05; margin: 4px 0 2px">
            {{ day.totals.kcal }}<span style="font-size: 20px; font-weight: 600; opacity: .8"> kcal</span>
          </div>
          <div style="color: rgba(255,255,255,.78); font-size: 13px">obiettivo {{ settings.goals.kcal }} kcal</div>
          <div class="rounded-full overflow-hidden mt-4 mb-5" style="height: 8px; background: rgba(255,255,255,.28)">
            <div class="fill" style="background: #fff" :style="{ width: pct }" />
          </div>
        </div>

        <div class="flex">
          <div v-for="m in macros" :key="m.label" class="flex-1 text-center">
            <div class="display tabular" style="color: #fff; font-weight: 700; font-size: 18px">{{ m.value }}<span style="font-size: 11px"> g</span></div>
            <div style="color: rgba(255,255,255,.75); font-size: 10px; letter-spacing: .2px">{{ m.label }}</div>
          </div>
        </div>

        <div v-if="day.totals.alc > 0" class="text-center" style="color: rgba(255,255,255,.85); font-size: 12px; margin-top: 14px">
          Contiene alcol — registrato anche in Alcol
        </div>
      </div>
    </div>

    <button class="tap w-full rounded-4xl py-3.5 font-semibold flex items-center justify-center gap-2 grad-food rise"
      style="color: #fff; font-size: 15px; box-shadow: 0 12px 28px var(--food-glow); animation-delay: 80ms"
      @click="mealOpen = true">
      <Camera :size="18" /> Scatta o aggiungi un pasto
    </button>

    <div v-if="today.meals.length === 0" class="rise text-center" style="padding: 18px 24px; animation-delay: 140ms">
      <div class="rounded-3xl mx-auto flex items-center justify-center mb-3" style="width: 56px; height: 56px; background: var(--food-soft)">
        <Utensils :size="24" class="text-food" />
      </div>
      <p class="text-dim" style="font-size: 14px; line-height: 1.5">
          {{ day.isToday
            ? "Nessun pasto registrato. Inizia con una foto: ci pensa l'app a stimare i valori."
            : "Nessun pasto registrato in questo giorno." }}
        </p>
    </div>

    <div v-else class="space-y-2.5 rise" style="animation-delay: 140ms">
      <AppCard v-for="(m, i) in today.meals" :key="i" pad="p-3.5">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate" style="font-weight: 600; font-size: 15px">{{ m.name }}</div>
            <div class="text-dim tabular" style="font-size: 12.5px">
              {{ m.kcal }} kcal · C {{ m.cho }} · P {{ m.pro }} · G {{ m.fat }} · F {{ m.fib ?? 0 }}<span v-if="m.alc > 0" class="text-alcohol"> · alc {{ m.alc }} g</span>
            </div>
          </div>
          <button class="tap text-faint p-2 rounded-xl shrink-0 bg-raised" aria-label="Elimina pasto" @click="day.removeMeal(i)">
            <Trash2 :size="16" />
          </button>
        </div>
      </AppCard>
    </div>

    <BottomSheet v-model="mealOpen" title="Aggiungi un pasto">
      <MealCapture @save="onMeal" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { Camera, Trash2, Utensils } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);
const mealOpen = ref(false);
const pct = computed(() => `${Math.min(100, (day.totals.kcal / settings.goals.kcal) * 100)}%`);

const macros = computed(() => [
  { label: "Carboidrati", value: day.totals.cho },
  { label: "Proteine", value: day.totals.pro },
  { label: "Grassi", value: day.totals.fat },
  { label: "Fibre", value: day.totals.fib },
]);

function onMeal(m: any) {
  day.addMeal(m);
  mealOpen.value = false;
}
</script>
