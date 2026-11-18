<template>
  <div class="rounded-4xl" style="padding: 16px; background: var(--card); border: 1px solid var(--line); box-shadow: var(--tile-shadow)">
    <div class="flex items-center justify-between" style="margin-bottom: 10px">
      <button class="tap rounded-full flex items-center justify-center" style="width: 40px; height: 40px" aria-label="Mese precedente" @click="shift(-1)">
        <ChevronLeft :size="20" class="text-water" />
      </button>
      <div class="display text-ink" style="font-size: 1.0625rem; font-weight: 800; text-transform: capitalize">{{ monthLabel }}</div>
      <button class="tap rounded-full flex items-center justify-center" style="width: 40px; height: 40px" aria-label="Mese successivo"
        :disabled="isCurrentMonth" :style="isCurrentMonth ? { opacity: 0.3 } : {}" @click="shift(1)">
        <ChevronRight :size="20" class="text-water" />
      </button>
    </div>

    <div class="grid grid-cols-7 text-center text-dim" style="font-size: 0.8125rem; font-weight: 700; margin-bottom: 4px">
      <span v-for="(d, i) in ['L', 'M', 'M', 'G', 'V', 'S', 'D']" :key="i">{{ d }}</span>
    </div>
    <div class="grid grid-cols-7 gap-y-2 text-center">
      <span v-for="n in lead" :key="'b' + n" />
      <div v-for="c in cells" :key="c.key" class="flex flex-col items-center gap-1">
        <span class="tabular" :class="c.today ? 'text-water' : 'text-ink'" style="font-size: 0.875rem" :style="c.today ? { fontWeight: 800 } : {}">{{ c.n }}</span>
        <span class="rounded-full flex items-center justify-center" style="width: 28px; height: 28px"
          :style="c.future ? { background: 'transparent' } : c.green ? { background: 'var(--move)' } : c.logged ? { background: 'var(--food-soft)', border: '1.5px solid var(--food)' } : { background: 'var(--raised)' }"
          :aria-label="c.future ? '' : c.green ? 'giorno verde' : c.logged ? 'registrato, fuori obiettivo' : 'nessun dato'">
          <Check v-if="c.green" :size="16" color="#fff" />
        </span>
      </div>
    </div>

    <div class="grid grid-cols-3 text-center" style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line)">
      <div>
        <Flame :size="20" class="mx-auto" color="var(--food)" />
        <div class="text-dim" style="font-size: 0.75rem; margin-top: 2px">Serie in corso</div>
        <div class="display tabular text-ink" style="font-size: 1.125rem; font-weight: 800">{{ streak }} {{ streak === 1 ? "giorno" : "giorni" }}</div>
      </div>
      <div>
        <BadgeCheck :size="20" class="mx-auto" color="var(--move)" />
        <div class="text-dim" style="font-size: 0.75rem; margin-top: 2px">Giorni verdi</div>
        <div class="display tabular text-ink" style="font-size: 1.125rem; font-weight: 800">{{ greenCount }} / {{ cells.filter((c) => !c.future).length }}</div>
      </div>
      <div>
        <Scale :size="20" class="mx-auto" color="var(--water)" />
        <div class="text-dim" style="font-size: 0.75rem; margin-top: 2px">Peso nel mese</div>
        <div class="display tabular text-ink" style="font-size: 1.125rem; font-weight: 800">{{ weightDelta }}</div>
      </div>
    </div>
    <p class="text-faint" style="font-size: 0.75rem; line-height: 1.4; margin-top: 12px">
      Un giorno è verde quando hai registrato i pasti e le calorie stanno fra il 60% e il 105% dell'obiettivo ({{ settings.goals.kcal }} kcal).
      Arancione se hai registrato ma sei fuori.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, Check, Flame, BadgeCheck, Scale } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";
import { todayKey } from "~/utils/date";

const day = useDayStore();
const settings = useSettingsStore();
const ref0 = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const now = new Date();
const isCurrentMonth = computed(() => ref0.value.getFullYear() === now.getFullYear() && ref0.value.getMonth() === now.getMonth());
const monthLabel = computed(() => ref0.value.toLocaleDateString("it-IT", { month: "long", year: "numeric" }));
function shift(n: number) {
  ref0.value = new Date(ref0.value.getFullYear(), ref0.value.getMonth() + n, 1);
}

function isGreen(key: string) {
  const s = day.summaryOf(key);
  if (!s.meals) return false;
  const g = settings.goals.kcal || 2000;
  return s.kcal >= g * 0.6 && s.kcal <= g * 1.05;
}

// Lunedì come primo giorno della settimana.
const lead = computed(() => (ref0.value.getDay() + 6) % 7);
const cells = computed(() => {
  const y = ref0.value.getFullYear();
  const m = ref0.value.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  const tk = todayKey();
  return Array.from({ length: days }, (_, i) => {
    const key = todayKey(new Date(y, m, i + 1));
    const s = day.summaryOf(key);
    return { key, n: i + 1, today: key === tk, future: key > tk, logged: s.hasData, green: key <= tk && isGreen(key) };
  });
});
const greenCount = computed(() => cells.value.filter((c) => c.green).length);

// Serie: giorni consecutivi con qualcosa registrato, fino a oggi (oggi conta anche se ancora vuoto).
const streak = computed(() => {
  let n = 0;
  const d = new Date();
  if (!day.summaryOf(todayKey(d)).hasData) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 3650; i++) {
    if (!day.summaryOf(todayKey(d)).hasData) break;
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
});

const weightDelta = computed(() => {
  const prefix = todayKey(ref0.value).slice(0, 7);
  const w = settings.weights.filter((x) => x.d.startsWith(prefix));
  if (w.length < 2) return "—";
  const d = Math.round((w[w.length - 1].kg - w[0].kg) * 10) / 10;
  return `${d > 0 ? "+" : d < 0 ? "−" : "±"}${Math.abs(d).toLocaleString("it-IT", { minimumFractionDigits: 1 })} kg`;
});
</script>
