<template>
  <div class="space-y-3">
    <!-- Ultima misurazione -->
    <div v-if="last" class="rise rounded-5xl relative overflow-hidden" :class="`grad-${lastTone}`"
      :style="{ boxShadow: `0 12px 30px -10px var(--${lastTone}-glow)` }">
      <div class="absolute rounded-full pointer-events-none"
        style="width: 150px; height: 150px; right: -52px; top: -58px; background: rgba(255,255,255,.14)" />

      <div class="relative flex items-center gap-4" style="padding: 14px 16px">
        <div class="min-w-0">
          <div class="display tabular flex items-baseline gap-1">
            <span style="color: #fff; font-size: 44px; font-weight: 800; line-height: 1">{{ last.value }}</span>
            <span v-if="trend.kind !== 'sconosciuta'" class="display"
              style="color: #fff; font-size: 30px; font-weight: 800; line-height: 1">{{ trend.arrow }}</span>
          </div>
          <div style="color: rgba(255,255,255,.88); font-size: 12.5px; margin-top: 2px">
            mg/dL · {{ RANGE_LABEL[classify(last.value, params)] }}
          </div>
          <div style="color: rgba(255,255,255,.72); font-size: 11.5px">{{ last.tag }} · {{ ago(last.at) }}</div>
        </div>

        <div class="ml-auto text-right shrink-0">
          <div class="display tabular" style="color: #fff; font-size: 16px; font-weight: 700">{{ iob }} U</div>
          <div style="color: rgba(255,255,255,.75); font-size: 10.5px">attive</div>
          <div class="display tabular" style="color: #fff; font-size: 16px; font-weight: 700; margin-top: 6px">
            {{ todayUnits }} U
          </div>
          <div style="color: rgba(255,255,255,.75); font-size: 10.5px">oggi</div>
        </div>
      </div>

      <!-- Il consiglio sta dentro l'intestazione: prima occupava una card a sé -->
      <div v-if="lowOrHigh" class="relative" style="padding: 10px 16px 12px; background: rgba(0,0,0,.18)">
        <p style="color: rgba(255,255,255,.92); font-size: 12px; line-height: 1.4">{{ adviceText }}</p>
      </div>
    </div>

    <EmptyState v-else tone="water" title="Nessuna misurazione"
      subtitle="Registra la prima glicemia: da lì l'app calcola tempo nell'obiettivo, media e boli suggeriti." />

    <div class="flex gap-2.5 rise" style="animation-delay: 70ms">
      <button class="tap flex-1 rounded-full py-3.5 font-semibold flex items-center justify-center gap-2 grad-water cta-glow-water"
        style="color: #fff; font-size: 15px" @click="openReading()">
        <Plus :size="18" /> Glicemia
      </button>
      <button class="tap flex-1 rounded-full py-3.5 font-semibold flex items-center justify-center gap-2 grad-move cta-glow-move"
        style="color: #fff; font-size: 15px" @click="openBolus()">
        <Syringe :size="18" /> Bolo
      </button>
    </div>

    <!-- Statistiche -->
    <div v-if="glucose.readings.length" class="rise" style="animation-delay: 110ms">
      <div class="flex gap-1.5 p-1.5 rounded-3xl mb-2.5" style="background: var(--raised)">
        <button v-for="pr in periods" :key="pr.days" class="tap flex-1 py-2 rounded-2xl font-semibold"
          style="font-size: 12.5px"
          :style="period === pr.days
            ? { background: 'var(--card)', color: 'var(--ink)', boxShadow: 'var(--shadow)' }
            : { color: 'var(--dim)' }"
          @click="period = pr.days">
          {{ pr.label }}
        </button>
      </div>

      <div class="rounded-4xl" style="padding: 14px"
        :style="{ background: 'var(--card)', border: '1px solid var(--line)', boxShadow: 'var(--tile-shadow)' }">
        <p v-if="!stats.count" class="text-faint text-center" style="font-size: 13px; padding: 14px 8px">
          Nessuna misurazione in questo periodo.
        </p>

        <template v-else>
        <!-- barra del tempo nell'obiettivo -->
        <div class="flex rounded-full overflow-hidden" style="height: 14px">
          <div :style="{ width: `${stats.below}%`, background: 'var(--food)' }" />
          <div :style="{ width: `${stats.inRange}%`, background: 'var(--move)' }" />
          <div :style="{ width: `${stats.above}%`, background: 'var(--alcohol)' }" />
        </div>

        <!-- Una riga sola: le sei voci stavano su due blocchi separati -->
        <div class="flex flex-wrap" style="margin-top: 10px; gap: 4px 0">
          <div v-for="st in statCells" :key="st.label" style="flex: 0 0 33.333%">
            <div class="display tabular" :style="{ color: st.color, fontSize: '18px', fontWeight: 800 }">
              {{ st.value }}
            </div>
            <div class="text-dim" style="font-size: 10.5px">{{ st.label }}</div>
          </div>
        </div>

        </template>

        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line)">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-ink" style="font-size: 13px; font-weight: 600">Andamento</span>
            <span class="text-faint" style="font-size: 11px">
              {{ period > 7 ? "media giornaliera" : "ogni misurazione" }}
            </span>
          </div>
          <GlucoseChart :readings="glucose.readings" :params="params" :days="period" :height="110" />
        </div>
      </div>
    </div>

    <!-- Registro -->
    <div v-if="timeline.length" class="rise" style="animation-delay: 150ms">
      <Expandable title="Registro" :icon="ListOrdered" tone="water" :subtitle="`${timeline.length} voci recenti`">
        <div class="space-y-2">
          <div v-for="e in timeline" :key="e.key" class="rounded-3xl flex items-center gap-3"
            style="padding: 11px 13px; background: var(--raised)">
            <div class="rounded-full flex items-center justify-center shrink-0" style="width: 36px; height: 36px"
              :style="{ background: e.kind === 'glicemia' ? `var(--${e.tone}-soft)` : 'var(--move-soft)' }">
              <Droplet v-if="e.kind === 'glicemia'" :size="17" :color="`var(--${e.tone})`" />
              <Syringe v-else :size="17" color="var(--move)" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-ink" style="font-size: 14.5px; font-weight: 600">{{ e.title }}</div>
              <div class="text-dim truncate" style="font-size: 12.5px">{{ e.subtitle }}</div>
            </div>
            <button class="tap text-faint p-1.5 rounded-xl shrink-0" aria-label="Elimina" @click="removeEntry(e)">
              <Trash2 :size="15" />
            </button>
          </div>
        </div>
      </Expandable>
    </div>

    <!-- Scheda glicemia -->
    <BottomSheet v-model="readingOpen" title="Misura glicemia">
      <div class="space-y-2.5">
        <!-- valore e andamento stanno insieme: si compilano di seguito -->
        <div class="rounded-4xl" style="padding: 11px 13px" :style="{ background: 'var(--raised)' }">
          <div class="text-faint text-center" style="font-size: 11.5px; letter-spacing: .4px; text-transform: uppercase">
            Valore glicemico (mg/dL)
          </div>
          <input v-model.number="rf.value" type="number" inputmode="numeric"
            class="bg-transparent text-ink w-full text-center display tabular"
            style="font-size: 42px; font-weight: 800; border: none; outline: none; padding: 2px 0" placeholder="—" />

          <div style="border-top: 1px solid var(--line); padding-top: 9px">
            <div class="text-faint" style="font-size: 11.5px; letter-spacing: .4px; text-transform: uppercase">
              Sta salendo o scendendo?
            </div>
            <div class="grid grid-cols-5 gap-1.5" style="margin-top: 8px">
              <button v-for="t in TREND_OPTIONS" :key="t.key" class="tap rounded-2xl flex items-center justify-center"
                style="padding: 9px 0"
                :style="rf.trend === t.key
                  ? { background: `var(--${TREND_TONE[t.key]}-soft)`, border: `1.5px solid var(--${TREND_TONE[t.key]})` }
                  : { background: 'var(--card)', border: '1px solid var(--line)' }"
                :aria-label="t.label"
                @click="rf.trend = rf.trend === t.key ? undefined : t.key">
                <span class="display" :style="{
                  fontSize: '20px', fontWeight: 800,
                  color: rf.trend === t.key ? `var(--${TREND_TONE[t.key]})` : 'var(--dim)',
                }">{{ t.arrow }}</span>
              </button>
            </div>
            <div v-if="rf.trend" class="text-dim text-center" style="font-size: 12px; margin-top: 6px">
              {{ TREND_OPTIONS.find((t) => t.key === rf.trend)?.label }}
            </div>
          </div>
        </div>

        <!-- fuori intervallo: la correzione si apre da qui, senza cercarla -->
        <div v-if="rf.value > 0 && classify(rf.value, params) !== 'in-range'" class="rounded-3xl flex items-center gap-3"
          style="padding: 12px 13px"
          :style="{ background: `var(--${RANGE_TONE[classify(rf.value, params)]}-soft)`,
                    border: `1px solid var(--${RANGE_TONE[classify(rf.value, params)]})` }">
          <div class="min-w-0 flex-1">
            <div class="text-ink" style="font-size: 14px; font-weight: 700">
              {{ RANGE_LABEL[classify(rf.value, params)] }}
            </div>
            <div class="text-dim" style="font-size: 12.5px">
              obiettivo {{ params.targetMin }}–{{ params.targetMax }} mg/dL
            </div>
          </div>
          <button class="tap rounded-2xl px-3.5 py-2 font-semibold shrink-0"
            :style="{ background: `var(--${RANGE_TONE[classify(rf.value, params)]})`, color: '#fff', fontSize: '13px' }"
            @click="saveAndCorrect">
            {{ classify(rf.value, params) === "bassa" || classify(rf.value, params) === "molto-bassa"
              ? "Risali" : "Correggi" }} →
          </button>
        </div>

        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Quando</div>
          <!-- Una riga scorrevole: a capo occupavano tre righe intere -->
          <div class="flex gap-2 overflow-x-auto" style="scrollbar-width: none; padding-bottom: 2px">
            <button v-for="t in READING_TAGS" :key="t" class="tap rounded-full shrink-0"
              style="padding: 7px 12px; font-size: 13px; white-space: nowrap"
              :style="rf.tag === t
                ? { background: 'var(--water)', color: '#fff', fontWeight: 600 }
                : { background: 'var(--raised)', color: 'var(--dim)' }"
              @click="rf.tag = t">
              {{ t }}
            </button>
          </div>
        </div>

        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Stato d'animo</div>
          <div class="grid grid-cols-5 gap-1.5">
            <button v-for="m in MOODS" :key="m.key" class="tap rounded-2xl flex flex-col items-center gap-0.5"
              style="padding: 7px 2px"
              :style="rf.mood === m.key
                ? { background: 'var(--food-soft)', border: '1.5px solid var(--food)' }
                : { background: 'var(--raised)', border: '1px solid transparent' }"
              @click="rf.mood = rf.mood === m.key ? undefined : m.key">
              <span style="font-size: 19px">{{ m.emoji }}</span>
              <span class="text-dim" style="font-size: 9.5px">{{ m.label }}</span>
            </button>
          </div>
        </div>

        <button class="tap w-full rounded-3xl flex items-center gap-3" style="padding: 9px 13px; background: var(--raised)"
          @click="rf.sport = !rf.sport">
          <Activity :size="18" :color="rf.sport ? 'var(--move)' : 'var(--dim)'" />
          <span class="text-ink flex-1 text-left" style="font-size: 14px; font-weight: 600">Attività fisica oggi</span>
          <Toggle :on="!!rf.sport" tone="move" />
        </button>

        <input v-model="rf.notes" class="bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full"
          style="font-size: 14px" placeholder="Note (facoltative)" />

        <div>
          <div class="flex gap-2">
            <input v-model="rf.date" type="date" class="bg-card border border-line text-ink rounded-2xl px-3 py-2.5"
              style="flex: 1.3; min-width: 0" />
            <input v-model="rf.time" type="time" class="bg-card border border-line text-ink rounded-2xl px-3 py-2.5 tabular"
              style="flex: 1; min-width: 0" />
            <button class="tap rounded-2xl px-3 font-semibold bg-raised text-dim shrink-0" style="font-size: 12.5px"
              @click="setNow">
              Adesso
            </button>
          </div>
        </div>

        <button class="tap w-full py-3 rounded-3xl font-semibold grad-water" style="color: #fff; font-size: 15px"
          :disabled="!(rf.value > 0)" :style="!(rf.value > 0) ? { opacity: 0.5 } : {}" @click="saveReading()">
          Salva
        </button>
      </div>
    </BottomSheet>

    <!-- Scheda bolo -->
    <BottomSheet v-model="bolusOpen" title="Calcolo del bolo">
      <BolusCalculator :initial-glucose="last?.value ?? null" @save="saveBolus" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { Droplet, Syringe, Plus, Trash2, AlertTriangle, ListOrdered, Activity } from "lucide-vue-next";
