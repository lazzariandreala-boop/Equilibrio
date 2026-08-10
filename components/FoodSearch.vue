<template>
  <div>
    <div class="text-faint mb-1.5" style="font-size: 12px">Cerca un alimento</div>
    <div class="relative">
      <input v-model="q" :class="inputCls" placeholder="Es. pasta, yogurt greco, Saikebon…" @input="onType" />
      <Loader2 v-if="busy" :size="16" class="absolute text-faint animate-spin"
        style="right: 12px; top: 50%; transform: translateY(-50%)" />
    </div>

    <div v-if="results.length" class="mt-2 space-y-1.5" style="max-height: 240px; overflow-y: auto">
      <button v-for="(r, i) in results" :key="i" class="tap w-full text-left rounded-2xl px-3 py-2.5"
        style="background: var(--raised)" @click="choose(r)">
        <div class="text-ink truncate" style="font-size: 14px; font-weight: 600">{{ r.name }}</div>
        <div class="text-dim tabular" style="font-size: 11.5px">
          per 100 g · {{ r.kcal }} kcal · C {{ r.cho }} · P {{ r.pro }} · G {{ r.fat }} · F {{ r.fib }}
          <span class="text-faint"> · {{ r.source }}</span>
        </div>
      </button>
    </div>

    <p v-else-if="searched && !busy" class="text-faint" style="font-size: 12.5px; margin-top: 8px">
      Nessun risultato. Puoi comunque scrivere il nome e inserire i valori a mano.
    </p>

    <!-- porzione -->
    <div v-if="picked" class="rounded-3xl p-3.5 mt-3" style="background: var(--food-soft)">
      <div class="text-ink truncate" style="font-size: 14px; font-weight: 600">{{ picked.name }}</div>
      <div class="flex items-center gap-2 mt-2.5">
        <input v-model.number="grams" type="number" inputmode="numeric" class="tabular flex-1" :class="inputCls" />
        <span class="text-dim" style="font-size: 14px">grammi</span>
        <button class="tap grad-food rounded-2xl px-4 py-2.5 font-semibold" style="color: #fff; font-size: 14px"
          @click="confirm">
          Aggiungi
        </button>
      </div>
      <div class="text-dim tabular" style="font-size: 12px; margin-top: 8px">
        = {{ scaled.kcal }} kcal · C {{ scaled.cho }} · P {{ scaled.pro }} · G {{ scaled.fat }} · F {{ scaled.fib }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { estimateLocally, FOODS } from "~/utils/foods";

const emit = defineEmits<{ pick: [any] }>();
const base = useRuntimeConfig().public.apiBase || "";
const inputCls = "bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full";

interface Result { name: string; kcal: number; cho: number; pro: number; fat: number; fib: number; source: string }

const q = ref("");
const results = ref<Result[]>([]);
const busy = ref(false);
const searched = ref(false);
const picked = ref<Result | null>(null);
const grams = ref(100);

let timer: any;
function onType() {
  picked.value = null;
  clearTimeout(timer);
  // 250 ms di attesa: non ha senso interrogare le fonti a ogni tasto
  timer = setTimeout(search, 250);
}

/** Risultati immediati dalla tabella locale, poi arricchiti dalle fonti online. */
function localMatches(term: string): Result[] {
  const t = term.toLowerCase();
  return FOODS.filter((f) => f.match.some((m) => m.includes(t) || t.includes(m)))
    .slice(0, 5)
    .map((f) => ({
      name: f.name, kcal: f.kcal, cho: f.cho, pro: f.pro, fat: f.fat, fib: f.fib, source: "tabella locale",
    }));
}

async function search() {
  const term = q.value.trim();
  if (term.length < 2) {
    results.value = [];
    searched.value = false;
    return;
  }
  results.value = localMatches(term);
  busy.value = true;
  try {
    const res = await $fetch<{ alimenti: Result[] }>(`${base}/api/foods`, { params: { q: term } });
    const online = res.alimenti || [];
    if (online.length) results.value = [...localMatches(term), ...online];
  } catch {
    // resta quello che offre la tabella locale
  }
  busy.value = false;
  searched.value = true;
}

const scaled = computed(() => {
  const f = picked.value;
  const k = (grams.value || 0) / 100;
  if (!f) return { kcal: 0, cho: 0, pro: 0, fat: 0, fib: 0 };
  return {
    kcal: Math.round(f.kcal * k), cho: Math.round(f.cho * k), pro: Math.round(f.pro * k),
    fat: Math.round(f.fat * k), fib: Math.round(f.fib * k),
  };
});

function choose(r: Result) {
  picked.value = r;
  const local = FOODS.find((f) => f.name === r.name);
  grams.value = local?.portion ?? 100;
}

function confirm() {
  if (!picked.value) return;
  emit("pick", {
    name: picked.value.name,
    qty: `${grams.value} g`,
    ...scaled.value,
    alc: 0,
  });
  picked.value = null;
  q.value = "";
  results.value = [];
  searched.value = false;
}
</script>
