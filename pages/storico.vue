<template>
  <div class="space-y-3">
    <!-- periodo -->
    <div class="rise flex gap-1.5 p-1.5 rounded-4xl"
      style="background: var(--raised); border: 1px solid var(--line)">
      <button v-for="m in modes" :key="m.key" class="tap flex-1 py-3 rounded-3xl font-semibold" style="font-size: 14.5px"
        :style="mode === m.key
          ? { background: 'var(--card)', color: 'var(--ink)', boxShadow: `inset 0 0 0 1px var(--alcohol), 0 0 16px -4px var(--alcohol-glow)` }
          : { color: 'var(--dim)' }"
        @click="mode = m.key">
        {{ m.label }}
      </button>
    </div>

    <!-- riepilogo del periodo -->
    <div class="grid grid-cols-2 gap-3 rise" style="animation-delay: 60ms">
      <div v-for="s in stats" :key="s.label" class="rounded-4xl relative overflow-hidden"
        :style="{
          background: `linear-gradient(155deg, ${s.tone === 'water' ? 'var(--water-soft)' : `var(--${s.tone}-soft)`}, var(--card) 82%)`,
          border: `1px solid var(--${s.tone}-soft)`,
          boxShadow: 'var(--tile-shadow)',
          minHeight: '148px',
        }">
        <!-- filigrana propria di ogni voce -->
        <svg class="absolute pointer-events-none" viewBox="0 0 100 100" aria-hidden="true"
          style="right: -6px; bottom: -6px; width: 96px; height: 96px; opacity: .3">
          <g fill="none" :stroke="`var(--${s.tone})`" stroke-width="2" stroke-linecap="round">
            <template v-if="s.tone === 'water'">
              <path d="M6 74c10-8 20-8 30 0s20 8 30 0 20-8 30 0" />
              <path d="M14 86c9-7 18-7 27 0s18 7 27 0" />
              <circle cx="70" cy="40" r="4" /><circle cx="84" cy="54" r="2.5" />
            </template>
            <template v-else-if="s.tone === 'food'">
              <path d="M24 58h56c0 15-12 26-28 26S24 73 24 58Z" />
              <path d="M44 46c-2-8 2-14 8-17 2 8-1 14-8 17ZM56 48c6-7 14-9 22-7-4 7-13 10-22 7Z" />
            </template>
            <template v-else-if="s.tone === 'move'">
              <path d="M4 88c14-6 22-16 26-30s12-24 26-28 26-2 40 4" />
              <path d="M20 88c12-6 19-14 23-26" opacity=".6" />
            </template>
            <template v-else>
              <path d="M50 22l26 10v20c0 16-11 27-26 32-15-5-26-16-26-32V32l26-10Z" />
              <path d="M39 58l8 9 16-18" />
            </template>
          </g>
        </svg>

        <div class="relative flex flex-col h-full" style="padding: 13px">
          <div class="rounded-full flex items-center justify-center"
            :style="{
              width: '44px', height: '44px',
              background: `var(--${s.tone}-soft)`,
              boxShadow: `inset 0 0 0 1.5px var(--${s.tone}), 0 0 18px -4px var(--${s.tone}-glow)`,
            }">
            <component :is="s.icon" :size="21" :color="`var(--${s.tone})`" />
          </div>

          <div class="display tabular flex items-baseline gap-1" style="margin-top: auto; padding-top: 12px">
            <span :style="{ color: `var(--${s.tone})`, fontSize: '30px', fontWeight: 800, lineHeight: 1 }">{{ s.value }}</span>
            <span class="text-dim" style="font-size: 13px; font-weight: 600">{{ s.unit }}</span>
          </div>
          <div class="text-dim" style="font-size: 12.5px; margin-top: 3px">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- elenco dei giorni -->
    <div class="rise" style="animation-delay: 120ms">
      <Expandable title="Giorno per giorno" :icon="CalendarDays" tone="alcohol"
        :subtitle="`${keys.length} giorni · ${agg.activeDays} con dati`">
        <div class="space-y-2">
        <button v-for="k in keys" :key="k" class="tap w-full text-left rounded-4xl flex items-center gap-3"
          style="padding: 12px 14px"
          :style="k === todayK
            ? { background: 'var(--card)', boxShadow: `inset 0 0 0 1.5px var(--water), 0 0 20px -6px var(--water-glow)` }
            : { background: 'var(--card)', border: '1px solid var(--line)' }"
          @click="open(k)">
          <span class="rounded-full shrink-0" style="width: 9px; height: 9px"
            :style="{
              background: sum(k).alcGrams > 0 ? 'var(--alcohol)' : sum(k).hasData ? 'var(--water)' : 'var(--line)',
              boxShadow: sum(k).hasData ? `0 0 8px ${sum(k).alcGrams > 0 ? 'var(--alcohol-glow)' : 'var(--water-glow)'}` : 'none',
            }" />

          <div class="min-w-0 flex-1">
            <div class="text-ink truncate" style="font-weight: 700; font-size: 14.5px; text-transform: capitalize">
              {{ fmtShort(k) }}<span v-if="k === todayK" class="text-water" style="font-size: 12px; font-weight: 600"> · Oggi</span>
            </div>
            <div v-if="sum(k).hasData" class="flex flex-wrap items-center gap-x-3 gap-y-0.5 tabular"
              style="font-size: 12.5px; margin-top: 3px">
              <span class="flex items-center gap-1"><GlassWater :size="13" color="var(--water)" /><span class="text-dim">{{ sum(k).water }} ml</span></span>
              <span class="flex items-center gap-1"><UtensilsCrossed :size="13" color="var(--food)" /><span class="text-dim">{{ sum(k).kcal }} kcal</span></span>
              <span class="flex items-center gap-1"><Footprints :size="13" color="var(--move)" /><span class="text-dim">{{ sum(k).moveMin }} min</span></span>
              <span class="flex items-center gap-1"><Wine :size="13" color="var(--alcohol)" /><span class="text-dim">{{ sum(k).alcGrams }} g</span></span>
            </div>
            <div v-else class="text-faint" style="font-size: 12.5px; margin-top: 3px">nessun dato</div>
          </div>

            <ChevronRight :size="18" class="text-faint shrink-0" />
          </button>
        </div>
        <p class="text-faint text-center" style="font-size: 12px; margin-top: 10px">
          Tocca un giorno per aprirlo o aggiungere dati.
        </p>
      </Expandable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, GlassWater, UtensilsCrossed, Footprints, Wine, CalendarDays } from "lucide-vue-next";
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
  { tone: "water", icon: GlassWater, value: agg.value.waterAvg, unit: "ml", label: "acqua al giorno" },
  { tone: "food", icon: UtensilsCrossed, value: agg.value.kcalAvg, unit: "kcal", label: "calorie al giorno" },
  { tone: "move", icon: Footprints, value: agg.value.moveTot, unit: "min", label: "movimento totale" },
  { tone: "alcohol", icon: Wine, value: `${agg.value.soberDays}/${agg.value.activeDays || keys.value.length}`, unit: "", label: "giorni senza alcol" },
]);

function open(k: string) {
  day.setDate(k);
  navigateTo("/");
}
</script>