import { useGlucoseStore } from "~/stores/glucose";
import { useSettingsStore } from "~/stores/settings";
import {
  classify, RANGE_TONE, RANGE_LABEL, READING_TAGS, rangeStats, insulinOnBoard, targetMid,
  glucoseTrend, TREND_OPTIONS, TREND_TONE, MOODS,
  type ReadingTag, type TrendKind, type MoodKey,
} from "~/utils/diabetes";

const glucose = useGlucoseStore();
const settings = useSettingsStore();
const params = computed(() => settings.diabetes);

const last = computed(() => glucose.lastReading);
const lastTone = computed(() => (last.value ? RANGE_TONE[classify(last.value.value, params.value)] : "water"));
const lowOrHigh = computed(() => {
  if (!last.value) return false;
  const k = classify(last.value.value, params.value);
  return k !== "in-range";
});

const adviceTitle = computed(() => {
  if (!last.value) return "";
  const k = classify(last.value.value, params.value);
  if (k === "molto-bassa" || k === "bassa") return "Glicemia sotto l'obiettivo";
  return k === "molto-alta" ? "Glicemia molto alta" : "Glicemia sopra l'obiettivo";
});

const adviceText = computed(() => {
  if (!last.value) return "";
  const v = last.value.value;
  const p = params.value;
  const k = classify(v, p);

  if (k === "molto-bassa" || k === "bassa") {
    const grams = Math.ceil(((targetMid(p) - v) * p.icr) / p.isf);
    return `Servono circa ${grams} g di zuccheri a rapido assorbimento (un succo piccolo, tre bustine di zucchero). Ricontrolla dopo 15 minuti e ripeti se serve.`;
  }
  const corr = Math.round(((v - targetMid(p)) / p.isf) * 10) / 10;
  const base = `La correzione stimata sarebbe di ${corr} unità, al netto dell'insulina già attiva.`;
  return k === "molto-alta" ? `${base} Con valori così alti può valere la pena controllare i chetoni.` : base;
});

