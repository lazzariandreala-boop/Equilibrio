<template>
  <div class="space-y-4">
    <MealsTabs />

    <!-- Cerca e Scopri / Preferite -->
    <div class="flex items-center gap-2">
      <div class="flex-1 flex items-center gap-2 rounded-full"
        style="padding: 9px 14px; background: var(--card); border: 1px solid var(--line)">
        <Search :size="17" class="text-faint shrink-0" />
        <input v-model="q" type="search" placeholder="Cerca una ricetta o un ingrediente"
          class="bg-transparent text-ink w-full outline-none" style="font-size: 0.9375rem" aria-label="Cerca ricette" />
        <button v-if="q" class="tap text-faint" aria-label="Cancella ricerca" @click="q = ''"><X :size="16" /></button>
      </div>
    </div>

    <div class="flex gap-2">
      <button v-for="t in viewTabs" :key="t.id" class="tap flex-1 rounded-full"
        style="padding: 10px; font-size: 0.875rem; font-weight: 600"
        :style="view === t.id
          ? { background: 'var(--food-soft)', color: 'var(--food)', border: '1.5px solid var(--food)' }
          : { background: 'transparent', color: 'var(--dim)', border: '1.5px solid var(--line)' }"
        :aria-pressed="view === t.id" @click="setView(t.id)">
        {{ t.label }}<span v-if="t.id === 'preferite' && settings.recipeFavorites.length"> · {{ settings.recipeFavorites.length }}</span>
      </button>
    </div>

    <!-- Filtro attivo o ricerca: elenco dei risultati -->
    <template v-if="filtering">
      <div class="flex flex-wrap items-center gap-2">
        <span v-for="c in activeChips" :key="c.key" class="rounded-full flex items-center gap-1.5"
          style="padding: 6px 8px 6px 12px; background: var(--food-soft); color: var(--food); font-size: 0.8125rem; font-weight: 600">
          {{ c.label }}
          <button class="tap rounded-full flex items-center justify-center" style="width: 22px; height: 22px"
            :aria-label="`Togli il filtro ${c.label}`" @click="clearFilter(c.key)"><X :size="14" /></button>
        </span>
        <span class="text-dim" style="font-size: 0.8125rem">{{ results.length }} ricette</span>
      </div>

      <div v-if="results.length" class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr))">
        <RecipeCard v-for="r in results" :key="r.id" :recipe="r" wide />
      </div>
      <EmptyState v-else tone="food" title="Nessuna ricetta trovata"
        :subtitle="view === 'preferite' ? 'Tocca la stella su una ricetta per ritrovarla qui.' : 'Prova con un altro ingrediente o togli qualche filtro.'" />
    </template>

    <!-- Scopri -->
    <template v-else>
      <section v-if="today">
        <h2 class="display text-ink" style="font-size: 1.25rem; font-weight: 800; margin-bottom: 10px">⭐ Ricetta del giorno</h2>
        <RecipeCard :recipe="today" wide />
      </section>

      <section>
        <h2 class="display text-ink" style="font-size: 1.25rem; font-weight: 800; margin-bottom: 10px">Scegli il tuo pasto</h2>
        <div class="grid grid-cols-2 gap-2.5">
          <button v-for="(m, k) in MEAL_LABEL" :key="k" class="tap rounded-4xl flex items-center justify-between text-left"
            style="padding: 14px; background: var(--card); border: 1px solid var(--line)" @click="setFilter('pasto', k)">
            <span class="flex items-center gap-2.5">
              <span style="font-size: 1.6rem" aria-hidden="true">{{ m.emoji }}</span>
              <span class="text-ink" style="font-weight: 700; font-size: 0.9375rem">{{ m.label }}</span>
            </span>
            <ArrowRight :size="17" class="text-faint" />
          </button>
        </div>
      </section>

      <section v-for="c in collections" :key="c.id">
        <div class="flex items-center justify-between" style="margin-bottom: 10px">
          <h2 class="display text-ink" style="font-size: 1.25rem; font-weight: 800">{{ c.emoji }} {{ c.label }}</h2>
          <button class="tap text-food" style="font-weight: 700; font-size: 0.875rem" @click="setFilter('raccolta', c.id)">Altro</button>
        </div>
        <div class="flex gap-3 overflow-x-auto no-scrollbar" style="margin: 0 -16px; padding: 0 16px 4px">
          <RecipeCard v-for="r in c.items" :key="r.id" :recipe="r" />
        </div>
      </section>

      <section>
        <h2 class="display text-ink" style="font-size: 1.25rem; font-weight: 800; margin-bottom: 10px">Scegli la tua dieta</h2>
        <div class="grid grid-cols-3 gap-2.5">
          <button v-for="(d, k) in DIET_LABEL" :key="k" class="tap rounded-4xl flex flex-col items-center justify-center gap-1.5"
            style="padding: 14px 6px; background: var(--card); border: 1px solid var(--line); min-height: 6.25rem"
            @click="setFilter('dieta', k)">
            <span style="font-size: 1.9rem" aria-hidden="true">{{ d.emoji }}</span>
            <span class="text-ink text-center" style="font-weight: 700; font-size: 0.8125rem; line-height: 1.2">{{ d.label }}</span>
          </button>
        </div>
      </section>

      <section>
        <h2 class="display text-ink" style="font-size: 1.25rem; font-weight: 800; margin-bottom: 10px">In tutto il mondo</h2>
        <div class="flex gap-2 flex-wrap">
          <button v-for="(c, k) in CUISINE_LABEL" :key="k" class="tap rounded-full flex items-center gap-1.5"
            style="padding: 9px 14px; background: var(--card); border: 1px solid var(--line); font-size: 0.875rem; font-weight: 600"
            @click="setFilter('cucina', k)">
            <span aria-hidden="true">{{ c.emoji }}</span> <span class="text-ink">{{ c.label }}</span>
            <span class="text-faint tabular">{{ countBy('cucina', k) }}</span>
          </button>
        </div>
      </section>

      <p class="text-faint text-center" style="font-size: 0.75rem; padding-bottom: 6px">
        {{ RECIPES.length }} ricette disponibili anche offline. Valori per porzione, stimati sulle tabelle CREA.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Search, X, ArrowRight } from "lucide-vue-next";
