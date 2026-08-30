<template>
  <div class="space-y-3">
    <!-- periodo -->
    <div class="rise flex gap-1.5 p-1.5 rounded-4xl"
      style="background: var(--raised); border: 1px solid var(--line)">
      <button v-for="p in periods" :key="p.days" class="tap flex-1 py-2.5 rounded-3xl font-semibold"
        style="font-size: 14px"
        :style="days === p.days
          ? { background: 'var(--card)', color: 'var(--ink)', boxShadow: `inset 0 0 0 1px var(--water), 0 0 16px -4px var(--water-glow)` }
          : { color: 'var(--dim)' }"
        @click="load(p.days)">
        {{ p.label }}
      </button>
    </div>

    <!-- non collegato -->
    <EmptyState v-if="!connected && !busy" tone="water"
      :title="expired ? 'Sessione Withings scaduta' : 'Withings non collegato'"
      :subtitle="expired
        ? 'Apri il Profilo, scollega Withings e ricollegalo: i dati torneranno tutti, non si perde nulla.'
        : 'Collega la bilancia dal Profilo per vedere qui peso, composizione corporea e andamento nel tempo.'" />

    <div v-else-if="busy && !data" class="rise text-center" style="padding: 40px 20px">
      <Loader2 :size="26" class="text-water animate-spin mx-auto" />
      <p class="text-dim" style="font-size: 13.5px; margin-top: 10px">Leggo le misure…</p>
    </div>

    <template v-else-if="data">
      <!-- PESO: il dato principale, con il suo andamento -->
      <div class="rise rounded-5xl overflow-hidden relative"
        style="background: var(--card); border: 1px solid var(--line); box-shadow: var(--tile-shadow); padding: 16px">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <div class="rounded-full flex items-center justify-center"
                style="width: 32px; height: 32px; background: var(--water-soft)">
                <Scale :size="17" color="var(--water)" />
              </div>
              <span class="text-dim" style="font-size: 14px; font-weight: 600">Peso</span>
            </div>
            <div class="display tabular flex items-baseline gap-1.5" style="margin-top: 10px">
              <span style="color: var(--water); font-size: 46px; font-weight: 800; line-height: 1">
                {{ fmt(s.weight.last) }}
              </span>
              <span class="text-dim" style="font-size: 18px; font-weight: 600">kg</span>
            </div>
            <div v-if="s.weight.delta !== null" class="flex items-center gap-1.5" style="margin-top: 4px">
              <component :is="s.weight.delta > 0 ? TrendingUp : s.weight.delta < 0 ? TrendingDown : Minus"
                :size="15" :color="deltaColor(s.weight.delta, 'lower')" />
              <span class="tabular" :style="{ color: deltaColor(s.weight.delta, 'lower'), fontSize: '13.5px', fontWeight: 600 }">
                {{ signed(s.weight.delta) }} kg
              </span>
              <span class="text-faint" style="font-size: 12.5px">in {{ days }} giorni</span>
            </div>
          </div>
          <div class="text-right text-faint" style="font-size: 11.5px">
            <div>{{ measuredLabel }}</div>
            <div class="tabular" style="margin-top: 2px">{{ data.series.weight.length }} misure</div>
          </div>
        </div>

        <div style="margin-top: 14px">
          <TrendChart :points="data.series.weight" tone="water" :height="130" />
        </div>
      </div>

      <!-- Tutto il resto della composizione corporea sta qui: in pagina
           resta il peso, che è il dato che si guarda ogni giorno. -->
      <Expandable title="Altri valori" :icon="Activity" tone="alcohol" :subtitle="othersSummary">
        <div class="space-y-2.5">
          <MeasureCard v-if="has('visceralFat')" tone="food" :icon="Flame" label="Grasso viscerale"
            :value="fmt(s.visceralFat.last, 0)" unit="indice" :delta="s.visceralFat.delta" better="lower"
            :points="data.series.visceralFat" :decimals="0"
            note="Sotto 13 è considerato nella norma. È il grasso attorno agli organi, quello che conta di più per la salute." />

          <MeasureCard v-if="has('muscleMass')" tone="move" :icon="Dumbbell" label="Massa muscolare"
            :value="fmt(s.muscleMass.last)" unit="kg" :delta="s.muscleMass.delta" better="higher"
            :points="data.series.muscleMass" />

          <MeasureCard v-if="has('hydration')" tone="water" :icon="Droplets" label="Acqua corporea"
            :value="fmt(s.hydration.last)" unit="kg" :delta="s.hydration.delta" better="higher"
            :points="data.series.hydration"
            :note="hydrationPct ? `Circa il ${hydrationPct}% del peso corporeo.` : ''" />

          <MeasureCard v-if="has('fatRatio')" tone="food" :icon="Percent" label="Massa grassa"
            :value="fmt(s.fatRatio.last)" unit="%" :delta="s.fatRatio.delta" better="lower"
            :points="data.series.fatRatio" compact />
          <MeasureCard v-if="has('leanMass')" tone="move" :icon="Activity" label="Massa magra"
            :value="fmt(s.leanMass.last)" unit="kg" :delta="s.leanMass.delta" better="higher"
            :points="data.series.leanMass" compact />
          <MeasureCard v-if="has('pulse')" tone="alcohol" :icon="HeartPulse" label="Battito a riposo"
            :value="fmt(s.pulse.last, 0)" unit="bpm" :delta="s.pulse.delta" better="lower"
            :points="data.series.pulse" :decimals="0" compact />
          <MeasureCard v-if="has('boneMass')" tone="alcohol" :icon="Bone" label="Massa ossea"
            :value="fmt(s.boneMass.last)" unit="kg" :delta="s.boneMass.delta" better="neutral"
            :points="data.series.boneMass" compact />

          <p v-if="!othersCount" class="text-faint text-center" style="font-size: 12.5px; padding: 10px">
            Nessun altro valore in questo periodo.
          </p>
        </div>
      </Expandable>

      <button class="tap w-full rounded-full py-3 font-semibold bg-raised text-dim"
        style="font-size: 13.5px" :disabled="busy" @click="load(days)">
        {{ busy ? "Aggiorno…" : "Aggiorna misure" }}
      </button>
    </template>

    <p v-if="error" class="text-food text-center" style="font-size: 13px; line-height: 1.45">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import {
  Scale, Flame, Dumbbell, Droplets, Activity, Percent, HeartPulse, Bone,
  TrendingUp, TrendingDown, Minus, Loader2,
} from "lucide-vue-next";

