<template>
  <div v-if="mounted && recipe" class="space-y-4" style="padding-bottom: 84px">
    <!-- Copertina -->
    <div class="relative rounded-5xl overflow-hidden flex items-center justify-center"
      :style="{ height: '13rem', background: `linear-gradient(135deg, ${recipe.hue[0]}, ${recipe.hue[1]})` }">
      <span aria-hidden="true" style="font-size: 6.5rem; filter: drop-shadow(0 10px 16px rgba(0,0,0,.28))">{{ recipe.emoji }}</span>
      <button class="tap absolute rounded-full flex items-center justify-center" style="top: 12px; left: 12px; width: 42px; height: 42px; background: rgba(0,0,0,.45)"
        aria-label="Indietro" @click="back"><ChevronLeft :size="22" color="#fff" /></button>
      <div class="absolute flex gap-2" style="top: 12px; right: 12px">
        <button class="tap rounded-full flex items-center justify-center" style="width: 42px; height: 42px; background: rgba(0,0,0,.45)"
          :aria-label="fav ? 'Togli dalle preferite' : 'Aggiungi alle preferite'" :aria-pressed="fav" @click="settings.toggleRecipeFavorite(recipe.id)">
          <Star :size="20" color="#fff" :fill="fav ? '#f6c85f' : 'none'" />
        </button>
        <button class="tap rounded-full flex items-center justify-center" style="width: 42px; height: 42px; background: rgba(0,0,0,.45)"
          aria-label="Condividi la ricetta" @click="share"><Share2 :size="19" color="#fff" /></button>
      </div>
    </div>

    <h1 class="display text-ink" style="font-size: 1.625rem; font-weight: 800; line-height: 1.15">{{ recipe.name }}</h1>

    <div class="grid grid-cols-3 gap-2.5">
      <div v-for="s in stats" :key="s.label" class="rounded-3xl flex flex-col items-center gap-1"
        style="padding: 12px 6px; background: var(--card); border: 1px solid var(--line)">
        <component :is="s.icon" :size="18" class="text-dim" />
        <span class="text-ink tabular" style="font-weight: 700; font-size: 0.9375rem">{{ s.value }}</span>
        <span class="sr-only">{{ s.label }}</span>
      </div>
    </div>

    <p class="text-dim" style="font-size: 0.9375rem; line-height: 1.5">{{ recipe.desc }}</p>

    <div class="flex flex-wrap gap-1.5">
      <span v-for="t in tags" :key="t" class="rounded-full"
        style="padding: 5px 11px; background: var(--raised); border: 1px solid var(--line); font-size: 0.8125rem; font-weight: 600">{{ t }}</span>
    </div>

    <!-- Avvisi per la gravidanza sugli ingredienti -->
    <div v-if="risks.length" class="rounded-3xl space-y-2" style="padding: 12px 14px; background: var(--food-soft)">
      <div class="flex items-center gap-2 text-ink" style="font-weight: 700; font-size: 0.875rem">
        <AlertTriangle :size="16" color="var(--food)" /> In gravidanza
      </div>
      <div v-for="r in risks" :key="r.id + r.food" class="text-dim" style="font-size: 0.8125rem; line-height: 1.4">
        <strong class="text-ink">{{ r.food }}</strong> · {{ r.title }}. {{ r.reason }} {{ r.advice }}
      </div>
    </div>

    <!-- Ingredienti -->
    <section>
      <div class="flex items-end justify-between" style="margin-bottom: 10px">
        <div>
          <h2 class="display text-ink" style="font-size: 1.3125rem; font-weight: 800">Ingredienti</h2>
          <div class="text-dim" style="font-size: 0.875rem">Per {{ serves }} {{ serves === 1 ? "porzione" : "porzioni" }}</div>
        </div>
        <div class="flex gap-2">
          <button class="tap rounded-full flex items-center justify-center bg-raised text-ink" style="width: 44px; height: 44px; border: 1px solid var(--line)"
            aria-label="Una porzione in meno" :disabled="serves <= 1" :style="serves <= 1 ? { opacity: 0.4 } : {}" @click="serves--"><Minus :size="19" /></button>
          <button class="tap rounded-full flex items-center justify-center bg-raised text-ink" style="width: 44px; height: 44px; border: 1px solid var(--line)"
            aria-label="Una porzione in più" @click="serves++"><Plus :size="19" /></button>
        </div>
      </div>
      <div class="rounded-4xl overflow-hidden" style="background: var(--card); border: 1px solid var(--line)">
        <div v-for="(i, n) in recipe.ing" :key="n" class="flex items-center justify-between gap-3"
          style="padding: 12px 14px" :style="n ? { borderTop: '1px solid var(--line)' } : {}">
          <span class="text-ink" style="font-size: 0.9375rem">{{ i[0] }}</span>
          <span class="text-food tabular shrink-0" style="font-size: 0.9375rem; font-weight: 700">{{ formatQty(i, factor) }}</span>
        </div>
      </div>
      <button class="tap w-full rounded-3xl flex items-center justify-center gap-2" style="margin-top: 10px; padding: 13px; background: var(--raised); border: 1px solid var(--line); font-weight: 700; font-size: 0.9375rem"
        @click="toShopping">
        <component :is="shopDone ? Check : ShoppingBasket" :size="18" :color="shopDone ? 'var(--move)' : 'var(--food)'" />
        <span class="text-ink">{{ shopDone ? shopDone : "Aggiungi alla lista della spesa" }}</span>
      </button>
    </section>

    <!-- Istruzioni -->
    <section>
      <h2 class="display text-ink" style="font-size: 1.3125rem; font-weight: 800">Istruzioni</h2>
      <div class="text-dim" style="font-size: 0.875rem; margin-bottom: 10px">Pronto in {{ recipe.min }} minuti</div>
      <ol class="rounded-4xl overflow-hidden" style="background: var(--card); border: 1px solid var(--line)">
        <li v-for="(s, n) in recipe.steps" :key="n" class="flex items-start gap-3" style="padding: 13px 14px"
          :style="n ? { borderTop: '1px solid var(--line)' } : {}">
          <span class="rounded-full flex items-center justify-center shrink-0 tabular"
            style="width: 28px; height: 28px; background: var(--food-soft); color: var(--food); font-weight: 800; font-size: 0.875rem">{{ n + 1 }}</span>
          <span class="text-ink" style="font-size: 0.9375rem; line-height: 1.45">{{ s }}</span>
        </li>
      </ol>
    </section>

    <!-- Valori nutrizionali: tutti visibili, senza abbonamento -->
    <section>
      <h2 class="display text-ink" style="font-size: 1.3125rem; font-weight: 800">Valori nutrizionali</h2>
      <div class="text-dim" style="font-size: 0.875rem; margin-bottom: 10px">Per 1 porzione</div>
      <div class="rounded-4xl" style="background: var(--card); border: 1px solid var(--line); padding: 4px 14px">
        <div v-for="(row, n) in nutrients" :key="row.label" class="flex justify-between"
          :style="{ padding: row.sub ? '4px 0 4px 12px' : '11px 0 5px', borderTop: n && !row.sub ? '1px solid var(--line)' : undefined }">
          <span :class="row.sub ? 'text-dim' : 'text-ink'" :style="{ fontWeight: row.sub ? 400 : 700, fontSize: '0.9375rem' }">{{ row.label }}</span>
          <span class="tabular text-ink" :style="{ fontWeight: row.sub ? 500 : 700, fontSize: '0.9375rem' }">{{ row.value }}</span>
        </div>
      </div>
      <div v-if="access.diabetes" class="rounded-3xl flex items-center gap-3" style="margin-top: 10px; padding: 12px 14px; background: var(--move-soft)">
        <Syringe :size="18" color="var(--move)" class="shrink-0" />
        <span class="text-ink" style="font-size: 0.875rem">
          {{ recipe.cho }} g di carboidrati a porzione · bolo stimato {{ bolus }} unità (rapporto 1:{{ settings.diabetes.icr }})
        </span>
      </div>
    </section>

    <!-- Azioni fisse in basso -->
    <div class="fixed left-0 right-0 flex gap-2.5 recipe-actions" style="padding: 10px 16px; z-index: 30">
      <button class="tap rounded-3xl flex items-center justify-center" style="width: 58px; background: var(--raised); border: 1px solid var(--line)"
        aria-label="Aggiungi gli ingredienti alla spesa" @click="toShopping">
        <ShoppingBasket :size="22" class="text-ink" />
      </button>
      <button class="tap flex-1 rounded-3xl flex items-center justify-center gap-2 grad-food cta-glow-food"
        style="padding: 15px; color: #fff; font-weight: 700; font-size: 1rem" @click="diaryOpen = true">
        <PlusCircle :size="20" /> Aggiungi al diario
      </button>
    </div>

    <BottomSheet v-model="diaryOpen" title="Aggiungi al diario">
      <div class="space-y-4">
        <div class="text-dim" style="font-size: 0.875rem">{{ recipe.name }} · {{ dayLabel }}</div>
        <div>
          <div class="text-faint" style="font-size: 0.75rem; margin-bottom: 6px">Quanto ne hai mangiato?</div>
          <div class="flex gap-2">
            <button v-for="p in [0.5, 1, 1.5, 2]" :key="p" class="tap flex-1 rounded-2xl tabular"
              style="padding: 11px 4px; font-weight: 700"
              :style="eaten === p ? { background: 'var(--food)', color: '#fff' } : { background: 'var(--raised)', border: '1px solid var(--line)' }"
              :aria-pressed="eaten === p" @click="eaten = p">
              {{ p === 0.5 ? "½" : p === 1.5 ? "1 ½" : p }} {{ p > 1 ? "porz." : "porz." }}
            </button>
          </div>
        </div>
        <div class="rounded-3xl" style="padding: 12px 14px; background: var(--food-soft)">
          <div class="text-ink display tabular" style="font-weight: 700">{{ Math.round(recipe.kcal * eaten) }} kcal</div>
          <div class="text-dim tabular" style="font-size: 0.8125rem">
            Carboidrati {{ r1(recipe.cho * eaten) }} g · Proteine {{ r1(recipe.pro * eaten) }} g · Grassi {{ r1(recipe.fat * eaten) }} g · Fibre {{ r1(recipe.fib * eaten) }} g
          </div>
        </div>
        <button class="tap w-full grad-food rounded-3xl" style="padding: 14px; color: #fff; font-weight: 700" @click="addToDiary">
          Salva nel diario
        </button>
      </div>
    </BottomSheet>

    <div v-if="flash" role="status" class="fixed left-1/2 rounded-full text-ink"
      style="transform: translateX(-50%); bottom: 170px; padding: 10px 16px; background: var(--card); border: 1px solid var(--line); box-shadow: var(--tile-shadow); z-index: 40; font-size: 0.875rem; font-weight: 600">
      {{ flash }}
    </div>
  </div>

  <div v-else-if="mounted" class="space-y-4">
    <EmptyState tone="food" title="Ricetta non trovata" subtitle="Potrebbe essere stata rimossa dal ricettario." />
    <NuxtLink to="/ricette" class="tap block text-center text-food" style="font-weight: 700">Torna alle ricette</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeft, Star, Share2, Flame, Timer, ChefHat, Minus, Plus, ShoppingBasket, Check, PlusCircle, AlertTriangle, Syringe,
} from "lucide-vue-next";
import { recipeById, formatQty, aisleOf, MEAL_LABEL, DIET_LABEL, CUISINE_LABEL } from "~/utils/recipes";
import { useSettingsStore } from "~/stores/settings";
import { useDayStore } from "~/stores/day";
import { checkFoods } from "~/utils/pregnancy";
import { suggestBolus } from "~/utils/diabetes";

