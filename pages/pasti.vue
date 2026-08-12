<template>
  <div class="space-y-3">
    <DayNav />

    <HeroCard tone="food" :icon="Flame" :title="day.isToday ? 'Pasti di oggi' : 'Pasti del giorno'"
      :value="day.totals.kcal" unit="kcal" :caption="`obiettivo ${settings.goals.kcal} kcal`"
      :progress="(day.totals.kcal / settings.goals.kcal) * 100" :stats="macros">
      <div v-if="day.totals.alc > 0" class="text-center"
        style="color: rgba(255,255,255,.85); font-size: 12px; margin-top: 14px">
        Contiene alcol — registrato anche in Alcol
      </div>
    </HeroCard>

    <button class="tap w-full rounded-full py-3.5 font-semibold flex items-center justify-center gap-2.5 grad-food rise cta-glow-food" style="color: #fff; font-size: 15.5px; animation-delay: 70ms"
      @click="open()">
      <Camera :size="19" /> Scatta o aggiungi un pasto
    </button>

    <EmptyState v-if="today.meals.length === 0" tone="food"
      :title="day.isToday ? 'Nessun pasto registrato' : 'Nessun pasto in questo giorno'"
      subtitle="Inizia con una foto: ci pensa l'app a stimare i valori."
      :actions="quick" style="animation-delay: 130ms" @action="open" />

    <div v-else class="space-y-2.5 rise" style="animation-delay: 130ms">
      <div v-for="(m, i) in today.meals" :key="i" class="rounded-4xl overflow-hidden"
        :style="{ background: 'var(--card)', border: '1px solid var(--line)', boxShadow: 'var(--tile-shadow)' }">
        <button class="tap w-full text-left flex items-center gap-3" style="padding: 13px 14px" @click="edit(i)">
          <div class="rounded-2xl flex items-center justify-center shrink-0"
            style="width: 40px; height: 40px; background: var(--food-soft)">
            <UtensilsCrossed :size="19" color="var(--food)" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate" style="font-weight: 600; font-size: 15px">{{ m.name }}</div>
            <div class="text-dim tabular" style="font-size: 12.5px">
              {{ m.kcal }} kcal · C {{ m.cho }} · P {{ m.pro }} · G {{ m.fat }} · F {{ m.fib ?? 0 }}
              <span v-if="m.alc > 0" class="text-alcohol"> · alc {{ m.alc }} g</span>
            </div>
          </div>
          <Pencil :size="16" class="text-faint shrink-0" />
        </button>

        <!-- Voci del pasto: si vede subito cosa lo compone. -->
        <div v-if="m.items?.length" style="padding: 0 14px 12px">
          <div v-for="(it, j) in m.items" :key="j" class="flex items-center justify-between gap-3"
            style="padding: 6px 0; border-top: 1px solid var(--line)">
            <span class="text-dim truncate" style="font-size: 12.5px">
              {{ it.name }}<span v-if="it.qty" class="text-faint"> · {{ it.qty }}</span>
            </span>
            <span class="text-faint tabular shrink-0" style="font-size: 12px">{{ it.kcal }} kcal</span>
          </div>
        </div>

        <div class="flex" style="padding: 0 8px 8px">
          <button class="tap flex-1 rounded-2xl py-2 text-dim" style="font-size: 12.5px" @click="edit(i)">
            Modifica
          </button>
          <button class="tap flex-1 rounded-2xl py-2 text-faint" style="font-size: 12.5px" @click="day.removeMeal(i)">
            Elimina
          </button>
        </div>
      </div>
    </div>

    <BottomSheet v-model="mealOpen" :title="sheetTitle">
      <!-- La chiave forza il rimontaggio: senza, riaprendo resterebbero le voci precedenti -->
      <MealCapture :key="editing ?? 'nuovo'" :initial-items="editingItems" @save="onMeal" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { Camera, Flame, Salad, Wheat, Dna, Droplet, Leaf, Coffee, Sun, Moon, UtensilsCrossed, Pencil } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { estimateLocally } from "~/utils/foods";
