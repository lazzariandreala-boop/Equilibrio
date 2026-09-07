<template>
  <div class="space-y-3">
    <!-- Stato attuale -->
    <div v-if="settings.profile.pregnant" class="rise rounded-5xl relative overflow-hidden grad-alcohol"
      style="box-shadow: 0 14px 34px -10px var(--alcohol-glow)">
      <div class="relative p-5 text-center">
        <Baby :size="26" color="#fff" style="margin: 0 auto" />
        <div class="display" style="color: #fff; font-size: 20px; font-weight: 800; margin-top: 8px">
          Gravidanza in corso
        </div>
        <p style="color: rgba(255,255,255,.85); font-size: 13.5px; line-height: 1.5; margin-top: 6px">
          Le previsioni del ciclo sono sospese. Puoi comunque consultare lo storico qui sotto.
        </p>
      </div>
    </div>

    <div v-else-if="st.kind !== 'nessun-dato'" class="rise rounded-5xl relative overflow-hidden"
      :class="`grad-${banner.tone}`" :style="{ boxShadow: `0 14px 34px -10px var(--${banner.tone}-glow)` }">
      <div class="relative p-5">
        <div class="flex items-center gap-2">
          <component :is="banner.icon" :size="18" color="#fff" />
          <span style="color: #fff; font-size: 14px; font-weight: 700">{{ banner.title }}</span>
        </div>
        <div class="display" style="color: #fff; font-size: 30px; font-weight: 800; line-height: 1.15; margin-top: 8px">
          {{ banner.headline }}
        </div>
        <p style="color: rgba(255,255,255,.85); font-size: 13.5px; line-height: 1.45; margin-top: 4px">
          {{ banner.detail }}
        </p>

        <div class="flex" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.22)">
          <div class="flex-1">
            <div class="display tabular" style="color: #fff; font-size: 17px; font-weight: 700">{{ cycle.averageLength }}</div>
            <div style="color: rgba(255,255,255,.78); font-size: 10.5px">giorni di ciclo</div>
          </div>
          <div v-if="cycle.averageDuration" class="flex-1" style="border-left: 1px solid rgba(255,255,255,.2); padding-left: 10px">
            <div class="display tabular" style="color: #fff; font-size: 17px; font-weight: 700">{{ cycle.averageDuration }}</div>
            <div style="color: rgba(255,255,255,.78); font-size: 10.5px">giorni di flusso</div>
          </div>
          <div class="flex-1" style="border-left: 1px solid rgba(255,255,255,.2); padding-left: 10px">
            <div class="display tabular" style="color: #fff; font-size: 17px; font-weight: 700">{{ cycle.entries.length }}</div>
            <div style="color: rgba(255,255,255,.78); font-size: 10.5px">registrati</div>
          </div>
        </div>
      </div>
    </div>

    <EmptyState v-else tone="alcohol" title="Nessun ciclo registrato"
      subtitle="Segna il primo giorno: dopo due registrazioni l'app inizia a stimare quando aspettarti il prossimo." />

    <div class="flex gap-2.5 rise" style="animation-delay: 70ms">
      <button class="tap flex-1 rounded-full py-3.5 font-semibold flex items-center justify-center gap-2 grad-alcohol cta-glow-alcohol"
        style="color: #fff; font-size: 15px" @click="openNew()">
        <Plus :size="18" /> Registra
      </button>
      <button class="tap rounded-full px-5 font-semibold flex items-center justify-center gap-2 bg-raised text-ink"
        style="font-size: 15px; border: 1px solid var(--line)" @click="calendarOpen = true">
        <CalendarDays :size="18" color="var(--alcohol)" /> Calendario
      </button>
    </div>

    <!-- Previsione del prossimo, tolta se in gravidanza o se già arrivato -->
    <div v-if="showPrediction" class="rise rounded-4xl flex items-center gap-3" style="padding: 13px 14px"
      :style="{ background: 'var(--card)', border: '1px dashed var(--line)', boxShadow: 'var(--tile-shadow)' }">
      <div class="rounded-2xl flex items-center justify-center shrink-0"
        style="width: 40px; height: 40px; background: var(--alcohol-soft)">
        <CalendarClock :size="19" color="var(--alcohol)" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="text-ink" style="font-size: 14.5px; font-weight: 600">Prossimo previsto</div>
        <div class="text-dim" style="font-size: 12.5px; text-transform: capitalize">
          {{ fmtLong(st.predicted!) }}
        </div>
      </div>
      <span class="text-faint" style="font-size: 12px">stima</span>
    </div>

    <!-- Storico -->
    <div v-if="cycle.entries.length" class="rise" style="animation-delay: 120ms">
      <Expandable title="Cicli registrati" :icon="CalendarDays" tone="alcohol"
        :subtitle="`${cycle.entries.length} registrazioni`" :default-open="true">
        <div class="space-y-2">
          <button v-for="e in cycle.sorted" :key="e.start" class="tap w-full text-left rounded-3xl"
            style="padding: 12px 14px; background: var(--raised)" @click="openEdit(e)">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="text-ink" style="font-weight: 600; font-size: 14.5px; text-transform: capitalize">
                  {{ fmtShortIt(e.start) }}<span v-if="e.end" class="text-dim"> → {{ fmtShortIt(e.end) }}</span>
                </div>
                <div class="text-dim" style="font-size: 12.5px; margin-top: 2px">
                  <span v-if="e.end">{{ durationOf(e) }} giorni</span>
                  <span v-else class="text-alcohol">in corso</span>
                  <span v-if="e.flow"> · {{ e.flow }}</span>
                  <span v-if="e.pain"> · dolore {{ painLabel(e.pain) }}</span>
                </div>
              </div>
              <span v-if="deviationLabel(e)" class="rounded-full shrink-0"
                :style="{
                  padding: '4px 9px', fontSize: '11px', fontWeight: 600,
                  background: `var(--${deviationTone(e)}-soft)`, color: `var(--${deviationTone(e)})`,
                }">
                {{ deviationLabel(e) }}
              </span>
            </div>

            <div v-if="e.symptoms?.length" class="flex flex-wrap gap-1.5" style="margin-top: 8px">
              <span v-for="sx in e.symptoms" :key="sx" class="rounded-full text-dim"
                style="padding: 3px 8px; font-size: 11px; background: var(--card)">{{ sx }}</span>
            </div>
            <p v-if="e.notes" class="text-faint" style="font-size: 12px; margin-top: 6px; line-height: 1.4">
              {{ e.notes }}
            </p>
          </button>
        </div>
      </Expandable>
    </div>

    <BottomSheet v-model="calendarOpen" title="Calendario del ciclo">
      <CycleCalendar />
    </BottomSheet>

    <!-- Scheda di inserimento -->
    <BottomSheet v-model="sheetOpen" :title="editing ? 'Modifica il ciclo' : 'Registra un ciclo'">
      <div class="space-y-3.5">
        <div class="flex gap-2.5">
          <div class="flex-1">
            <div class="text-faint mb-1.5" style="font-size: 12px">Inizio</div>
            <input v-model="form.start" type="date" :class="inputCls" />
          </div>
          <div class="flex-1">
            <div class="text-faint mb-1.5" style="font-size: 12px">Fine (se conclusa)</div>
            <input v-model="form.end" type="date" :class="inputCls" />
          </div>
        </div>

        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Flusso</div>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="f in flows" :key="f" class="tap rounded-2xl py-2.5 font-semibold" style="font-size: 13.5px"
              :class="form.flow === f ? 'grad-alcohol' : 'bg-raised text-dim'"
              :style="form.flow === f ? { color: '#fff' } : {}" @click="form.flow = f">
              {{ f }}
            </button>
          </div>
        </div>

        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Dolore</div>
          <div class="grid grid-cols-4 gap-2">
            <button v-for="(lab, i) in pains" :key="i" class="tap rounded-2xl py-2.5 font-semibold" style="font-size: 13px"
              :class="form.pain === i ? 'grad-alcohol' : 'bg-raised text-dim'"
              :style="form.pain === i ? { color: '#fff' } : {}" @click="form.pain = i">
              {{ lab }}
            </button>
          </div>
        </div>

        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Sintomi</div>
          <div class="flex flex-wrap gap-2">
            <button v-for="sx in SYMPTOMS" :key="sx" class="tap rounded-full" style="padding: 8px 12px; font-size: 13px"
              :style="form.symptoms.includes(sx)
                ? { background: 'var(--alcohol)', color: '#fff', fontWeight: 600 }
                : { background: 'var(--raised)', color: 'var(--dim)' }"
              @click="toggleSymptom(sx)">
              {{ sx }}
            </button>
          </div>
        </div>

        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Note</div>
          <textarea v-model="form.notes" rows="3" :class="inputCls" style="resize: none"
            placeholder="Come è andata, cosa hai preso, cosa hai notato…" />
        </div>

        <p v-if="alarming" class="rounded-2xl" style="padding: 11px 13px; background: var(--food-soft); font-size: 12.5px; line-height: 1.45">
          <span class="text-food" style="font-weight: 600">Vale la pena parlarne col medico.</span>
          <span class="text-dim"> Svenimenti, dolore forte o flusso molto abbondante non sono da sopportare
            e basta: spesso c'è una causa trattabile.</span>
        </p>

        <button class="tap w-full py-3.5 rounded-3xl font-semibold grad-alcohol" style="color: #fff; font-size: 15px"
          :disabled="!form.start" :style="!form.start ? { opacity: 0.5 } : {}" @click="save">
          {{ editing ? "Salva le modifiche" : "Registra" }}
        </button>

        <button v-if="editing" class="tap w-full py-2.5 rounded-2xl text-faint" style="font-size: 13px" @click="remove">
          Elimina questa registrazione
        </button>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import {
  Plus, CalendarDays, CalendarClock, Baby, Clock, AlertTriangle, Droplet, CheckCircle2,
} from "lucide-vue-next";
import { useCycleStore, type CycleEntry } from "~/stores/cycle";
import { useSettingsStore } from "~/stores/settings";
import { todayKey, keyToDate } from "~/utils/date";