const route = useRoute();
const router = useRouter();
const settings = useSettingsStore();
const access = useAccess();
const day = useDayStore();

// La pagina è generata statica: il contenuto dipende dall'indirizzo e va mostrato solo nel browser.
const mounted = ref(false);
onMounted(() => (mounted.value = true));

const recipe = computed(() => recipeById(String(route.query.id ?? "")));
const serves = ref(recipe.value?.serves ?? 2);
watch(recipe, (r) => r && (serves.value = r.serves));
const factor = computed(() => (recipe.value ? serves.value / recipe.value.serves : 1));
const fav = computed(() => !!recipe.value && settings.isRecipeFavorite(recipe.value.id));

const r1 = (n: number) => Math.round(n * 10) / 10;

const stats = computed(() => {
  const r = recipe.value!;
  return [
    { icon: Flame, value: `${r.kcal} kcal`, label: "a porzione" },
    { icon: Timer, value: `${r.min} minuti`, label: "di preparazione" },
    { icon: ChefHat, value: r.difficulty, label: "difficoltà" },
  ];
});

const tags = computed(() => {
  const r = recipe.value!;
  return [
    ...r.meals.map((m) => MEAL_LABEL[m].label),
    ...r.diets.map((d) => DIET_LABEL[d].label),
    CUISINE_LABEL[r.cuisine].label,
  ];
});