import { RECIPES, COLLECTIONS, MEAL_LABEL, DIET_LABEL, CUISINE_LABEL, recipeOfTheDay, mealForNow, type Recipe } from "~/utils/recipes";
import { useSettingsStore } from "~/stores/settings";

const settings = useSettingsStore();
const route = useRoute();
const router = useRouter();

const viewTabs = [
  { id: "scopri", label: "Scopri" },
  { id: "preferite", label: "Le mie preferite" },
] as const;

// I filtri vivono nell'indirizzo: tornando indietro dal dettaglio si ritrova la stessa lista.
type Key = "pasto" | "dieta" | "cucina" | "raccolta";
const view = computed(() => (route.query.vista === "preferite" ? "preferite" : "scopri"));
const q = ref(String(route.query.q ?? ""));
watch(q, (v) => router.replace({ query: { ...route.query, q: v || undefined } }));

function setView(v: string) {
  router.replace({ query: { ...route.query, vista: v === "preferite" ? "preferite" : undefined } });
}
function setFilter(k: Key, v: string) {
  router.push({ query: { ...route.query, [k]: v } });
}
function clearFilter(k: string) {
  if (k === "q") q.value = "";
  else router.replace({ query: { ...route.query, [k]: undefined } });
}

const f = computed(() => ({
  pasto: route.query.pasto as string | undefined,
  dieta: route.query.dieta as string | undefined,
  cucina: route.query.cucina as string | undefined,
  raccolta: route.query.raccolta as string | undefined,
}));

const filtering = computed(
  () => view.value === "preferite" || !!q.value.trim() || Object.values(f.value).some(Boolean),
);

const activeChips = computed(() => {
  const chips: { key: string; label: string }[] = [];
  if (f.value.pasto) chips.push({ key: "pasto", label: MEAL_LABEL[f.value.pasto as keyof typeof MEAL_LABEL]?.label ?? f.value.pasto });
  if (f.value.dieta) chips.push({ key: "dieta", label: DIET_LABEL[f.value.dieta as keyof typeof DIET_LABEL]?.label ?? f.value.dieta });
  if (f.value.cucina) chips.push({ key: "cucina", label: CUISINE_LABEL[f.value.cucina as keyof typeof CUISINE_LABEL]?.label ?? f.value.cucina });
  if (f.value.raccolta) chips.push({ key: "raccolta", label: COLLECTIONS.find((c) => c.id === f.value.raccolta)?.label ?? f.value.raccolta });
  if (q.value.trim()) chips.push({ key: "q", label: `“${q.value.trim()}”` });
  return chips;
});

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function matches(r: Recipe, key: Key, v: string) {
  if (key === "pasto") return r.meals.includes(v as any);
  if (key === "dieta") {
    // Vegana è anche vegetariana e pescetariana; vegetariana è anche pescetariana.
    if (v === "vegetariana") return r.diets.includes("vegetariana") || r.diets.includes("vegana");
    if (v === "pescetariana") return ["pescetariana", "vegetariana", "vegana"].some((d) => r.diets.includes(d as any));
    return r.diets.includes(v as any);
  }
  if (key === "cucina") return r.cuisine === v;
  return COLLECTIONS.find((c) => c.id === v)?.test(r) ?? true;
}

const results = computed(() => {
  let list = view.value === "preferite"
    ? settings.recipeFavorites.map((id) => RECIPES.find((r) => r.id === id)).filter(Boolean) as Recipe[]
    : RECIPES;
  for (const k of ["pasto", "dieta", "cucina", "raccolta"] as Key[]) {
    const v = f.value[k];
    if (v) list = list.filter((r) => matches(r, k, v));
  }
  const term = norm(q.value.trim());
  if (term) list = list.filter((r) => norm(r.name).includes(term) || r.ing.some((i) => norm(i[0]).includes(term)));
  return list;
});

const countBy = (k: Key, v: string) => RECIPES.filter((r) => matches(r, k, v)).length;

// Ricetta del giorno scelta fra quelle adatte all'ora: a cena non propone il porridge.
const today = computed(() => {
  const pool = RECIPES.filter((r) => r.meals.includes(mealForNow()));
  return recipeOfTheDay(pool.length ? pool : RECIPES);
});

const collections = computed(() =>
  COLLECTIONS.map((c) => ({ ...c, items: RECIPES.filter(c.test).slice(0, 8) })).filter((c) => c.items.length >= 2),
);
</script>
