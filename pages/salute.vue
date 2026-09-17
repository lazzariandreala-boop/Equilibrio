<template>
  <div class="space-y-3 dash">
    <!-- ── Corpo ── -->
    <div class="panel d6">
      <div class="flex items-center justify-between" style="margin-bottom: 12px">
        <div class="flex items-center gap-2">
          <Scale :size="18" color="var(--water)" />
          <span class="text-ink" style="font-size: 15.5px; font-weight: 700">Corpo</span>
        </div>
        <NuxtLink to="/corpo" class="flex items-center gap-1 text-water" style="font-size: 12.5px; font-weight: 600">
          Vedi tutto <ChevronRight :size="14" />
        </NuxtLink>
      </div>

      <div v-if="weight" class="rounded-4xl grad-water relative overflow-hidden" style="padding: 14px 16px">
        <div class="flex items-center gap-3">
          <div class="min-w-0 flex-1">
            <div class="display tabular flex items-baseline gap-1.5">
              <span style="color: #fff; font-size: 34px; font-weight: 800; line-height: 1">{{ weight.last.toFixed(1) }}</span>
              <span style="color: #fff; font-size: 15px; font-weight: 700; opacity: .9">kg</span>
            </div>
            <div v-if="weight.delta !== null" style="color: rgba(255,255,255,.9); font-size: 12.5px">
              {{ weight.delta > 0 ? "+" : "" }}{{ weight.delta.toFixed(1) }} kg negli ultimi 90 giorni
            </div>
          </div>
          <TrendChart v-if="weightPoints.length > 1" :points="weightPoints" tone="water" :height="52"
            style="width: 46%" />
        </div>
      </div>

      <div v-else class="rounded-4xl text-center" style="padding: 20px 14px; background: var(--raised)">
        <Scale :size="26" color="var(--faint)" style="margin: 0 auto" />
        <p class="text-dim" style="font-size: 13px; margin-top: 8px; line-height: 1.4">
          {{ bodyMessage }}
        </p>
      </div>

      <div v-if="bodyCells.length" class="grid grid-cols-3 gap-2" style="margin-top: 10px">
        <div v-for="c in bodyCells" :key="c.label" class="rounded-3xl flex items-center gap-2"
          style="padding: 8px 9px; background: var(--raised)">
          <div class="rounded-full flex items-center justify-center shrink-0" style="width: 26px; height: 26px"
            :style="{ background: `var(--${c.tone}-soft)` }">
            <component :is="c.icon" :size="13" :color="`var(--${c.tone})`" />
          </div>
          <div class="min-w-0">
            <div class="display tabular text-ink" style="font-size: 13.5px; font-weight: 700; line-height: 1.1">
              {{ c.value }}
            </div>
            <div class="text-faint truncate" style="font-size: 10px">{{ c.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Glicemia ── -->
    <div v-if="settings.profile.diabetes" class="panel d6">
      <div class="flex items-center justify-between" style="margin-bottom: 12px">
        <div class="flex items-center gap-2">
          <Droplet :size="18" :color="`var(--${glucoseTone})`" />
          <span class="text-ink" style="font-size: 15.5px; font-weight: 700">Glicemia</span>
        </div>
        <NuxtLink to="/glicemia" class="flex items-center gap-1" :style="{ color: `var(--${glucoseTone})`, fontSize: '12.5px', fontWeight: 600 }">
          Vedi tutto <ChevronRight :size="14" />
        </NuxtLink>
      </div>

      <div v-if="lastReading" class="rounded-4xl relative overflow-hidden" :class="`grad-${glucoseTone}`"
        style="padding: 14px 16px">
        <div class="display tabular flex items-baseline gap-1.5">
          <span style="color: #fff; font-size: 34px; font-weight: 800; line-height: 1">{{ lastReading.value }}</span>
          <span style="color: #fff; font-size: 15px; font-weight: 700; opacity: .9">mg/dL</span>
          <span v-if="trend.kind !== 'sconosciuta'" class="display"
            style="color: #fff; font-size: 26px; font-weight: 800">{{ trend.arrow }}</span>
        </div>
        <div style="color: rgba(255,255,255,.88); font-size: 12.5px">
          {{ RANGE_LABEL[classify(lastReading.value, settings.diabetes)] }} · {{ lastReading.tag }}
        </div>
      </div>

      <div v-else class="rounded-4xl text-center" style="padding: 20px 14px; background: var(--raised)">
        <Droplet :size="26" color="var(--faint)" style="margin: 0 auto" />
        <p class="text-dim" style="font-size: 13px; margin-top: 8px">Nessuna misurazione registrata.</p>
      </div>

      <template v-if="glucoseStats.count">
        <div class="flex rounded-full overflow-hidden" style="height: 12px; margin-top: 10px">
          <div :style="{ width: `${glucoseStats.below}%`, background: 'var(--food)' }" />
          <div :style="{ width: `${glucoseStats.inRange}%`, background: 'var(--move)' }" />
          <div :style="{ width: `${glucoseStats.above}%`, background: 'var(--alcohol)' }" />
        </div>
        <div class="grid grid-cols-3 gap-2" style="margin-top: 10px">
          <div v-for="c in glucoseCells" :key="c.label" class="rounded-3xl text-center"
            style="padding: 8px 4px; background: var(--raised)">
            <div class="display tabular" :style="{ color: c.color, fontSize: '15px', fontWeight: 800 }">{{ c.value }}</div>
            <div class="text-faint" style="font-size: 10px">{{ c.label }}</div>
          </div>
        </div>
      </template>

      <NuxtLink to="/glicemia" class="tap grad-water rounded-full flex items-center justify-center gap-2 cta-glow-water"
        style="color: #fff; font-size: 14.5px; font-weight: 600; padding: 12px 0; margin-top: 10px">
        <Plus :size="17" /> Registra una misurazione
      </NuxtLink>
    </div>

    <!-- ── Gravidanza (sostituisce il ciclo quando attiva) ── -->
    <div v-if="settings.profile.pregnant" class="panel d6">
      <div class="flex items-center justify-between" style="margin-bottom: 12px">
        <div class="flex items-center gap-2">
          <Baby :size="18" color="var(--alcohol)" />
          <span class="text-ink" style="font-size: 15.5px; font-weight: 700">Gravidanza</span>
        </div>
        <NuxtLink to="/gravidanza" class="flex items-center gap-1 text-alcohol" style="font-size: 12.5px; font-weight: 600">
          Vedi tutto <ChevronRight :size="14" />
        </NuxtLink>
      </div>

      <div v-if="preg.configured" class="rounded-4xl grad-alcohol relative overflow-hidden" style="padding: 14px 16px">
        <div class="display" style="color: #fff; font-size: 30px; font-weight: 800; line-height: 1.05">
          {{ pregInfo.weeks }}ª settimana
        </div>
        <div style="color: rgba(255,255,255,.88); font-size: 12.5px">
          {{ TRIMESTER_LABEL[pregInfo.trimester] }} · {{ pregInfo.daysToDue }} giorni al termine
        </div>
        <div class="rounded-full overflow-hidden" style="height: 7px; background: rgba(0,0,0,.18); margin-top: 10px">
          <div class="fill" style="background: #fff" :style="{ width: `${pregInfo.progress}%` }" />
        </div>
      </div>
      <div v-else class="rounded-4xl text-center" style="padding: 20px 14px; background: var(--raised)">
        <p class="text-dim" style="font-size: 13px">Imposta la data di inizio per vedere la settimana.</p>
      </div>

      <div v-if="nextAppointment" class="rounded-3xl flex items-center gap-3"
        style="padding: 11px 13px; background: var(--raised); margin-top: 10px">
        <Stethoscope :size="16" color="var(--alcohol)" class="shrink-0" />
        <div class="min-w-0 flex-1">
          <div class="text-ink truncate" style="font-size: 13px; font-weight: 600">{{ nextAppointment.title }}</div>
          <div class="text-faint" style="font-size: 11.5px">{{ fmtDay(nextAppointment.date) }}</div>
        </div>
      </div>
    </div>

    <!-- ── Ciclo ── -->
    <div v-else-if="settings.profile.cycleTracking" class="panel d6">
      <div class="flex items-center justify-between" style="margin-bottom: 12px">
        <div class="flex items-center gap-2">
          <CalendarHeart :size="18" color="var(--alcohol)" />
          <span class="text-ink" style="font-size: 15.5px; font-weight: 700">Ciclo</span>
        </div>
        <NuxtLink to="/ciclo" class="flex items-center gap-1 text-alcohol" style="font-size: 12.5px; font-weight: 600">
          Vedi tutto <ChevronRight :size="14" />
        </NuxtLink>
      </div>

      <div class="rounded-4xl relative overflow-hidden" :class="`grad-${cycleView.tone}`" style="padding: 14px 16px">
        <div class="display" style="color: #fff; font-size: 30px; font-weight: 800; line-height: 1.05">
          {{ cycleView.headline }}
        </div>
        <div style="color: rgba(255,255,255,.88); font-size: 12.5px">{{ cycleView.label }}</div>
        <div class="flex gap-1 justify-start" style="margin-top: 10px">
          <span v-for="(clean, i) in cycleDots" :key="i" class="rounded-full"
            :style="{ width: '7px', height: '20px', background: clean ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.26)' }" />
        </div>
      </div>

      <NuxtLink to="/ciclo" class="tap grad-alcohol rounded-full flex items-center justify-center gap-2 cta-glow-alcohol"
        style="color: #fff; font-size: 14.5px; font-weight: 600; padding: 12px 0; margin-top: 10px">
        <Plus :size="17" /> Registra un ciclo
      </NuxtLink>
    </div>

    <!-- ── Storico ── -->
    <div class="panel d12">
      <div class="flex items-center justify-between" style="margin-bottom: 12px">
        <div class="flex items-center gap-2">
          <CalendarDays :size="18" color="var(--food)" />
          <span class="text-ink" style="font-size: 15.5px; font-weight: 700">Ultimi sette giorni</span>
        </div>
        <NuxtLink to="/storico" class="flex items-center gap-1 text-food" style="font-size: 12.5px; font-weight: 600">
          Vedi tutto <ChevronRight :size="14" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-4 gap-2.5">
        <div v-for="st in weekCells" :key="st.label" class="rounded-4xl" style="padding: 12px 13px"
          :style="{ background: `linear-gradient(155deg, var(--${st.tone}-soft), var(--card) 82%)`,
                    border: `1px solid var(--${st.tone}-soft)` }">
          <div class="rounded-full flex items-center justify-center" style="width: 32px; height: 32px"
            :style="{ background: `var(--${st.tone}-soft)` }">
            <component :is="st.icon" :size="16" :color="`var(--${st.tone})`" />
          </div>
          <div class="display tabular" :style="{ color: `var(--${st.tone})`, fontSize: '22px', fontWeight: 800, marginTop: '8px' }">
            {{ st.value }}<span class="text-dim" style="font-size: 12px; font-weight: 600"> {{ st.unit }}</span>
          </div>
          <div class="text-dim" style="font-size: 11.5px">{{ st.label }}</div>
        </div>
      </div>

      <div class="space-y-2" style="margin-top: 12px">
        <button v-for="k in recentDays" :key="k" class="tap w-full text-left rounded-3xl flex items-center gap-3"
          style="padding: 10px 13px; background: var(--raised)" @click="openDay(k)">
          <span class="rounded-full shrink-0" style="width: 8px; height: 8px"
            :style="{ background: day.summaryOf(k).alcGrams > 0 ? 'var(--alcohol)'
              : day.summaryOf(k).hasData ? 'var(--move)' : 'var(--line)' }" />
          <span class="text-ink" style="font-size: 13.5px; font-weight: 600; text-transform: capitalize; min-width: 110px">
            {{ fmtShort(k) }}
          </span>
          <span v-if="day.summaryOf(k).hasData" class="text-dim tabular flex-1" style="font-size: 12.5px">
            {{ day.summaryOf(k).water }} ml · {{ day.summaryOf(k).kcal }} kcal ·
            {{ day.summaryOf(k).moveMin }} min · {{ day.summaryOf(k).alcGrams }} g
          </span>
          <span v-else class="text-faint flex-1" style="font-size: 12.5px">nessun dato</span>
          <ChevronRight :size="16" class="text-faint shrink-0" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Scale, Droplet, ChevronRight, Plus, CalendarDays, CalendarHeart, Baby, Stethoscope,
  Flame, Dumbbell, Droplets, GlassWater, UtensilsCrossed, Footprints, Wine,
} from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";
import { useGlucoseStore } from "~/stores/glucose";
import { useCycleStore } from "~/stores/cycle";
import { usePregnancyStore } from "~/stores/pregnancy";
import { classify, RANGE_TONE, RANGE_LABEL, rangeStats, glucoseTrend } from "~/utils/diabetes";
import { pregnancyInfo, TRIMESTER_LABEL } from "~/utils/pregnancyDates";
import { lastNDays, fmtShort, keyToDate } from "~/utils/date";

