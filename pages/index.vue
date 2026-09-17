<template>
  <div class="space-y-3 dash">
    <DayNav class="d8" />

    <!-- Chip della data: sul telefono l'informazione è già nell'intestazione -->
    <div class="desk-only rounded-4xl d4 flex items-center justify-center gap-2.5"
      :style="{ background: 'var(--card)', border: '1px solid var(--line)', padding: '13px 16px' }">
      <CalendarDays :size="17" color="var(--water)" />
      <span class="text-ink" style="font-size: 14.5px; font-weight: 600; text-transform: capitalize">{{ fullDate }}</span>
    </div>

    <!-- Con il ciclo monitorato la sintesi si stringe e cede metà spazio alla card del ciclo -->
    <div v-if="settings.profile.cycleTracking || settings.profile.pregnant"
      class="grid grid-cols-2 gap-3 rise" style="min-height: 150px">
      <BalanceMini :marks="marks" :message="message" />
      <CycleMini />
    </div>
    <BalanceHero v-else :pct="overall" :on-track="onTrack" />

    <!-- Le quattro voci -->
    <div class="grid grid-cols-2 desk-4 gap-3 d8">
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

    <!-- Colonna di fianco alle voci: sul telefono diventano due righe normali -->
    <div class="side-stack d4">
      <NuxtLink v-if="settings.profile.diabetes" to="/glicemia" class="tap block rounded-4xl rise"
        style="padding: 12px 14px; animation-delay: 230ms"
        :style="{ background: 'var(--card)', border: `1px solid var(--${glucoseTone}-soft)`, boxShadow: 'var(--tile-shadow)' }">
        <div class="flex items-center gap-3">
          <div class="rounded-full flex items-center justify-center shrink-0" style="width: 40px; height: 40px"
            :style="{ background: `var(--${glucoseTone}-soft)`, border: `1.5px solid var(--${glucoseTone})` }">
            <Droplet :size="19" :color="`var(--${glucoseTone})`" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-ink flex items-center gap-1.5" style="font-size: 14.5px; font-weight: 600">
              <span>{{ glucoseLine }}</span>
              <span v-if="glucoseTrendInfo.kind !== 'sconosciuta'" class="display"
                :style="{ color: `var(--${glucoseTone})`, fontSize: '17px', fontWeight: 800 }">
                {{ glucoseTrendInfo.arrow }}
              </span>
            </div>
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

    <!-- ── Pannelli: solo dove c'è spazio per usarli ── -->
    <div class="desk-only panel d6">
      <div class="flex items-center justify-between" style="margin-bottom: 12px">
        <div class="flex items-center gap-2">
          <UtensilsCrossed :size="18" color="var(--food)" />
          <span class="text-ink" style="font-size: 15.5px; font-weight: 700">Pasti di oggi</span>
        </div>
        <NuxtLink to="/pasti" class="flex items-center gap-1 text-food" style="font-size: 12.5px; font-weight: 600">
          Vedi tutti <ChevronRight :size="14" />
        </NuxtLink>
      </div>

      <div class="rounded-4xl grad-food relative overflow-hidden flex items-center gap-3" style="padding: 14px 16px">
        <EmptyIllustration variant="food" :size="74" class="shrink-0" style="opacity: .95" />
        <div class="min-w-0 flex-1">
          <div class="display tabular flex items-baseline gap-1.5">
            <span style="color: #fff; font-size: 34px; font-weight: 800; line-height: 1">{{ day.totals.kcal }}</span>
            <span style="color: #fff; font-size: 15px; font-weight: 700; opacity: .9">kcal</span>
          </div>
          <div style="color: rgba(255,255,255,.85); font-size: 12.5px">obiettivo {{ settings.goals.kcal }} kcal</div>
          <div class="flex items-center gap-2" style="margin-top: 9px">
            <div class="flex-1 rounded-full overflow-hidden" style="height: 7px; background: rgba(0,0,0,.18)">
              <div class="fill" style="background: #fff" :style="{ width: `${Math.min(100, p.food)}%` }" />
            </div>
            <span class="tabular rounded-full" style="padding: 2px 8px; font-size: 11px; font-weight: 700;
              background: rgba(14,9,5,.8); color: #fff">{{ Math.round(p.food) }}%</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-2" style="margin-top: 10px">
        <div v-for="m in macroCells" :key="m.label" class="rounded-3xl flex items-center gap-2"
          style="padding: 8px 9px; background: var(--raised)">
          <div class="rounded-full flex items-center justify-center shrink-0" style="width: 26px; height: 26px"
            :style="{ background: `var(--${m.tone}-soft)` }">
            <component :is="m.icon" :size="13" :color="`var(--${m.tone})`" />
          </div>
          <div class="min-w-0">
            <div class="display tabular text-ink" style="font-size: 13.5px; font-weight: 700; line-height: 1.1">
              {{ m.value }}<span style="font-size: 10px">g</span>
            </div>
            <div class="text-faint truncate" style="font-size: 10px">{{ m.label }}</div>
          </div>
        </div>
      </div>

      <NuxtLink to="/pasti" class="tap grad-food rounded-full flex items-center justify-center gap-2 cta-glow-food"
        style="color: #fff; font-size: 14.5px; font-weight: 600; padding: 12px 0; margin-top: 10px">
        <Camera :size="17" /> Scatta o aggiungi un pasto
      </NuxtLink>
    </div>

    <div class="desk-only panel d6">
      <div class="flex items-center justify-between" style="margin-bottom: 12px">
        <div class="flex items-center gap-2">
          <Footprints :size="18" color="var(--move)" />
          <span class="text-ink" style="font-size: 15.5px; font-weight: 700">Sport</span>
        </div>
        <NuxtLink to="/movimento" class="flex items-center gap-1 text-move" style="font-size: 12.5px; font-weight: 600">
          Vedi tutti <ChevronRight :size="14" />
        </NuxtLink>
      </div>

      <div class="rounded-4xl grad-move relative overflow-hidden flex items-center gap-3" style="padding: 14px 16px">
        <EmptyIllustration variant="move" :size="74" class="shrink-0" style="opacity: .95" />
        <div class="min-w-0 flex-1">
          <div class="display tabular flex items-baseline gap-1.5">
            <span style="color: #fff; font-size: 34px; font-weight: 800; line-height: 1">{{ day.moveMin }}</span>
            <span style="color: #fff; font-size: 15px; font-weight: 700; opacity: .9">min</span>
          </div>
          <div style="color: rgba(255,255,255,.85); font-size: 12.5px">obiettivo {{ settings.goals.moveMin }} min</div>
          <div class="flex items-center gap-2" style="margin-top: 9px">
            <div class="flex-1 rounded-full overflow-hidden" style="height: 7px; background: rgba(0,0,0,.18)">
              <div class="fill" style="background: #fff" :style="{ width: `${Math.min(100, p.move)}%` }" />
            </div>
            <span class="tabular rounded-full" style="padding: 2px 8px; font-size: 11px; font-weight: 700;
              background: rgba(5,14,9,.8); color: #fff">{{ Math.round(p.move) }}%</span>
          </div>
        </div>
      </div>

      <NuxtLink to="/movimento" class="tap grad-water rounded-full flex items-center justify-center gap-2 cta-glow-water"
        style="color: #fff; font-size: 14.5px; font-weight: 600; padding: 12px 0; margin-top: 10px">
        <Plus :size="17" /> Aggiungi allenamento
      </NuxtLink>

      <NuxtLink to="/movimento" class="tap rounded-3xl flex items-center gap-3"
        style="padding: 11px 13px; background: var(--raised); margin-top: 10px">
        <div class="rounded-full flex items-center justify-center shrink-0"
          style="width: 32px; height: 32px; background: var(--water-soft)">
          <Lightbulb :size="16" color="var(--water)" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-ink" style="font-size: 12.5px; font-weight: 600; line-height: 1.35">
            L'attività fisica migliora l'umore e la qualità del sonno
          </div>
          <div class="text-faint" style="font-size: 11.5px">e ti aiuta a mantenere l'equilibrio.</div>
        </div>
        <ChevronRight :size="16" class="text-faint" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  GlassWater, Footprints, UtensilsCrossed, Wine, Sprout, ChevronRight, Droplet,
  Camera, Plus, CalendarDays, Lightbulb, Wheat, Dna, Leaf,
} from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";
import { useGlucoseStore } from "~/stores/glucose";
import { classify, RANGE_TONE, RANGE_LABEL, insulinOnBoard, glucoseTrend } from "~/utils/diabetes";
import { lastNDays, keyToDate, fmtIT } from "~/utils/date";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);
const fullDate = fmtIT();