// La tendenza usa solo le ultime due misurazioni, se abbastanza ravvicinate.
/**
 * Andamento mostrato: vale quello indicato al momento della misurazione;
 * in mancanza si prova a dedurlo dalle ultime due letture ravvicinate.
 */
const trend = computed(() => {
  const manual = last.value?.trend;
  if (manual) {
    const o = TREND_OPTIONS.find((t) => t.key === manual)!;
    return { kind: manual, arrow: o.arrow, label: o.label, delta: 0, minutes: 0 };
  }
  return glucoseTrend(glucose.readings);
});

const iob = computed(() => insulinOnBoard(glucose.recentBoluses(params.value.duration), params.value));

const todayStart = computed(() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
});
const todayUnits = computed(() =>
  Math.round(glucose.boluses.filter((b) => b.at >= todayStart.value).reduce((a, b) => a + b.units, 0) * 10) / 10,
);
const todayReadings = computed(() => glucose.readings.filter((r) => r.at >= todayStart.value).length);

// ── statistiche ──
const periods = [
  { days: 1, label: "Oggi" },
  { days: 7, label: "7 giorni" },
  { days: 30, label: "Mese" },
  { days: 90, label: "3 mesi" },
];
const period = ref(7);
const stats = computed(() => rangeStats(valuesInPeriod.value, params.value));