const cycle = useCycleStore();
const settings = useSettingsStore();

const inputCls = "bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full";
const flows = ["leggero", "normale", "abbondante"] as const;
const pains = ["nessuno", "lieve", "medio", "forte"];
const SYMPTOMS = [
  "crampi", "mal di testa", "nausea", "svenimento", "dolori addominali forti",
  "flusso molto abbondante", "stanchezza", "sbalzi d'umore", "gonfiore", "mal di schiena",
];

const st = computed(() => cycle.status);

/**
 * La previsione si mostra solo se ha senso: sparisce in gravidanza, quando
 * non ci sono abbastanza dati e quando il ciclo di quel mese è già arrivato.
 */
const showPrediction = computed(
  () =>
    !settings.profile.pregnant &&
    !!st.value.predicted &&
    st.value.kind !== "in-corso" &&
    cycle.entries.length >= 1,
);

const banner = computed(() => {
  const s = st.value;
  if (s.kind === "in-corso") {
    return {
      tone: "alcohol", icon: Droplet, title: "Ciclo in corso",
      headline: `Giorno ${s.days}`,
      detail: "Puoi aggiornare la registrazione con la data di fine quando è terminato.",
    };
  }
  if (s.kind === "in-ritardo") {
    return {
      tone: "food", icon: AlertTriangle, title: "In ritardo",
      headline: `${s.days} ${s.days === 1 ? "giorno" : "giorni"} oltre la previsione`,
      detail: "Può capitare per stress, viaggi o cambi di ritmo. Se il ritardo si allunga, parlane col medico.",
    };
  }
  if (s.kind === "in-arrivo") {
    return {
      tone: "alcohol", icon: Clock, title: "In arrivo",
      headline: s.days === 0 ? "Previsto oggi" : `Tra circa ${s.days} ${s.days === 1 ? "giorno" : "giorni"}`,
      detail: "Stima basata sulla tua media, non su una regola fissa.",
    };
  }
  return {
    tone: "move", icon: CheckCircle2, title: "Nei tempi",
    headline: `Tra ${s.days} giorni`,
    detail: "Nessun segnale di anticipo o ritardo rispetto alla tua media.",
  };
});