const day = useDayStore();
const settings = useSettingsStore();
const glucose = useGlucoseStore();
const cycle = useCycleStore();
const preg = usePregnancyStore();

const { status } = useWithings();
const base = useRuntimeConfig().public.apiBase || "";

// ── corpo ──
const body = ref<any>(null);
const bodyMessage = ref("Collega Withings dal Profilo per vedere qui peso e composizione corporea.");

const weight = computed(() => {
  const w = body.value?.summary?.weight;
  return w?.last != null ? w : null;
});
const weightPoints = computed(() => body.value?.series?.weight ?? []);

const bodyCells = computed(() => {
  const s = body.value?.summary ?? {};
  const out: any[] = [];
  if (s.visceralFat?.last != null)
    out.push({ label: "Viscerale", value: s.visceralFat.last.toFixed(0), tone: "food", icon: Flame });
  if (s.muscleMass?.last != null)
    out.push({ label: "Muscoli", value: `${s.muscleMass.last.toFixed(1)} kg`, tone: "move", icon: Dumbbell });
  if (s.hydration?.last != null)
    out.push({ label: "Acqua", value: `${s.hydration.last.toFixed(1)} kg`, tone: "water", icon: Droplets });
  return out.slice(0, 3);
});

onMounted(async () => {
  try {
    const st: any = await status();
    if (!st.connected) {
      bodyMessage.value = /scaduta/i.test(st.reason || "")
        ? "Sessione Withings scaduta: ricollegala dal Profilo."
        : "Collega Withings dal Profilo per vedere qui peso e composizione corporea.";
      return;
    }
    body.value = await $fetch(`${base}/api/withings/history`, {
      params: { days: 90 },
      credentials: "include",
    });
  } catch {
    bodyMessage.value = "Non sono riuscito a leggere le misure.";
  }
});