/** La vista "Oggi" parte da mezzanotte, le altre coprono N giorni indietro. */
const valuesInPeriod = computed(() => {
  if (period.value === 1) {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    return glucose.readings.filter((r) => r.at >= midnight.getTime()).map((r) => r.value);
  }
  return glucose.valuesSince(period.value);
});
// ── registro unificato ──
const statCells = computed(() => [
  { value: `${stats.value.inRange}%`, label: "nell'obiettivo", color: "var(--move)" },
  { value: `${stats.value.below}%`, label: "sotto", color: "var(--food)" },
  { value: `${stats.value.above}%`, label: "sopra", color: "var(--alcohol)" },
  { value: String(stats.value.average), label: "media mg/dL", color: "var(--ink)" },
  { value: `${stats.value.gmi}%`, label: "glicata stimata", color: "var(--ink)" },
  { value: String(stats.value.count), label: "misurazioni", color: "var(--ink)" },
]);

const timeline = computed(() => {
  const r = glucose.sortedReadings.slice(0, 40).map((x) => ({
    key: `r${x.id}`,
    id: x.id,
    kind: "glicemia" as const,
    at: x.at,
    tone: RANGE_TONE[classify(x.value, params.value)],
    title: `${x.value} mg/dL${x.trend ? ` ${TREND_OPTIONS.find((t) => t.key === x.trend)?.arrow ?? ""}` : ""}`,
    subtitle: [
      x.tag,
      x.mood ? MOODS.find((m) => m.key === x.mood)?.emoji : null,
      x.sport ? "attività" : null,
      ago(x.at),
      x.notes || null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));
  const b = glucose.sortedBoluses.slice(0, 40).map((x) => ({
    key: `b${x.id}`,
    id: x.id,
    kind: "bolo" as const,
    at: x.at,
    tone: "move",
    title: `${x.units} unità · ${x.kind}`,
    subtitle: [x.carbs ? `${x.carbs} g` : null, x.glucose ? `da ${x.glucose} mg/dL` : null, ago(x.at)]
      .filter(Boolean)
      .join(" · "),
  }));
  return [...r, ...b].sort((x, y) => y.at - x.at).slice(0, 50);
});

function removeEntry(e: { kind: string; id: string }) {
  if (e.kind === "glicemia") glucose.removeReading(e.id);
  else glucose.removeBolus(e.id);
}

// ── inserimento ──
const readingOpen = ref(false);
const rf = reactive({
  value: 0,
  tag: "prima del pasto" as ReadingTag,
  notes: "",
  trend: undefined as TrendKind | undefined,
  mood: undefined as MoodKey | undefined,
  sport: false,
  date: "",
  time: "",
});

/** Data e ora in formato separato, per i due campi della scheda. */
function splitNow(at = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`,
    time: `${pad(at.getHours())}:${pad(at.getMinutes())}`,
  };
}
function setNow() {
  Object.assign(rf, splitNow());
}

function openReading() {
  Object.assign(rf, {
    value: 0, tag: "prima del pasto", notes: "",
    trend: undefined, mood: undefined, sport: false,
    ...splitNow(),
  });
  readingOpen.value = true;
}

/** Istante scelto nella scheda, o adesso se i campi sono incompleti. */
function chosenAt() {
  if (!rf.date || !rf.time) return Date.now();
  const t = new Date(`${rf.date}T${rf.time}`).getTime();
  return Number.isFinite(t) ? t : Date.now();
}

function saveReading(): boolean {
  if (!(rf.value > 0)) return false;
  glucose.addReading({
    at: chosenAt(),
    value: rf.value,
    tag: rf.tag,
    notes: rf.notes.trim() || undefined,
    trend: rf.trend,
    mood: rf.mood,
    sport: rf.sport || undefined,
  });
  readingOpen.value = false;
  return true;
}

/** Salva e apre subito il calcolo, senza doverlo cercare. */
function saveAndCorrect() {
  if (saveReading()) bolusOpen.value = true;
}

const bolusOpen = ref(false);
function openBolus() {
  bolusOpen.value = true;
}
function saveBolus(data: any) {
  glucose.addBolus(data);
  bolusOpen.value = false;
}

function ago(at: number) {
  const mins = Math.round((Date.now() - at) / 60000);
  if (mins < 1) return "adesso";
  if (mins < 60) return `${mins} min fa`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} ${h === 1 ? "ora" : "ore"} fa`;
  const d = Math.round(h / 24);
  return `${d} ${d === 1 ? "giorno" : "giorni"} fa`;
}
</script>
