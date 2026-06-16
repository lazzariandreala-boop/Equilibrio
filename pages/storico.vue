<template>
  <div class="space-y-4">
    <!-- selettore periodo -->
    <div class="flex gap-2">
      <button
        class="flex-1 py-2.5 rounded-xl font-semibold"
        style="font-size: 14px"
        :class="mode === 'week' ? 'bg-water-soft text-water' : 'bg-raised text-dim'"
        @click="mode = 'week'">
        Settimana
      </button>
      <button
        class="flex-1 py-2.5 rounded-xl font-semibold"
        style="font-size: 14px"
        :class="mode === 'month' ? 'bg-water-soft text-water' : 'bg-raised text-dim'"
        @click="mode = 'month'">
        Mese
      </button>
    </div>

    <!-- riepilogo aggregato -->
    <AppCard>
      <div style="font-weight: 600" class="mb-3">{{ mode === "week" ? "Ultimi 7 giorni" : "Questo mese" }}</div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <div class="text-water tabular" style="font-size: 20px; font-weight: 700">{{ agg.waterAvg }} ml</div>
          <div class="text-faint" style="font-size: 12px">acqua / giorno</div>
        </div>
        <div>
          <div class="text-food tabular" style="font-size: 20px; font-weight: 700">{{ agg.kcalAvg }} kcal</div>
          <div class="text-faint" style="font-size: 12px">calorie / giorno</div>
        </div>
        <div>
          <div class="text-move tabular" style="font-size: 20px; font-weight: 700">{{ agg.moveTot }}′</div>
          <div class="text-faint" style="font-size: 12px">movimento totale</div>
        </div>
        <div>
          <div class="text-alcohol tabular" style="font-size: 20px; font-weight: 700">{{ agg.soberDays }}/{{ agg.activeDays || keys.length }}</div>
          <div class="text-faint" style="font-size: 12px">giorni senza alcol</div>
        </div>
      </div>
    </AppCard>

    <!-- elenco giorni -->
    <div class="space-y-2">
      <button
        v-for="k in keys"
        :key="k"
        class="w-full text-left bg-card border border-line rounded-2xl px-3.5 py-3 flex items-center justify-between"
        :class="k === todayK ? 'border-water' : ''"
        @click="open(k)">
        <div class="min-w-0">
          <div class="text-ink truncate" style="font-weight: 600; font-size: 14px; text-transform: capitalize">
            {{ fmtShort(k) }}<span v-if="k === todayK" class="text-water" style="font-size: 11px; font-weight: 600"> · oggi</span>
          </div>
          <div v-if="sum(k).hasData" class="text-faint tabular" style="font-size: 12px">
            {{ sum(k).water }}ml · {{ sum(k).kcal }}kcal · {{ sum(k).moveMin }}′<span v-if="sum(k).alcGrams > 0" class="text-alcohol"> · {{ sum(k).alcGrams }}g alcol</span>
          </div>
          <div v-else class="text-faint" style="font-size: 12px">nessun dato</div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span
            class="rounded-full"
            :style="{ width: '8px', height: '8px', background: sum(k).alcGrams > 0 ? 'var(--alcohol)' : sum(k).hasData ? 'var(--move)' : 'var(--line)' }" />
          <ChevronRight :size="16" class="text-faint" />
        </div>
      </button>
    </div>

    <p class="text-faint text-center" style="font-size: 12px">Tocca un giorno per vederlo o aggiungere dati.</p>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { lastNDays, monthDays, fmtShort, todayKey } from "~/utils/date";

const day = useDayStore();
const mode = ref<"week" | "month">("week");
const todayK = todayKey();
const sum = (k: string) => day.summaryOf(k);

const keys = computed(() => (mode.value === "week" ? lastNDays(7) : monthDays()));

const agg = computed(() => {
  const list = keys.value.map((k) => day.summaryOf(k));
  const active = list.filter((s) => s.hasData);
  const n = active.length || 1;
  const waterTot = list.reduce((a, s) => a + s.water, 0);
  const kcalTot = list.reduce((a, s) => a + s.kcal, 0);
  const moveTot = list.reduce((a, s) => a + s.moveMin, 0);
  const soberDays = active.filter((s) => s.alcGrams === 0).length;
  return {
    waterAvg: Math.round(waterTot / n),
    kcalAvg: Math.round(kcalTot / n),
    moveTot,
    soberDays,
    activeDays: active.length,
  };
});

function open(k: string) {
  day.setDate(k);
  navigateTo("/");
}
</script>
