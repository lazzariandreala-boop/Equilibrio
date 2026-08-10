<template>
  <div class="space-y-3">
    <DayNav />

    <HeroCard tone="water" :icon="GlassWater" :title="day.isToday ? 'Acqua di oggi' : 'Acqua del giorno'"
      :value="today.water" unit="ml" :caption="`obiettivo ${settings.goals.water} ml`"
      :progress="(today.water / settings.goals.water) * 100" :stats="stats" />

    <div class="grid grid-cols-3 gap-2.5 rise" style="animation-delay: 70ms">
      <button v-for="ml in [200, 250, 500]" :key="ml"
        class="tap rounded-4xl flex flex-col items-center justify-center gap-1 raised-3d" style="padding: 13px 4px; background: var(--water-soft); border: 1px solid var(--line)"
        @click="day.addWater(ml)">
        <GlassWater :size="20" color="var(--water)" />
        <span class="display tabular text-water" style="font-size: 17px; font-weight: 700">+{{ ml }}</span>
        <span class="text-faint" style="font-size: 10.5px">ml</span>
      </button>
    </div>

    <button class="tap w-full rounded-full py-3.5 font-semibold flex items-center justify-center gap-2 bg-raised text-dim rise"
      style="font-size: 14.5px; animation-delay: 120ms" @click="day.addWater(-250)">
      <Minus :size="16" /> Togli 250 ml
    </button>

    <EmptyState v-if="today.water === 0" tone="water" style="animation-delay: 170ms"
      :title="day.isToday ? 'Non hai ancora bevuto' : 'Nessuna acqua registrata'"
      subtitle="Un bicchiere a ogni pasto è già metà obiettivo. Bere poco per volta funziona meglio che recuperare la sera." />

    <AppCard v-else class="rise" style="animation-delay: 170ms">
      <div class="flex items-start gap-3">
        <Info :size="18" class="text-water shrink-0" style="margin-top: 2px" />
        <p class="text-dim" style="font-size: 13px; line-height: 1.5">
          {{ remaining > 0
            ? `Ti mancano ${remaining} ml: sono circa ${Math.ceil(remaining / 250)} bicchieri.`
            : "Obiettivo raggiunto. Continuare a bere durante la giornata resta la cosa migliore." }}
        </p>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { Minus, Info, GlassWater, Droplets, Target } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);
const remaining = computed(() => Math.max(0, settings.goals.water - today.value.water));

const stats = computed(() => [
  { icon: GlassWater, value: Math.round(today.value.water / 250), label: "bicchieri" },
  { icon: Target, value: remaining.value, unit: "ml", label: "ancora da bere" },
]);
</script>