const risks = computed(() => (access.pregnancy && recipe.value ? checkFoods(recipe.value.ing.map((i) => i[0])) : []));

const nutrients = computed(() => {
  const r = recipe.value!;
  return [
    { label: "Calorie", value: `${r.kcal} kcal` },
    { label: "Proteine", value: `${r.pro} g` },
    { label: "Carboidrati", value: `${r.cho} g` },
    { label: "di cui zuccheri", value: `${r.sugar} g`, sub: true },
    { label: "Fibre", value: `${r.fib} g`, sub: true },
    { label: "Grassi", value: `${r.fat} g` },
  ];
});

const bolus = computed(() => (recipe.value ? suggestBolus({ carbs: recipe.value.cho, params: settings.diabetes }).rounded : 0));

function back() {
  if (window.history.length > 1) router.back();
  else router.push("/ricette");
}

const flash = ref("");
let flashTimer: any;
function notify(msg: string) {
  flash.value = msg;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => (flash.value = ""), 2200);
}

const shopDone = ref("");
function toShopping() {
  const r = recipe.value!;
  const added = settings.addShopping(
    r.ing.map((i) => ({ name: i[0], qty: formatQty(i, factor.value), aisle: aisleOf(i[0]), from: r.name })),
  );
  shopDone.value = added ? `${added} ingredienti aggiunti alla spesa` : "Già tutti nella lista della spesa";
  notify(shopDone.value);
  setTimeout(() => (shopDone.value = ""), 2500);
}