// ── glicemia ──
const lastReading = computed(() => glucose.lastReading);
const glucoseTone = computed(() =>
  lastReading.value ? RANGE_TONE[classify(lastReading.value.value, settings.diabetes)] : "water",
);
const trend = computed(() => glucoseTrend(glucose.readings));
const glucoseStats = computed(() => rangeStats(glucose.valuesSince(7), settings.diabetes));
const glucoseCells = computed(() => [
  { value: `${glucoseStats.value.inRange}%`, label: "nell'obiettivo", color: "var(--move)" },
  { value: String(glucoseStats.value.average), label: "media", color: "var(--ink)" },
  { value: `${glucoseStats.value.gmi}%`, label: "glicata", color: "var(--ink)" },
]);

// ── gravidanza ──
const pregInfo = computed(() => pregnancyInfo(preg.reference || new Date().toISOString().slice(0, 10)));
const nextAppointment = computed(() => preg.upcoming[0] ?? null);

// ── ciclo ──
const cycleDots = computed(() =>
  lastNDays(10, keyToDate(day.date)).reverse().map((k) => day.summaryOf(k).alcGrams >= 0 && !cycleDay(k)),
);
function cycleDay(key: string) {
  return cycle.entries.some((e) => {
    if (!e.end) return e.start === key;
    return key >= e.start && key <= e.end;
  });
}

