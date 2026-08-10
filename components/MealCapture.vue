<template>
  <div>
    <!-- SCELTA -->
    <div v-if="phase === 'start'" class="space-y-3">
      <p class="text-dim" style="font-size: 14px; line-height: 1.5">
        Fotografa il piatto oppure scrivi cosa hai mangiato: stimo io calorie e valori nutrizionali, poi puoi correggere tutto.
      </p>
      <input ref="fileRef" type="file" accept="image/*" capture="environment" class="hidden" @change="onPick" />
      <button class="tap grad-food w-full py-3.5 rounded-3xl font-semibold flex items-center justify-center gap-2"
        style="color: #fff; font-size: 15px" @click="fileRef?.click()">
        <Camera :size="18" /> Scatta o scegli una foto
      </button>
      <button class="tap bg-raised text-ink w-full py-3.5 rounded-3xl font-semibold flex items-center justify-center gap-2"
        style="font-size: 15px" @click="phase = 'describe'">
        <PenLine :size="16" /> Descrivi a parole
      </button>
    </div>

    <!-- DESCRIZIONE A PAROLE -->
    <div v-else-if="phase === 'describe'" class="space-y-3">
      <div>
        <div class="text-faint mb-1.5" style="font-size: 12px">Cosa hai mangiato o bevuto?</div>
        <textarea v-model="description" rows="3" :class="inputCls"
          placeholder="Es. un piatto di pasta al pomodoro, due fette di pane e un'insalata mista" />
      </div>
      <p v-if="err" class="text-food" style="font-size: 13px; line-height: 1.45">{{ err }}</p>

      <button class="tap grad-food w-full py-3.5 rounded-3xl font-semibold flex items-center justify-center gap-2"
        style="color: #fff; font-size: 15px" :disabled="!description.trim()"
        :style="!description.trim() ? { opacity: 0.5 } : {}" @click="runEstimate">
        <Sparkles :size="17" /> Stima i valori
      </button>
      <button class="tap bg-raised text-dim w-full py-3 rounded-3xl font-semibold" style="font-size: 14px"
        @click="startBlank">
        Inserisco i valori a mano
      </button>
    </div>

    <!-- ATTESA -->
    <div v-else-if="phase === 'loading'" class="flex flex-col items-center py-10 gap-3">
      <Sparkles :size="28" class="text-food animate-pulse" />
      <span class="text-dim">{{ loadingLabel }}</span>
    </div>

    <!-- REVISIONE -->
    <div v-else class="space-y-4">
      <p v-if="err" class="text-food" style="font-size: 13px; line-height: 1.45">{{ err }}</p>

      <div v-for="(it, i) in items" :key="i" class="rounded-4xl p-3.5 space-y-2.5" style="background: var(--raised)">
        <div class="flex gap-2">
          <div style="flex: 2">
            <div class="text-faint" style="font-size: 11px">Nome</div>
            <input v-model="it.name" :class="inputCls" />
          </div>
          <div style="flex: 1">
            <div class="text-faint" style="font-size: 11px">Quantità</div>
            <input v-model="it.qty" :class="inputCls" />
          </div>
          <button class="text-faint self-end pb-2" aria-label="Rimuovi" @click="items.splice(i, 1)">
            <X :size="18" />
          </button>
        </div>
        <div class="grid grid-cols-5 gap-1.5">
          <div v-for="f in fields" :key="f.key">
            <div class="text-faint" style="font-size: 10.5px">{{ f.label }}</div>
            <input v-model.number="(it as any)[f.key]" type="number" inputmode="numeric" class="tabular"
              :class="inputCls" style="padding-left: 8px; padding-right: 4px" />
          </div>
        </div>
      </div>

      <button class="text-dim flex items-center gap-1" style="font-size: 14px" @click="addBlank">
        <Plus :size="16" /> Aggiungi voce
      </button>

      <div class="rounded-3xl p-3.5" style="background: var(--food-soft)">
        <div class="text-ink display" style="font-size: 15px; font-weight: 700">Totale: {{ sum.kcal }} kcal</div>
        <div class="text-dim tabular" style="font-size: 12.5px; margin-top: 3px">
          Carboidrati {{ sum.cho }} g · Proteine {{ sum.pro }} g · Grassi {{ sum.fat }} g · Fibre {{ sum.fib }} g
          <span v-if="sum.alc > 0"> · Alcol {{ sum.alc }} g</span>
        </div>
      </div>

      <button class="tap grad-food w-full py-3.5 rounded-3xl font-semibold" style="color: #fff; font-size: 15px" @click="save">
        Salva nel diario
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Camera, PenLine, Sparkles, X, Plus } from "lucide-vue-next";
import type { RecognizedItem } from "~/composables/useRecognition";
import { estimateLocally } from "~/utils/foods";