import { useSettingsStore } from "~/stores/settings";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);
const mealOpen = ref(false);
const sheetTitle = ref("Aggiungi un pasto");

const macros = computed(() => [
  { icon: Wheat, value: day.totals.cho, unit: "g", label: "Carboidrati" },
  { icon: Dna, value: day.totals.pro, unit: "g", label: "Proteine" },
  { icon: Droplet, value: day.totals.fat, unit: "g", label: "Grassi" },
  { icon: Leaf, value: day.totals.fib, unit: "g", label: "Fibre" },
]);

// Scorciatoie: aprire già sapendo di che pasto si tratta evita un passaggio.
const quick = [
  { id: "Colazione", label: "Colazione", icon: Coffee },
  { id: "Pranzo", label: "Pranzo", icon: Sun },
  { id: "Cena", label: "Cena", icon: Moon },
];

const editing = ref<number | null>(null);
const editingItems = ref<any[] | null>(null);

function open(kind?: string) {
  editing.value = null;
  editingItems.value = null;
  sheetTitle.value = kind ? `Aggiungi: ${kind.toLowerCase()}` : "Aggiungi un pasto";
  mealOpen.value = true;
}

/** Riapre un pasto salvato con le sue voci, pronte da correggere. */
function edit(i: number) {
  const m = today.value.meals[i];
  editing.value = i;
  // I pasti salvati prima di questa versione non hanno le voci: si ricostruisce
  // una voce unica coi totali, così restano comunque modificabili.
  editingItems.value = m.items?.length ? m.items.map((it: any) => ({ ...it })) : splitLegacy(m);
  sheetTitle.value = "Modifica il pasto";
  mealOpen.value = true;
}

/**
 * I pasti salvati prima che l'app conservasse le singole voci hanno solo il
 * nome unito e i totali. Qui si ricostruiscono le voci separate: i totali
 * registrati vengono ripartiti usando la tabella alimenti come peso, così
 * ogni alimento diventa modificabile senza che la somma cambi.
 */
function splitLegacy(m: any) {
  const names = String(m.name || "")
    .split(/,\s*/)
    .map((n) => n.trim())
    .filter(Boolean);

  const totals = { kcal: m.kcal, cho: m.cho, pro: m.pro, fat: m.fat, fib: m.fib ?? 0, alc: m.alc ?? 0 };
  if (names.length <= 1) {
    return [{ name: m.name || "Pasto", qty: "", ...totals }];
  }

  // Peso di ogni voce: stima locale se disponibile, altrimenti parti uguali.
  const guesses = names.map((n) => estimateLocally(n)[0] ?? null);
  const weights = guesses.map((g) => (g?.kcal && g.kcal > 0 ? g.kcal : 0));
  const totalW = weights.reduce((a, b) => a + b, 0);
  const share = weights.map((w) => (totalW > 0 ? w / totalW : 1 / names.length));

  const items = names.map((name, i) => ({
    name,
    qty: guesses[i]?.qty ?? "",
    kcal: Math.round(totals.kcal * share[i]),
    cho: Math.round(totals.cho * share[i]),
    pro: Math.round(totals.pro * share[i]),
    fat: Math.round(totals.fat * share[i]),
    fib: Math.round(totals.fib * share[i]),
    alc: Math.round(totals.alc * share[i]),
  }));

  // Gli arrotondamenti non devono alterare il totale registrato: la
  // differenza si assegna all'ultima voce.
  for (const k of ["kcal", "cho", "pro", "fat", "fib", "alc"] as const) {
    const diff = (totals as any)[k] - items.reduce((a, it: any) => a + it[k], 0);
    if (diff) (items[items.length - 1] as any)[k] += diff;
  }
  return items;
}

function onMeal(m: any) {
  if (editing.value !== null) day.updateMeal(editing.value, m);
  else day.addMeal(m);
  mealOpen.value = false;
  editing.value = null;
  editingItems.value = null;
}
</script>