const cycleView = computed(() => {
  const s = cycle.status;
  if (s.kind === "nessun-dato") return { tone: "alcohol", headline: "Inizia", label: "registra il primo ciclo" };
  if (s.kind === "in-corso") return { tone: "alcohol", headline: `Giorno ${s.days}`, label: "ciclo in corso" };
  if (s.kind === "in-ritardo")
    return { tone: "food", headline: `+${s.days} giorni`, label: "oltre la previsione" };
  if (s.kind === "in-arrivo")
    return { tone: "alcohol", headline: s.days === 0 ? "Oggi" : `Fra ${s.days} giorni`, label: "arrivo previsto" };
  return { tone: "move", headline: `Fra ${s.days} giorni`, label: "al prossimo ciclo" };
});

// ── storico ──
const weekKeys = computed(() => lastNDays(7));
const recentDays = computed(() => weekKeys.value.slice(0, 4));

const weekAgg = computed(() => {
  const list = weekKeys.value.map((k) => day.summaryOf(k));
  const active = list.filter((s) => s.hasData);
  const n = active.length || 1;
  return {
    water: Math.round(list.reduce((a, s) => a + s.water, 0) / n),
    kcal: Math.round(list.reduce((a, s) => a + s.kcal, 0) / n),
    move: list.reduce((a, s) => a + s.moveMin, 0),
    sober: active.filter((s) => s.alcGrams === 0).length,
    days: active.length,
  };
});

const weekCells = computed(() => [
  { tone: "water", icon: GlassWater, value: weekAgg.value.water, unit: "ml", label: "acqua al giorno" },
  { tone: "food", icon: UtensilsCrossed, value: weekAgg.value.kcal, unit: "kcal", label: "calorie al giorno" },
  { tone: "move", icon: Footprints, value: weekAgg.value.move, unit: "min", label: "movimento totale" },
  {
    tone: "alcohol", icon: Wine,
    value: `${weekAgg.value.sober}/${weekAgg.value.days || 7}`, unit: "",
    label: "giorni senza alcol",
  },
]);

function openDay(k: string) {
  day.setDate(k);
  navigateTo("/");
}

function fmtDay(key: string) {
  const d = keyToDate(key);
  return d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
}
</script>

<style scoped>
.panel {
  background: var(--card);
  border: 1px solid var(--line);
  box-shadow: var(--tile-shadow);
  border-radius: 28px;
  padding: 15px;
}
</style>