const pct = (v: number, goal: number) => (goal > 0 ? Math.min(100, (v / goal) * 100) : 0);
const p = computed(() => ({
  water: pct(today.value.water, settings.goals.water),
  move: pct(day.moveMin, settings.goals.moveMin),
  food: pct(day.totals.kcal, settings.goals.kcal),
  alcohol: today.value.drinks.length === 0 ? 100 : 0,
}));

/** Percentuale complessiva: media delle quattro voci, ciascuna limitata al 100%. */
const overall = computed(() =>
  Math.round((p.value.water + p.value.move + p.value.food + p.value.alcohol) / 4),
);

/** Un'abitudine è "ben avviata" dal 70% dell'obiettivo in su. */
const onTrack = computed(() => Object.values(p.value).filter((v) => v >= 70).length);
const marks = computed(() => [p.value.water >= 70, p.value.move >= 70, p.value.food >= 70, p.value.alcohol >= 70]);

const message = computed(() => {
  const n = marks.value.filter(Boolean).length;
  if (n >= 4) return "Giornata piena!";
  if (n === 3) return "Stai andando bene!";
  if (n === 2) return "Buon ritmo, continua.";
  if (n === 1) return "Un passo è già partito.";
  return "Si comincia quando vuoi.";
});

const macros = computed(() => [
  { l: "C", v: day.totals.cho, tone: "food" },
  { l: "P", v: day.totals.pro, tone: "water" },
  { l: "G", v: day.totals.fat, tone: "move" },
]);

const macroCells = computed(() => [
  { label: "Carboidrati", value: day.totals.cho, tone: "food", icon: Wheat },
  { label: "Proteine", value: day.totals.pro, tone: "alcohol", icon: Dna },
  { label: "Grassi", value: day.totals.fat, tone: "water", icon: Droplet },
  { label: "Fibre", value: day.totals.fib, tone: "move", icon: Leaf },
]);

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

const glucoseTrendInfo = computed(() => glucoseTrend(glucose.readings));

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

<style scoped>
/* Sul telefono i due riquadri della colonna sono righe normali. */
.side-stack {
  display: contents;
}
.panel {
  background: var(--card);
  border: 1px solid var(--line);
  box-shadow: var(--tile-shadow);
  border-radius: 28px;
  padding: 15px;
}

@media (min-width: 1024px) {
  .side-stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