// ── inserimento ──
const sheetOpen = ref(false);
const calendarOpen = ref(false);
const editing = ref<string | null>(null);
const form = reactive({
  start: todayKey(),
  end: "",
  flow: "normale" as (typeof flows)[number],
  pain: 0,
  symptoms: [] as string[],
  notes: "",
});

const alarming = computed(() =>
  form.pain === 3 ||
  form.symptoms.some((s) => ["svenimento", "dolori addominali forti", "flusso molto abbondante"].includes(s)),
);

function openNew() {
  editing.value = null;
  Object.assign(form, { start: todayKey(), end: "", flow: "normale", pain: 0, symptoms: [], notes: "" });
  sheetOpen.value = true;
}

function openEdit(e: CycleEntry) {
  editing.value = e.start;
  Object.assign(form, {
    start: e.start,
    end: e.end || "",
    flow: e.flow || "normale",
    pain: e.pain ?? 0,
    symptoms: [...(e.symptoms || [])],
    notes: e.notes || "",
  });
  sheetOpen.value = true;
}

function toggleSymptom(sx: string) {
  const i = form.symptoms.indexOf(sx);
  if (i >= 0) form.symptoms.splice(i, 1);
  else form.symptoms.push(sx);
}

function save() {
  if (!form.start) return;
  const entry: CycleEntry = {
    start: form.start,
    end: form.end || undefined,
    flow: form.flow,
    pain: form.pain,
    symptoms: [...form.symptoms],
    notes: form.notes.trim() || undefined,
  };
  if (editing.value && editing.value !== form.start) cycle.remove(editing.value);
  cycle.add(entry);
  sheetOpen.value = false;
}

function remove() {
  if (editing.value) cycle.remove(editing.value);
  sheetOpen.value = false;
}

// ── formattazione ──
const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function fmtShortIt(key: string) {
  const d = keyToDate(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function fmtLong(key: string) {
  const d = keyToDate(key);
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}
function durationOf(e: CycleEntry) {
  if (!e.end) return 0;
  return Math.round((keyToDate(e.end).getTime() - keyToDate(e.start).getTime()) / 86400000) + 1;
}
function painLabel(n: number) {
  return pains[n] ?? "";
}
function deviationLabel(e: CycleEntry) {
  const d = cycle.deviationOf(e);
  if (d === null || Math.abs(d) <= 3) return "";
  return d > 0 ? `+${d} gg` : `${d} gg`;
}
function deviationTone(e: CycleEntry) {
  const d = cycle.deviationOf(e);
  return d !== null && d > 0 ? "food" : "water";
}
</script>
