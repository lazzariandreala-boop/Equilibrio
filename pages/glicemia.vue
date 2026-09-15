<template>
  <div class="space-y-3">
    <!-- Ultima misurazione -->
    <div v-if="last" class="rise rounded-5xl relative overflow-hidden" :class="`grad-${lastTone}`"
      :style="{ boxShadow: `0 14px 34px -10px var(--${lastTone}-glow)` }">
      <div class="absolute rounded-full pointer-events-none"
        style="width: 170px; height: 170px; right: -58px; top: -66px; background: rgba(255,255,255,.14)" />
      <div class="relative" style="padding: 18px">
        <div class="flex items-center gap-2">
          <Droplet :size="18" color="#fff" />
          <span style="color: #fff; font-size: 14px; font-weight: 700">Ultima misurazione</span>
        </div>

        <div class="text-center" style="margin-top: 10px">
          <div class="display tabular flex items-baseline justify-center gap-1.5">
            <span style="color: #fff; font-size: 54px; font-weight: 800; line-height: 1">{{ last.value }}</span>
            <span style="color: #fff; font-size: 18px; font-weight: 700; opacity: .9">mg/dL</span>
          </div>
          <div style="color: rgba(255,255,255,.88); font-size: 13.5px; margin-top: 4px">
            {{ RANGE_LABEL[classify(last.value, params)] }} · {{ last.tag }}
          </div>
          <div style="color: rgba(255,255,255,.72); font-size: 12px; margin-top: 2px">{{ ago(last.at) }}</div>
        </div>

        <div class="flex" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.22)">
          <div class="flex-1">
            <div class="display tabular" style="color: #fff; font-size: 17px; font-weight: 700">{{ iob }}</div>
            <div style="color: rgba(255,255,255,.78); font-size: 10.5px">unità attive</div>
          </div>
          <div class="flex-1" style="border-left: 1px solid rgba(255,255,255,.2); padding-left: 10px">
            <div class="display tabular" style="color: #fff; font-size: 17px; font-weight: 700">{{ todayUnits }}</div>
            <div style="color: rgba(255,255,255,.78); font-size: 10.5px">unità oggi</div>
          </div>
          <div class="flex-1" style="border-left: 1px solid rgba(255,255,255,.2); padding-left: 10px">
            <div class="display tabular" style="color: #fff; font-size: 17px; font-weight: 700">{{ todayReadings }}</div>
            <div style="color: rgba(255,255,255,.78); font-size: 10.5px">misure oggi</div>
          </div>
        </div>
      </div>
    </div>

    <EmptyState v-else tone="water" title="Nessuna misurazione"
      subtitle="Registra la prima glicemia: da lì l'app calcola tempo nell'obiettivo, media e boli suggeriti." />

    <!-- Ipoglicemia: la cosa più urgente sta in cima -->
    <div v-if="last && classify(last.value, params) !== 'in-range' && lowOrHigh" class="rise rounded-4xl"
      style="padding: 13px 14px" :style="{ background: `var(--${lastTone}-soft)`, border: `1px solid var(--${lastTone})` }">
      <div class="flex items-start gap-2.5">
        <AlertTriangle :size="17" :color="`var(--${lastTone})`" style="margin-top: 2px; flex-shrink: 0" />
        <div class="min-w-0">
          <div class="text-ink" style="font-size: 14px; font-weight: 600">{{ adviceTitle }}</div>
          <p class="text-dim" style="font-size: 12.5px; line-height: 1.45; margin-top: 3px">{{ adviceText }}</p>
        </div>
      </div>
    </div>

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

        <div class="flex" style="margin-top: 12px">
          <div class="flex-1">
            <div class="display tabular text-move" style="font-size: 22px; font-weight: 800">{{ stats.inRange }}%</div>
            <div class="text-dim" style="font-size: 11px">nell'obiettivo</div>
          </div>
          <div class="flex-1">
            <div class="display tabular text-food" style="font-size: 22px; font-weight: 800">{{ stats.below }}%</div>
            <div class="text-dim" style="font-size: 11px">sotto</div>
          </div>
          <div class="flex-1">
            <div class="display tabular text-alcohol" style="font-size: 22px; font-weight: 800">{{ stats.above }}%</div>
            <div class="text-dim" style="font-size: 11px">sopra</div>
          </div>
        </div>

        <div class="flex" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line)">
          <div class="flex-1">
            <div class="display tabular text-ink" style="font-size: 18px; font-weight: 700">{{ stats.average }}</div>
            <div class="text-dim" style="font-size: 11px">media mg/dL</div>
          </div>
          <div class="flex-1">
            <div class="display tabular text-ink" style="font-size: 18px; font-weight: 700">{{ stats.gmi }}%</div>
            <div class="text-dim" style="font-size: 11px">glicata stimata</div>
          </div>
          <div class="flex-1">
            <div class="display tabular text-ink" style="font-size: 18px; font-weight: 700">{{ stats.count }}</div>
            <div class="text-dim" style="font-size: 11px">misurazioni</div>
          </div>
        </div>

        </template>

        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line)">
          <div class="flex items-center justify-between mb-2">
            <span class="text-ink" style="font-size: 13.5px; font-weight: 600">Andamento</span>
            <span class="text-faint" style="font-size: 11.5px">
              {{ period > 7 ? "media giornaliera e intervallo" : "ogni misurazione" }}
            </span>
          </div>
          <GlucoseChart :readings="glucose.readings" :params="params" :days="period" :height="150" />
        </div>
      </div>
    </div>

    <!-- Registro -->
    <div v-if="timeline.length" class="rise" style="animation-delay: 150ms">
      <Expandable title="Registro" :icon="ListOrdered" tone="water" :subtitle="`${timeline.length} voci recenti`"
        :default-open="true">
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
    <BottomSheet v-model="readingOpen" title="Registra la glicemia">
      <div class="space-y-3.5">
        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Valore (mg/dL)</div>
          <input v-model.number="rf.value" type="number" inputmode="numeric"
            class="bg-card border border-line text-ink rounded-2xl px-3 py-3 w-full tabular"
            style="font-size: 22px; font-weight: 700" />
        </div>

        <div v-if="rf.value > 0" class="rounded-2xl" style="padding: 10px 13px"
          :style="{ background: `var(--${RANGE_TONE[classify(rf.value, params)]}-soft)` }">
          <span class="text-ink" style="font-size: 13px; font-weight: 600">
            {{ RANGE_LABEL[classify(rf.value, params)] }}
          </span>
          <span class="text-dim" style="font-size: 12.5px">
            · obiettivo {{ params.targetMin }}–{{ params.targetMax }}
          </span>
        </div>

        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Quando</div>
          <div class="flex flex-wrap gap-2">
            <button v-for="t in READING_TAGS" :key="t" class="tap rounded-full" style="padding: 8px 12px; font-size: 13px"
              :style="rf.tag === t
                ? { background: 'var(--water)', color: '#fff', fontWeight: 600 }
                : { background: 'var(--raised)', color: 'var(--dim)' }"
              @click="rf.tag = t">
              {{ t }}
            </button>
          </div>
        </div>

        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Note</div>
          <textarea v-model="rf.notes" rows="2" style="resize: none"
            class="bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full"
            placeholder="Sintomi, contesto, cosa hai mangiato…" />
        </div>

        <button class="tap w-full py-3.5 rounded-3xl font-semibold grad-water" style="color: #fff; font-size: 15px"
          :disabled="!(rf.value > 0)" :style="!(rf.value > 0) ? { opacity: 0.5 } : {}" @click="saveReading">
          Registra
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
import { Droplet, Syringe, Plus, Trash2, AlertTriangle, ListOrdered } from "lucide-vue-next";
import { useGlucoseStore } from "~/stores/glucose";
import { useSettingsStore } from "~/stores/settings";
import {
  classify, RANGE_TONE, RANGE_LABEL, READING_TAGS, rangeStats, insulinOnBoard, targetMid,
  type ReadingTag,
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
const timeline = computed(() => {
  const r = glucose.sortedReadings.slice(0, 40).map((x) => ({
    key: `r${x.id}`,
    id: x.id,
    kind: "glicemia" as const,
    at: x.at,
    tone: RANGE_TONE[classify(x.value, params.value)],
    title: `${x.value} mg/dL`,
    subtitle: `${x.tag} · ${ago(x.at)}${x.notes ? ` · ${x.notes}` : ""}`,
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
const rf = reactive({ value: 0, tag: "prima del pasto" as ReadingTag, notes: "" });

function openReading() {
  Object.assign(rf, { value: 0, tag: "prima del pasto", notes: "" });
  readingOpen.value = true;
}
function saveReading() {
  if (!(rf.value > 0)) return;
  glucose.addReading(rf.value, rf.tag, rf.notes.trim() || undefined);
  readingOpen.value = false;
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
