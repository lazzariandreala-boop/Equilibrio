<template>
  <div>
    <!-- START -->
    <div v-if="phase === 'start'" class="space-y-3">
      <p class="text-dim" style="font-size: 14px">
        Fotografa il piatto o il bicchiere: provo a riconoscerlo e calcolare le calorie. Potrai correggere tutto a mano.
      </p>
      <input ref="fileRef" type="file" accept="image/*" capture="environment" class="hidden" @change="onPick" />
      <button
        class="bg-food w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
        style="color: var(--on-food)"
        @click="fileRef?.click()">
        <Camera :size="18" /> Scegli o scatta una foto
      </button>
      <button
        class="bg-raised text-ink w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
        @click="startManual">
        <Pencil :size="16" /> Inserisci a mano
      </button>
    </div>

    <!-- LOADING -->
    <div v-else-if="phase === 'loading'" class="flex flex-col items-center py-10 gap-3">
      <Sparkles :size="28" class="text-food animate-pulse" />
      <span class="text-dim">Sto leggendo la foto…</span>
    </div>

    <!-- EDIT -->
    <div v-else class="space-y-4">
      <p v-if="err" class="text-alcohol" style="font-size: 13px">{{ err }}</p>

      <div v-for="(it, i) in items" :key="i" class="border border-line rounded-3xl p-3 space-y-2">
        <div class="flex gap-2">
          <div class="flex-1" style="flex: 2">
            <div class="text-faint" style="font-size: 11px">Nome</div>
            <input v-model="it.name" :class="inputCls" />
          </div>
          <div style="flex: 1">
            <div class="text-faint" style="font-size: 11px">Quantità</div>
            <input v-model="it.qty" :class="inputCls" />
          </div>
          <button class="text-faint self-end pb-2" @click="items.splice(i, 1)"><X :size="18" /></button>
        </div>
        <div class="flex gap-2">
          <div class="flex-1">
            <div class="text-faint" style="font-size: 11px">kcal</div>
            <input v-model.number="it.kcal" type="number" inputmode="numeric" class="tabular" :class="inputCls" />
          </div>
          <div class="flex-1">
            <div class="text-faint" style="font-size: 11px">Carb</div>
            <input v-model.number="it.cho" type="number" inputmode="numeric" class="tabular" :class="inputCls" />
          </div>
          <div class="flex-1">
            <div class="text-faint" style="font-size: 11px">Prot</div>
            <input v-model.number="it.pro" type="number" inputmode="numeric" class="tabular" :class="inputCls" />
          </div>
          <div class="flex-1">
            <div class="text-faint" style="font-size: 11px">Gras</div>
            <input v-model.number="it.fat" type="number" inputmode="numeric" class="tabular" :class="inputCls" />
          </div>
          <div class="flex-1">
            <div class="text-faint" style="font-size: 11px">Alc g</div>
            <input v-model.number="it.alc" type="number" inputmode="numeric" class="tabular" :class="inputCls" />
          </div>
        </div>
      </div>

      <button class="text-dim flex items-center gap-1" style="font-size: 14px" @click="addBlank">
        <Plus :size="16" /> Aggiungi voce
      </button>

      <div class="bg-raised rounded-2xl p-3 text-dim tabular" style="font-size: 13px">
        Totale: <b class="text-ink">{{ sum.kcal }} kcal</b> · C {{ sum.cho }} · P {{ sum.pro }} · G {{ sum.fat }}
        <span v-if="sum.alc > 0"> · alcol {{ sum.alc }}g</span>
      </div>

      <button
        class="bg-food w-full py-3 rounded-2xl font-semibold"
        style="color: var(--on-food)"
        @click="save">
        Salva nel diario
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Camera, Pencil, Sparkles, X, Plus } from "lucide-vue-next";
import type { RecognizedItem } from "~/composables/useRecognition";

const emit = defineEmits<{ save: [any] }>();
const { recognize } = useRecognition();

const phase = ref<"start" | "loading" | "edit">("start");
const items = ref<RecognizedItem[]>([]);
const err = ref("");
const fileRef = ref<HTMLInputElement | null>(null);

const inputCls =
  "bg-raised border border-line text-ink rounded-xl px-2.5 py-2 w-full";

const blank = (): RecognizedItem => ({ name: "", qty: "", kcal: 0, cho: 0, pro: 0, fat: 0, alc: 0 });

const sum = computed(() =>
  items.value.reduce(
    (a, it) => ({
      kcal: a.kcal + (+it.kcal || 0),
      cho: a.cho + (+it.cho || 0),
      pro: a.pro + (+it.pro || 0),
      fat: a.fat + (+it.fat || 0),
      alc: a.alc + (+it.alc || 0),
    }),
    { kcal: 0, cho: 0, pro: 0, fat: 0, alc: 0 },
  ),
);

async function onPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  phase.value = "loading";
  err.value = "";
  try {
    const list = await recognize(file);
    items.value = list.length ? list : [blank()];
  } catch (e: any) {
    err.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      "Non sono riuscito a leggere la foto. Puoi inserire i dati a mano.";
    items.value = [blank()];
  }
  phase.value = "edit";
}

function startManual() {
  items.value = [blank()];
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
