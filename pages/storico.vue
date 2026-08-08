<template>
  <div class="space-y-4">
    <!-- selettore periodo a pillola -->
    <div class="rise flex gap-1.5 p-1.5 rounded-3xl" style="background: var(--surface-2)">
      <button v-for="m in modes" :key="m.key" class="tap flex-1 py-2.5 rounded-2xl font-semibold" style="font-size: 14px"
        :style="mode === m.key ? { background: 'var(--card)', color: 'var(--ink)', boxShadow: 'var(--shadow)' } : { color: 'var(--dim)' }"
        @click="mode = m.key">
        {{ m.label }}
      </button>
    </div>

    <!-- riepilogo: quattro tinte, quattro numeri -->
    <div class="grid grid-cols-2 gap-3 rise" style="animation-delay: 60ms">
      <div v-for="s in stats" :key="s.label" class="rounded-4xl p-4" :style="{ background: `var(--${s.tone}-soft)` }">
        <div class="rounded-2xl flex items-center justify-center mb-2.5" :class="`grad-${s.tone}`" style="width: 34px; height: 34px">
          <component :is="s.icon" :size="17" color="#fff" />
        </div>
        <div class="display tabular" :style="{ color: `var(--${s.tone})`, fontSize: '24px', fontWeight: 700, lineHeight: 1.1 }">
          {{ s.value }}<span style="font-size: 13px; font-weight: 600"> {{ s.unit }}</span>
        </div>
        <div class="text-dim" style="font-size: 12px; margin-top: 2px">{{ s.label }}</div>
      </div>
    </div>

    <!-- elenco giorni -->
    <div class="rise" style="animation-delay: 120ms">
      <div class="display px-1 mb-2.5" style="font-weight: 700; font-size: 17px">Giorno per giorno</div>
      <div class="space-y-2">
        <button v-for="k in keys" :key="k" class="tap w-full text-left rounded-3xl px-4 py-3.5 flex items-center gap-3"
          :style="{
            background: 'var(--card)',
            border: k === todayK ? '1.5px solid var(--water)' : '1px solid var(--line)',
          }"
          @click="open(k)">
          <span class="rounded-full shrink-0" style="width: 9px; height: 9px"
            :style="{ background: sum(k).alcGrams > 0 ? 'var(--alcohol)' : sum(k).hasData ? 'var(--move)' : 'var(--line)' }" />
          <div class="min-w-0 flex-1">
            <div class="text-ink truncate" style="font-weight: 600; font-size: 14.5px; text-transform: capitalize">
              {{ fmtShort(k) }}<span v-if="k === todayK" class="text-water" style="font-size: 11px; font-weight: 600"> · oggi</span>
            </div>
            <div v-if="sum(k).hasData" class="text-dim tabular" style="font-size: 12.5px">
              {{ sum(k).water }} ml · {{ sum(k).kcal }} kcal · {{ sum(k).moveMin }}′<span v-if="sum(k).alcGrams > 0" class="text-alcohol"> · {{ sum(k).alcGrams }} g</span>
            </div>
            <div v-else class="text-faint" style="font-size: 12.5px">nessun dato</div>
          </div>
          <ChevronRight :size="17" class="text-faint shrink-0" />
        </button>
      </div>
    </div>

    <p class="text-faint text-center" style="font-size: 12.5px">Tocca un giorno per aprirlo o aggiungere dati.</p>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Droplet, Apple, Bike, Wine } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { lastNDays, monthDays, fmtShort, todayKey } from "~/utils/date";

const day = useDayStore();
const mode = ref<"week" | "month">("week");
const modes = [
  { key: "week" as const, label: "Settimana" },
  { key: "month" as const, label: "Mese" },
];
const todayK = todayKey();
const sum = (k: string) => day.summaryOf(k);

const keys = computed(() => (mode.value === "week" ? lastNDays(7) : monthDays()));

const agg = computed(() => {
  const list = keys.value.map((k) => day.summaryOf(k));
  const active = list.filter((s) => s.hasData);
  const n = active.length || 1;
  return {
    waterAvg: Math.round(list.reduce((a, s) => a + s.water, 0) / n),
    kcalAvg: Math.round(list.reduce((a, s) => a + s.kcal, 0) / n),
    moveTot: list.reduce((a, s) => a + s.moveMin, 0),
    soberDays: active.filter((s) => s.alcGrams === 0).length,
    activeDays: active.length,
  };
});

const stats = computed(() => [
  { tone: "water", icon: Droplet, value: agg.value.waterAvg, unit: "ml", label: "acqua al giorno" },
  { tone: "food", icon: Apple, value: agg.value.kcalAvg, unit: "kcal", label: "calorie al giorno" },
  { tone: "move", icon: Bike, value: agg.value.moveTot, unit: "min", label: "movimento totale" },
  { tone: "alcohol", icon: Wine, value: `${agg.value.soberDays}/${agg.value.activeDays || keys.value.length}`, unit: "", label: "giorni senza alcol" },
]);

function open(k: string) {
  day.setDate(k);
  navigateTo("/");
}
</script>