const diaryOpen = ref(false);
const eaten = ref(1);
const dayLabel = computed(() => (day.isToday ? "oggi" : "nel giorno selezionato"));

function addToDiary() {
  const r = recipe.value!;
  const k = eaten.value;
  const item = {
    name: r.name,
    qty: `${k === 0.5 ? "½" : k} ${k > 1 ? "porzioni" : "porzione"}`,
    kcal: Math.round(r.kcal * k),
    cho: r1(r.cho * k),
    pro: r1(r.pro * k),
    fat: r1(r.fat * k),
    fib: r1(r.fib * k),
    alc: 0,
  };
  day.addMeal({ name: r.name, kcal: item.kcal, cho: item.cho, pro: item.pro, fat: item.fat, fib: item.fib, alc: 0, items: [item] });
  diaryOpen.value = false;
  notify(`Aggiunto al diario ${dayLabel.value}`);
}

async function share() {
  const r = recipe.value!;
  const text = [
    r.name,
    `${r.kcal} kcal a porzione · ${r.min} minuti`,
    "",
    `Ingredienti (${serves.value} porzioni):`,
    ...r.ing.map((i) => `• ${i[0]}: ${formatQty(i, factor.value)}`),
    "",
    "Istruzioni:",
    ...r.steps.map((s, n) => `${n + 1}. ${s}`),
    "",
    "Da Equilibrio",
  ].join("\n");
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title: r.name, text, dialogTitle: "Condividi la ricetta" });
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: r.name, text });
      return;
    }
    await navigator.clipboard.writeText(text);
    notify("Ricetta copiata negli appunti");
  } catch {
    /* condivisione annullata */
  }
}
</script>

<style scoped>
.recipe-actions {
  bottom: calc(84px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, var(--surface) 70%, transparent);
}
@media (min-width: 1024px) {
  .recipe-actions {
    bottom: 16px;
    left: 274px;
    max-width: 760px;
  }
}
</style>
