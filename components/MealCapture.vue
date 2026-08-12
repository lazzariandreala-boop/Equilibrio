<template>
  <div>
    <!-- SCELTA -->
    <div v-if="phase === 'start'" class="space-y-3">
      <p class="text-dim" style="font-size: 14px; line-height: 1.5">
        Fotografa il piatto oppure scrivi cosa hai mangiato: stimo io calorie e valori nutrizionali, poi puoi correggere tutto.
      </p>
      <div class="flex gap-2.5">
        <button class="tap grad-food flex-1 py-3.5 rounded-3xl font-semibold flex items-center justify-center gap-2"
          style="color: #fff; font-size: 15px" @click="fromPhoto('camera')">
          <Camera :size="18" /> Scatta ora
        </button>
        <button class="tap bg-raised text-ink flex-1 py-3.5 rounded-3xl font-semibold flex items-center justify-center gap-2"
          style="font-size: 15px" @click="fromPhoto('gallery')">
          <Images :size="17" /> Galleria
        </button>
      </div>
      <button class="tap bg-raised text-ink w-full py-3.5 rounded-3xl font-semibold flex items-center justify-center gap-2"
        style="font-size: 15px" @click="phase = 'describe'">
        <PenLine :size="16" /> Descrivi a parole
      </button>
      <button class="tap bg-raised text-ink w-full py-3.5 rounded-3xl font-semibold flex items-center justify-center gap-2"
        style="font-size: 15px" @click="startSearch">
        <Search :size="16" /> Cerca un alimento
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
          <div style="flex: 1.1">
            <div class="text-faint" style="font-size: 11px">Quantità</div>
            <div class="flex gap-1.5">
              <!-- Il valore si legge dall'evento: con v-model il gestore
                   riceverebbe ancora la quantità precedente. -->
              <input :value="qtyNum[i]" type="number" inputmode="decimal" class="tabular"
                :class="inputCls" style="flex: 1; min-width: 0; padding-left: 8px; padding-right: 4px"
                @input="onQtyInput(i, ($event.target as HTMLInputElement).value)" />
              <select :value="qtyUnit[i]" :class="inputCls"
                style="width: 68px; padding-left: 8px; padding-right: 4px"
                @change="onUnitChange(i, ($event.target as HTMLSelectElement).value)">
                <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
              </select>
            </div>
          </div>
          <button class="text-faint self-end pb-2" aria-label="Rimuovi" @click="items.splice(i, 1)">
            <X :size="18" />
          </button>
        </div>
        <div class="grid grid-cols-5 gap-1.5">
          <div v-for="f in fields" :key="f.key">
            <div class="text-faint" style="font-size: 10.5px">{{ f.label }}</div>
            <input v-model.number="(it as any)[f.key]" type="number" inputmode="numeric" class="tabular"
              :class="inputCls" style="padding-left: 8px; padding-right: 4px" @change="rebase(i)" />
          </div>
        </div>
      </div>

      <div class="rounded-4xl p-3.5" style="background: var(--raised)">
        <FoodSearch @pick="onSearchPick" />
      </div>

      <p class="text-faint px-1" style="font-size: 12px; line-height: 1.4">
        Cambiando la quantità, calorie e valori si ricalcolano in proporzione.
      </p>

      <button class="text-dim flex items-center gap-1" style="font-size: 14px" @click="addBlank">
        <Plus :size="16" /> Aggiungi voce vuota
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
import { Camera, Images, PenLine, Sparkles, X, Plus, Search } from "lucide-vue-next";
import type { RecognizedItem } from "~/composables/useRecognition";
import { estimateLocally } from "~/utils/foods";

const props = withDefaults(defineProps<{ initialItems?: RecognizedItem[] | null }>(), {
  initialItems: null,
});
const emit = defineEmits<{ save: [any] }>();
const { recognizeBase64, estimate, fileToBase64 } = useRecognition();
const { isNative, pickNative, pickWeb } = useImagePicker();

// Con voci già presenti si salta la scelta e si va diritti alla revisione.
const phase = ref<"start" | "describe" | "loading" | "edit">(
  props.initialItems?.length ? "edit" : "start",
);
const items = ref<RecognizedItem[]>(
  props.initialItems?.length ? props.initialItems.map((i) => ({ ...i })) : [],
);
const description = ref("");
const err = ref("");
const loadingLabel = ref("Sto leggendo la foto…");

const inputCls = "bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full";

const fields = [
  { key: "kcal", label: "kcal" },
  { key: "cho", label: "Carb" },
  { key: "pro", label: "Prot" },
  { key: "fat", label: "Gras" },
  { key: "fib", label: "Fibre" },
];

/**
 * Valori di riferimento di ogni voce: quantità di partenza e valori
 * corrispondenti. Il ricalcolo parte sempre da qui, così digitare "5" e poi
 * "50" non accumula errori: ogni battitura riscala dal valore originale.
 */
const bases = ref<Record<number, any>>({});

/** Fotografa i valori attuali come riferimento per i ricalcoli successivi. */
function rebase(i: number) {
  const it = items.value[i];
  if (!it) return;
  const { num, unit } = splitQty(it.qty);
  bases.value[i] = {
    q: normalized(num, unit),
    kcal: +it.kcal || 0, cho: +it.cho || 0, pro: +it.pro || 0,
    fat: +it.fat || 0, fib: +it.fib || 0, alc: +it.alc || 0,
  };
}