interface Summary { last: number | null; first: number | null; delta: number | null }
interface History {
  days: number;
  measuredAt: number | null;
  series: Record<string, { t: number; v: number }[]>;
  summary: Record<string, Summary>;
}

const base = useRuntimeConfig().public.apiBase || "";
const { status } = useWithings();

const days = ref(90);
const data = ref<History | null>(null);
const busy = ref(true);
const connected = ref(false);
const expired = ref(false);
const error = ref("");

const periods = [
  { days: 30, label: "30 giorni" },
  { days: 90, label: "3 mesi" },
  { days: 365, label: "1 anno" },
];

const s = computed(() => data.value?.summary ?? ({} as Record<string, Summary>));
const has = (k: string) => (data.value?.series[k]?.length ?? 0) > 0;

const fmt = (v: number | null | undefined, dec = 1) => (v === null || v === undefined ? "—" : v.toFixed(dec));
const signed = (v: number | null) => (v === null ? "" : `${v > 0 ? "+" : ""}${v.toFixed(1)}`);

/** Verde se va nella direzione desiderata, arancio se va nell'altra. */
function deltaColor(delta: number | null, better: "lower" | "higher" | "neutral") {
  if (delta === null || delta === 0 || better === "neutral") return "var(--dim)";
  const good = better === "lower" ? delta < 0 : delta > 0;
  return good ? "var(--move)" : "var(--food)";
}

const measuredLabel = computed(() => {
  const t = data.value?.measuredAt;
  if (!t) return "";
  const d = new Date(t * 1000);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? `oggi ${d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`
    : d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
});

const hydrationPct = computed(() => {
  const w = s.value.weight?.last;
  const h = s.value.hydration?.last;
  return w && h ? Math.round((h / w) * 100) : null;
});

// Tutte le voci della sezione, non solo quelle secondarie: il sottotitolo
// deve dire quanti valori si trovano davvero aprendola.
const othersCount = computed(
  () =>
    ["visceralFat", "muscleMass", "hydration", "fatRatio", "leanMass", "pulse", "boneMass"].filter((k) =>
      has(k),
    ).length,
);
const othersSummary = computed(() =>
  othersCount.value ? `${othersCount.value} valori disponibili` : "nessun valore in questo periodo",
);

async function load(d: number) {
  days.value = d;
  busy.value = true;
  error.value = "";
  try {
    const st: any = await status();
    connected.value = !!st.connected;
    expired.value = !st.connected && /scaduta/i.test(st.reason || "");
    if (!connected.value) return;

    const res = await $fetch<History>(`${base}/api/withings/history`, {
      params: { days: d },
      credentials: "include",
    });
    data.value = res;
  } catch (e: any) {
    // Il messaggio del server dice esattamente cosa non ha funzionato:
    // sostituirlo con una frase generica rende impossibile capirlo.
    error.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      "Non sono riuscito a leggere le misure. Controlla il collegamento nel Profilo.";
  } finally {
    busy.value = false;
  }
}

onMounted(() => load(days.value));
</script>
