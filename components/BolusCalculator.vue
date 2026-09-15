<template>
  <div class="space-y-3.5">
    <div class="flex gap-2.5">
      <div class="flex-1">
        <div class="text-faint mb-1.5" style="font-size: 12px">Glicemia (mg/dL)</div>
        <input v-model.number="glucoseValue" type="number" inputmode="numeric"
          class="bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full tabular" />
      </div>
      <div class="flex-1">
        <div class="text-faint mb-1.5" style="font-size: 12px">Carboidrati (g)</div>
        <input v-model.number="carbs" type="number" inputmode="numeric"
          class="bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full tabular" />
      </div>
    </div>

    <!-- Il risultato va mostrato scomposto: così si può verificare -->
    <div class="rounded-4xl" style="padding: 14px"
      :style="{ background: suggestion.hypo ? 'var(--food-soft)' : 'var(--move-soft)' }">
      <div v-if="suggestion.hypo" class="text-center">
        <div class="display text-food" style="font-size: 20px; font-weight: 800">Prima risali</div>
        <p class="text-dim" style="font-size: 13px; line-height: 1.45; margin-top: 6px">
          Con questa glicemia servono circa
          <strong class="text-ink">{{ suggestion.carbsToRecover }} g</strong> di zuccheri a rapido
          assorbimento. Ricontrolla dopo 15 minuti prima di pensare all'insulina.
        </p>
      </div>

      <div v-else class="text-center">
        <div class="text-dim" style="font-size: 12.5px">Bolo suggerito</div>
        <div class="display tabular flex items-baseline justify-center gap-1.5">
          <span class="text-move" style="font-size: 44px; font-weight: 800; line-height: 1.05">
            {{ suggestion.rounded }}
          </span>
          <span class="text-dim" style="font-size: 16px; font-weight: 700">unità</span>
        </div>
      </div>

      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line)">
        <div v-for="row in breakdown" :key="row.label" class="flex items-center justify-between" style="padding: 3px 0">
          <span class="text-dim" style="font-size: 12.5px">{{ row.label }}</span>
          <span class="tabular" :style="{ color: row.color, fontSize: '13px', fontWeight: 600 }">{{ row.value }}</span>
        </div>
      </div>
    </div>

    <div v-for="(w, i) in suggestion.warnings" :key="i" class="rounded-2xl flex items-start gap-2.5"
      style="padding: 10px 13px; background: var(--food-soft)">
      <AlertTriangle :size="15" color="var(--food)" style="margin-top: 2px; flex-shrink: 0" />
      <span class="text-dim" style="font-size: 12.5px; line-height: 1.4">{{ w }}</span>
    </div>

    <div>
      <div class="text-faint mb-1.5" style="font-size: 12px">Unità da registrare</div>
      <div class="flex items-center gap-3">
        <button class="tap bg-raised text-ink rounded-2xl p-3" aria-label="Meno mezza unità"
          @click="units = Math.max(0, round(units - 0.5))">
          <Minus :size="17" />
        </button>
        <span class="flex-1 text-center display tabular" style="font-size: 30px; font-weight: 800">{{ units }}</span>
        <button class="tap bg-raised text-ink rounded-2xl p-3" aria-label="Più mezza unità"
          @click="units = round(units + 0.5)">
          <Plus :size="17" />
        </button>
      </div>
    </div>

    <p class="text-faint" style="font-size: 12px; line-height: 1.5">
      Stima calcolata sui parametri che hai impostato (obiettivo {{ targetMid(params) }} mg/dL,
      FSI {{ params.isf }}, rapporto 1:{{ params.icr }}). La dose resta una decisione tua e del tuo
      diabetologo: se il numero non torna, fidati dello schema che avete concordato.
    </p>

    <button class="tap w-full py-3.5 rounded-3xl font-semibold grad-move" style="color: #fff; font-size: 15px"
      :disabled="units <= 0" :style="units <= 0 ? { opacity: 0.5 } : {}" @click="save">
      Registra il bolo
    </button>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Minus, Plus } from "lucide-vue-next";
import { useGlucoseStore } from "~/stores/glucose";
import { useSettingsStore } from "~/stores/settings";
import { suggestBolus, insulinOnBoard, targetMid } from "~/utils/diabetes";

const props = withDefaults(
  defineProps<{ initialGlucose?: number | null; initialCarbs?: number }>(),
  { initialGlucose: null, initialCarbs: 0 },
);
const emit = defineEmits<{ save: [any] }>();

const glucose = useGlucoseStore();
const settings = useSettingsStore();
const params = computed(() => settings.diabetes);

const glucoseValue = ref<number>(props.initialGlucose ?? 0);
const carbs = ref<number>(props.initialCarbs ?? 0);

const iob = computed(() => insulinOnBoard(glucose.recentBoluses(params.value.duration), params.value));

const suggestion = computed(() =>
  suggestBolus({
    glucose: glucoseValue.value > 0 ? glucoseValue.value : null,
    carbs: carbs.value,
    params: params.value,
    iob: iob.value,
  }),
);

const breakdown = computed(() => [
  { label: "Per i carboidrati", value: `${suggestion.value.meal} U`, color: "var(--ink)" },
  { label: "Per la correzione", value: `${suggestion.value.correction} U`, color: "var(--ink)" },
  { label: "Insulina ancora attiva", value: `−${suggestion.value.iob} U`, color: "var(--dim)" },
  { label: "Totale calcolato", value: `${suggestion.value.total} U`, color: "var(--move)" },
]);

const round = (n: number) => Math.round(n * 2) / 2;

// L'unità proposta segue il calcolo finché non la si modifica a mano.
const units = ref(0);
watch(
  () => suggestion.value.rounded,
  (v) => {
    units.value = v;
  },
  { immediate: true },
);

function save() {
  const kind =
    suggestion.value.meal > 0 && suggestion.value.correction > 0
      ? "misto"
      : suggestion.value.meal > 0
        ? "pasto"
        : "correzione";
  emit("save", {
    units: units.value,
    kind,
    carbs: carbs.value || undefined,
    glucose: glucoseValue.value || undefined,
  });
}
</script>
