<template>
  <div class="space-y-3">
    <DayNav />

    <!-- Con il ciclo monitorato la sintesi si stringe e cede metà spazio
         alla card del ciclo, raggiungibile senza passare dal Profilo. -->
    <div v-if="settings.profile.cycleTracking || settings.profile.pregnant" class="grid grid-cols-2 gap-3 rise" style="min-height: 150px">
      <BalanceMini :marks="marks" :message="message" />
      <CycleMini />
    </div>
    <BalanceHero v-else :pct="overall" :on-track="onTrack" />

    <div class="grid grid-cols-2 gap-3">
      <div class="rise" style="animation-delay: 60ms">
        <MetricTile to="/acqua" :icon="GlassWater" tone="water" label="Acqua" :value="today.water" unit="ml"
          :sub="`/ ${settings.goals.water} ml`" :progress="p.water" />
      </div>

      <div class="rise" style="animation-delay: 110ms">
        <MetricTile to="/movimento" :icon="Footprints" tone="move" label="Movimento" :value="day.moveMin" unit="min"
          :sub="`/ ${settings.goals.moveMin} min`" :progress="p.move" />
      </div>

      <div class="rise" style="animation-delay: 160ms">
        <MetricTile to="/pasti" :icon="UtensilsCrossed" tone="food" label="Pasti" :value="day.totals.kcal" unit="kcal"
          :sub="`/ ${settings.goals.kcal} kcal`" :progress="p.food">
          <template #footer>
            <div class="flex tabular" style="font-size: 12px">
              <span v-for="m in macros" :key="m.l" class="flex-1 flex items-center gap-1">
                <span :style="{ color: `var(--${m.tone})`, fontWeight: 700 }">{{ m.l }}</span>
                <span class="text-dim">{{ m.v }}</span>
              </span>
            </div>
          </template>
        </MetricTile>
      </div>

      <div class="rise" style="animation-delay: 210ms">
        <MetricTile to="/alcol" :icon="Wine" tone="alcohol" label="Senza alcol" :value="day.streak"
          :unit="day.streak === 1 ? 'giorno' : 'giorni'" sub="consecutivi">
          <template #footer>
            <div class="flex gap-1.5" style="margin-top: 2px">
              <span v-for="(clean, i) in soberDots" :key="i" class="rounded-full"
                :style="{
                  width: '11px', height: '11px',
                  background: clean ? 'var(--alcohol)' : 'var(--line)',
                  boxShadow: clean ? '0 0 8px var(--alcohol-glow)' : 'none',
                }" />
            </div>
            <div style="color: var(--alcohol); font-size: 12px; font-weight: 600; margin-top: 7px">
              {{ day.isToday ? "oggi" : "quel giorno" }}: {{ day.alcGrams }} g
            </div>
          </template>
        </MetricTile>
      </div>
    </div>

    <NuxtLink v-if="settings.profile.diabetes" to="/glicemia" class="tap block rounded-4xl rise"
      style="padding: 12px 14px; animation-delay: 230ms"
      :style="{ background: 'var(--card)', border: `1px solid var(--${glucoseTone}-soft)`, boxShadow: 'var(--tile-shadow)' }">
      <div class="flex items-center gap-3">
        <div class="rounded-full flex items-center justify-center shrink-0" style="width: 40px; height: 40px"
          :style="{ background: `var(--${glucoseTone}-soft)`, border: `1.5px solid var(--${glucoseTone})` }">
          <Droplet :size="19" :color="`var(--${glucoseTone})`" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-ink" style="font-size: 14.5px; font-weight: 600">{{ glucoseLine }}</div>
          <div class="text-faint" style="font-size: 12.5px">{{ glucoseDetail }}</div>
        </div>
        <ChevronRight :size="18" :color="`var(--${glucoseTone})`" />
      </div>
    </NuxtLink>

    <NuxtLink to="/storico" class="tap block rounded-4xl rise"
      style="background: var(--card); border: 1px solid var(--line); padding: 12px 14px;
             box-shadow: inset 0 1px 0 rgba(255,255,255,.05); animation-delay: 260ms">
      <div class="flex items-center gap-3">
        <div class="rounded-full flex items-center justify-center shrink-0"
          style="width: 40px; height: 40px; background: var(--food-soft); border: 1.5px solid var(--food)">
          <Sprout :size="19" color="var(--food)" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-ink" style="font-size: 14.5px; font-weight: 600">Piccoli passi, grandi cambiamenti.</div>
          <div class="text-faint" style="font-size: 12.5px">Guarda come stai andando nel tempo.</div>
        </div>
        <ChevronRight :size="18" color="var(--food)" />
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { GlassWater, Footprints, UtensilsCrossed, Wine, Sprout, ChevronRight, CalendarHeart, Droplet } from "lucide-vue-next";
import { useGlucoseStore } from "~/stores/glucose";
import { classify, RANGE_TONE, RANGE_LABEL, insulinOnBoard } from "~/utils/diabetes";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";
import { lastNDays, keyToDate } from "~/utils/date";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);

const pct = (v: number, goal: number) => (goal > 0 ? Math.min(100, (v / goal) * 100) : 0);
const p = computed(() => ({
  water: pct(today.value.water, settings.goals.water),
  move: pct(day.moveMin, settings.goals.moveMin),
  food: pct(day.totals.kcal, settings.goals.kcal),
  alcohol: today.value.drinks.length === 0 ? 100 : 0,
}));

// Percentuale complessiva: media delle quattro voci, ciascuna limitata al 100%.
const overall = computed(() =>
  Math.round((p.value.water + p.value.move + p.value.food + p.value.alcohol) / 4),
);

// Un'abitudine è "ben avviata" dal 70% dell'obiettivo in su.
const onTrack = computed(() => Object.values(p.value).filter((v) => v >= 70).length);

const macros = computed(() => [
  { l: "C", v: day.totals.cho, tone: "food" },
  { l: "P", v: day.totals.pro, tone: "water" },
  { l: "G", v: day.totals.fat, tone: "move" },
]);

// Le quattro voci considerate avviate: alimentano le tacche della card ridotta.
const marks = computed(() => [
  p.value.water >= 70,
  p.value.move >= 70,
  p.value.food >= 70,
  p.value.alcohol >= 70,
]);

const message = computed(() => {
  const n = marks.value.filter(Boolean).length;
  if (n >= 4) return "Giornata piena!";
  if (n === 3) return "Stai andando bene!";
  if (n === 2) return "Buon ritmo, continua.";
  if (n === 1) return "Un passo è già partito.";
  return "Si comincia quando vuoi.";
});

// ── glicemia ──
const glucose = useGlucoseStore();

const glucoseTone = computed(() => {
  const r = glucose.lastReading;
  return r ? RANGE_TONE[classify(r.value, settings.diabetes)] : "water";
});

const glucoseLine = computed(() => {
  const r = glucose.lastReading;
  if (!r) return "Nessuna glicemia registrata";
  return `${r.value} mg/dL · ${RANGE_LABEL[classify(r.value, settings.diabetes)]}`;
});

const glucoseDetail = computed(() => {
  const r = glucose.lastReading;
  if (!r) return "Tocca per registrare la prima misurazione";
  const active = insulinOnBoard(glucose.recentBoluses(settings.diabetes.duration), settings.diabetes);
  const when = new Date(r.at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  return active > 0 ? `misurata alle ${when} · ${active} U ancora attive` : `misurata alle ${when}`;
});

const soberDots = computed(() =>
  lastNDays(6, keyToDate(day.date)).reverse().map((k) => day.summaryOf(k).alcGrams === 0),
);
</script>