const emit = defineEmits<{ save: [any] }>();
const { recognize, estimate } = useRecognition();

const phase = ref<"start" | "describe" | "loading" | "edit">("start");
const items = ref<RecognizedItem[]>([]);
const description = ref("");
const err = ref("");
const loadingLabel = ref("Sto leggendo la foto…");
const fileRef = ref<HTMLInputElement | null>(null);

const inputCls = "bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full";

const fields = [
  { key: "kcal", label: "kcal" },
  { key: "cho", label: "Carb" },
  { key: "pro", label: "Prot" },
  { key: "fat", label: "Gras" },
  { key: "fib", label: "Fibre" },
];

const blank = (): RecognizedItem => ({ name: "", qty: "", kcal: 0, cho: 0, pro: 0, fat: 0, fib: 0, alc: 0 });

const sum = computed(() =>
  items.value.reduce(
    (a, it) => ({
      kcal: a.kcal + (+it.kcal || 0),
      cho: a.cho + (+it.cho || 0),
      pro: a.pro + (+it.pro || 0),
      fat: a.fat + (+it.fat || 0),
      fib: a.fib + (+it.fib || 0),
      alc: a.alc + (+it.alc || 0),
    }),
    { kcal: 0, cho: 0, pro: 0, fat: 0, fib: 0, alc: 0 },
  ),
);

function messageOf(e: any, fallback: string) {
  return e?.data?.statusMessage || e?.statusMessage || fallback;
}

async function onPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  loadingLabel.value = "Sto leggendo la foto…";
  phase.value = "loading";
  err.value = "";
  try {
    const list = await recognize(file);
    items.value = list.length ? list : [blank()];
  } catch (e: any) {
    err.value = messageOf(e, "Non sono riuscito a leggere la foto. Puoi inserire i dati a mano.");
    items.value = [blank()];
  }
  phase.value = "edit";
}

async function runEstimate() {
  if (!description.value.trim()) return;
  loadingLabel.value = "Sto stimando i valori…";
  phase.value = "loading";
  err.value = "";
  try {
    const list = await estimate(description.value);
    items.value = list.length ? list : [{ ...blank(), name: description.value }];
  } catch (e: any) {
    // Il servizio non risponde: si ripiega sulla tabella alimenti locale,
    // così l'utente ottiene comunque dei valori invece che una riga di zeri.
    const local = estimateLocally(description.value);
    if (local.length) {
      items.value = local;
      err.value = "Stima calcolata dalla tabella alimenti locale: controlla i valori, sono approssimativi.";
    } else {
      items.value = [{ ...blank(), name: description.value }];
      err.value = messageOf(e, "Stima non riuscita. Puoi inserire i valori a mano.");
    }
  }
  phase.value = "edit";
}

function startBlank() {
  items.value = [{ ...blank(), name: description.value }];
  phase.value = "edit";
}
function addBlank() {
  items.value.push(blank());
}
function save() {
  const name = items.value.map((i) => i.name).filter(Boolean).join(", ") || "Pasto";
  emit("save", { name, ...sum.value });
}
</script>