function rebaseAll() {
  bases.value = {};
  syncQtyFields();
  items.value.forEach((_, i) => rebase(i));
}

// Ogni volta che la lista cambia composizione (nuove voci da foto, stima,
// ricerca o inserimento manuale) i riferimenti vengono rifotografati: così
// non serve ricordarsi di farlo in ognuno dei punti che la popolano.
watch(
  // Firma della lista: cambia se le voci sono altre, non solo se sono di più.
  () => items.value.map((i) => `${i.name}|${i.qty}`).join("§"),
  (now, before) => {
    // Se cambia solo la quantità di una voce già presente non si rifotografa
    // nulla: sarebbe proprio il valore che stiamo riscalando.
    const sameCount = (before ?? "").split("§").length === now.split("§").length;
    const sameNames =
      sameCount &&
      (before ?? "").split("§").map((x) => x.split("|")[0]).join() ===
        now.split("§").map((x) => x.split("|")[0]).join();
    if (sameNames) return;
    nextTick(rebaseAll);
  },
  { immediate: true },
);

/** Unità selezionabili e fattore di conversione verso l'unità base. */
const UNITS = ["g", "mg", "kg", "ml", "cl", "l", "pz"] as const;
const FACTOR: Record<string, number> = { g: 1, mg: 0.001, kg: 1000, ml: 1, cl: 10, l: 1000, pz: 1 };

const qtyNum = ref<Record<number, string>>({});
const qtyUnit = ref<Record<number, string>>({});

/**
 * Divide "500 g" nelle sue due parti per i campi separati.
 * Si cerca prima un numero seguito da un'unità vera (con confine di parola,
 * altrimenti la "l" di "lattina" verrebbe letta come litri); solo se non
 * esiste si ripiega sul primo numero presente.
 */
function splitQty(text: string) {
  const t = String(text || "");
  const withUnit = t.match(/(\d+(?:[.,]\d+)?)\s*(kg|mg|grammi|gr|g|ml|cl|l|pz)\b/i);
  const plain = t.match(/(\d+(?:[.,]\d+)?)/);

  const raw = withUnit?.[1] ?? plain?.[1] ?? "";
  const num = raw ? raw.replace(",", ".") : "";

  let unit = (withUnit?.[2] || "g").toLowerCase();
  if (unit === "gr" || unit === "grammi") unit = "g";
  return { num, unit };
}

function syncQtyFields() {
  items.value.forEach((it, i) => {
    const { num, unit } = splitQty(it.qty);
    qtyNum.value[i] = num;
    qtyUnit.value[i] = unit;
  });
}

/** Quantità espressa nell'unità base, per confrontare valori con unità diverse. */
function normalized(num: string, unit: string) {
  const n = Number(num);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n * (FACTOR[unit] ?? 1);
}

/** Riscala i valori della voce sulla nuova quantità, partendo dal riferimento. */
function rescaleFrom(i: number) {
  const it = items.value[i];
  const b = bases.value[i];
  if (!it) return;

  it.qty = `${qtyNum.value[i] ?? ""} ${qtyUnit.value[i] ?? "g"}`.trim();
  if (!b?.q) return;

  const now = normalized(qtyNum.value[i] ?? "", qtyUnit.value[i] ?? "g");
  if (!now) return; // campo vuoto: i valori restano quelli

  const k = now / b.q;
  it.kcal = Math.round(b.kcal * k);
  it.cho = Math.round(b.cho * k);
  it.pro = Math.round(b.pro * k);
  it.fat = Math.round(b.fat * k);
  it.fib = Math.round(b.fib * k);
  it.alc = Math.round(b.alc * k);
}

function onQtyInput(i: number, value: string) {
  qtyNum.value[i] = value;
  rescaleFrom(i);
}
function onUnitChange(i: number, unit: string) {
  qtyUnit.value[i] = unit;
  rescaleFrom(i);
}

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

async function fromPhoto(source: "camera" | "gallery") {
  err.value = "";

  // Nell'app installata "Scatta" apre direttamente la fotocamera; nel browser
  // si ripiega sull'input file, che con `capture` propone comunque lo scatto.
  let photo: { data: string; media: string } | null = null;
  try {
    if (isNative()) {
      photo = await pickNative(source);
    } else {
      const file = await pickWeb(source);
      if (file) photo = await fileToBase64(file);
    }
  } catch {
    photo = null;
  }
  if (!photo) return; // annullato o permesso negato: si resta dove si è

  loadingLabel.value = "Sto leggendo la foto…";
  phase.value = "loading";
  try {
    const list = await recognizeBase64(photo.data, photo.media);
    items.value = list.length ? list : [blank()];
  } catch (e: any) {
    err.value = messageOf(e, "Non sono riuscito a leggere la foto. Cerca l'alimento o inserisci i dati a mano.");
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

function startSearch() {
  items.value = [];
  err.value = "";
  phase.value = "edit";
}

/** Aggiunge alla lista un alimento scelto dalla ricerca. */
function onSearchPick(item: RecognizedItem) {
  items.value.push(item);
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
  // Le voci vengono salvate insieme ai totali: senza, riaprire il pasto
  // mostrerebbe solo un nome e dei numeri aggregati.
  emit("save", { name, ...sum.value, items: items.value.map((i) => ({ ...i })) });
}
</script>
