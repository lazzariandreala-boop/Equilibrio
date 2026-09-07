<template>
  <div>
    <!-- navigazione fra i mesi -->
    <div class="flex items-center justify-between rounded-3xl px-2 py-2" style="background: var(--raised)">
      <button class="tap p-2 rounded-2xl" aria-label="Mese precedente" @click="shift(-1)">
        <ChevronLeft :size="19" color="var(--alcohol)" />
      </button>
      <span class="text-ink" style="font-weight: 700; font-size: 15px; text-transform: capitalize">
        {{ monthLabel }}
      </span>
      <button class="tap p-2 rounded-2xl" aria-label="Mese successivo" @click="shift(1)">
        <ChevronRight :size="19" color="var(--alcohol)" />
      </button>
    </div>

    <!-- intestazione dei giorni -->
    <div class="grid grid-cols-7" style="margin-top: 12px">
      <div v-for="d in WEEK" :key="d" class="text-faint text-center" style="font-size: 11px; font-weight: 600">
        {{ d }}
      </div>
    </div>

    <!-- griglia -->
    <div class="grid grid-cols-7 gap-1" style="margin-top: 6px">
      <div v-for="(cell, i) in cells" :key="i" class="flex items-center justify-center" style="aspect-ratio: 1">
        <div v-if="cell" class="flex items-center justify-center rounded-full relative"
          style="width: 100%; max-width: 38px; aspect-ratio: 1"
          :style="styleOf(cell)">
          <span :style="{ fontSize: '13px', fontWeight: kind(cell) === 'nessuno' ? 500 : 700 }">{{ cell.day }}</span>
          <span v-if="cell.key === today" class="absolute rounded-full"
            :style="{ bottom: '3px', width: '4px', height: '4px', background: kind(cell) === 'nessuno' ? 'var(--ink)' : '#fff' }" />
        </div>
      </div>
    </div>

    <!-- legenda -->
    <div class="flex flex-wrap gap-x-4 gap-y-2" style="margin-top: 14px">
      <div class="flex items-center gap-1.5">
        <span class="rounded-full grad-alcohol" style="width: 12px; height: 12px" />
        <span class="text-dim" style="font-size: 12px">giorni registrati</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="rounded-full" style="width: 12px; height: 12px; border: 1.5px dashed var(--alcohol)" />
        <span class="text-dim" style="font-size: 12px">previsione</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="rounded-full" style="width: 12px; height: 12px; background: var(--line)" />
        <span class="text-dim" style="font-size: 12px">oggi</span>
      </div>
    </div>

    <!-- andamento della durata: si vede subito se il ciclo è regolare -->
    <div v-if="gaps.length >= 2" style="margin-top: 16px">
      <div class="display text-ink mb-2" style="font-size: 15px; font-weight: 700">Quanto varia</div>
      <div class="flex items-end gap-1.5" style="height: 64px">
        <div v-for="(g, i) in gaps" :key="i" class="flex-1 flex flex-col items-center justify-end" style="height: 100%">
          <span class="tabular text-faint" style="font-size: 10px; margin-bottom: 3px">{{ g.len }}</span>
          <div class="w-full rounded-t-lg"
            :style="{
              height: `${barHeight(g.len)}%`,
              background: Math.abs(g.len - cycle.averageLength) > 4 ? 'var(--food)' : 'var(--alcohol)',
            }" />
        </div>
      </div>
      <p class="text-faint" style="font-size: 12px; margin-top: 8px; line-height: 1.45">
        Intervalli fra un inizio e il successivo, dal più vecchio al più recente. Media {{ cycle.averageLength }} giorni;
        le barre arancioni si discostano di oltre 4 giorni.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { useCycleStore } from "~/stores/cycle";
import { useSettingsStore } from "~/stores/settings";
import { todayKey, keyToDate } from "~/utils/date";

const cycle = useCycleStore();
const settings = useSettingsStore();

const WEEK = ["L", "M", "M", "G", "V", "S", "D"];
const today = todayKey();

const cursor = ref(new Date());
function shift(n: number) {
  const d = new Date(cursor.value);
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  cursor.value = d;
}

const monthLabel = computed(() =>
  cursor.value.toLocaleDateString("it-IT", { month: "long", year: "numeric" }),
);

/** Giorni coperti da un ciclo registrato: dall'inizio alla fine, inclusi. */
const recordedDays = computed(() => {
  const set = new Set<string>();
  for (const e of cycle.entries) {
    const start = keyToDate(e.start);
    // Senza data di fine si evidenzia solo l'inizio, per non inventare durate.
    const end = e.end ? keyToDate(e.end) : start;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      set.add(todayKey(d));
    }
  }
  return set;
});

/** Finestra prevista: il giorno stimato più i due successivi. */
const predictedDays = computed(() => {
  const set = new Set<string>();
  if (settings.profile.pregnant) return set; // in gravidanza non si prevede nulla
  const p = cycle.status.predicted;
  if (!p || cycle.status.kind === "in-corso") return set;
  const d = keyToDate(p);
  for (let i = 0; i < 3; i++) {
    set.add(todayKey(d));
    d.setDate(d.getDate() + 1);
  }
  return set;
});

const cells = computed(() => {
  const y = cursor.value.getFullYear();
  const m = cursor.value.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7; // la settimana parte da lunedì
  const total = new Date(y, m + 1, 0).getDate();

  const out: ({ day: number; key: string } | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= total; d++) {
    out.push({ day: d, key: todayKey(new Date(y, m, d)) });
  }
  return out;
});

function kind(cell: { key: string }) {
  if (recordedDays.value.has(cell.key)) return "registrato";
  if (predictedDays.value.has(cell.key)) return "previsto";
  return "nessuno";
}

function styleOf(cell: { key: string }) {
  const k = kind(cell);
  if (k === "registrato") {
    return {
      background: "linear-gradient(135deg, var(--alcohol-2), var(--alcohol))",
      color: "#fff",
      boxShadow: "0 4px 12px -4px var(--alcohol-glow)",
    };
  }
  if (k === "previsto") {
    return { border: "1.5px dashed var(--alcohol)", color: "var(--alcohol)" };
  }
  return {
    background: cell.key === today ? "var(--line)" : "transparent",
    color: "var(--dim)",
  };
}

/** Intervalli fra inizi consecutivi, in ordine cronologico. */
const gaps = computed(() => {
  const starts = [...cycle.entries].map((e) => e.start).sort();
  const out: { len: number }[] = [];
  for (let i = 0; i < starts.length - 1; i++) {
    const len = Math.round(
      (keyToDate(starts[i + 1]).getTime() - keyToDate(starts[i]).getTime()) / 86400000,
    );
    if (len >= 15 && len <= 60) out.push({ len });
  }
  return out.slice(-10);
});

function barHeight(len: number) {
  const max = Math.max(...gaps.value.map((g) => g.len), cycle.averageLength);
  const min = Math.min(...gaps.value.map((g) => g.len), cycle.averageLength);
  const span = Math.max(1, max - min);
  return 35 + ((len - min) / span) * 65; // mai schiacciata a zero
}
</script>
