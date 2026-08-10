<template>
  <div class="space-y-3.5">
    <DayNav />

    <HeroCard tone="alcohol" :icon="ShieldCheck" :title="day.isToday ? 'Senza alcol' : 'Senza alcol, a quel giorno'"
      :value="day.streak" :unit="day.streak === 1 ? 'giorno' : 'giorni'" :caption="caption" :stats="stats">
      <!-- ultimi 14 giorni: pieno = pulito -->
      <div class="flex gap-1 justify-center" style="margin-top: 16px">
        <span v-for="(clean, i) in dots" :key="i" class="rounded-full"
          :style="{ width: '8px', height: '24px', background: clean ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.26)' }" />
      </div>
    </HeroCard>

    <div class="grid grid-cols-2 gap-2.5 rise" style="animation-delay: 70ms">
      <button class="tap rounded-4xl p-4 flex flex-col items-start gap-2.5"
        style="background: var(--move-soft); border: 1px solid var(--line)" @click="day.cleanDay()">
        <div class="rounded-2xl grad-move flex items-center justify-center" style="width: 40px; height: 40px">
          <Check :size="20" color="#fff" />
        </div>
        <span class="text-ink text-left" style="font-weight: 600; font-size: 14.5px">Giornata pulita</span>
      </button>
      <button class="tap rounded-4xl p-4 flex flex-col items-start gap-2.5"
        style="background: var(--water-soft); border: 1px solid var(--line)" @click="urgeOpen = true">
        <div class="rounded-2xl grad-water flex items-center justify-center" style="width: 40px; height: 40px">
          <Wind :size="20" color="#fff" />
        </div>
        <span class="text-ink text-left" style="font-weight: 600; font-size: 14.5px">Ho voglia</span>
      </button>
    </div>

    <button class="tap w-full rounded-full py-4 font-semibold flex items-center justify-center gap-2.5 grad-alcohol rise"
      style="color: #fff; font-size: 16px; box-shadow: 0 12px 30px var(--alcohol-glow); animation-delay: 120ms"
      @click="drinkOpen = true">
      <Plus :size="19" /> Registra cosa ho bevuto
    </button>

    <EmptyState v-if="!today.drinks.length" tone="alcohol" :icon="Sparkles" style="animation-delay: 170ms"
      :title="day.isToday ? 'Nessuna bevanda oggi' : 'Nessuna bevanda in questo giorno'"
      subtitle="La striscia cresce da sola: basta lasciarla correre." />

    <div v-else class="rise" style="animation-delay: 170ms">
      <div class="display mb-2.5 px-1" style="font-weight: 700; font-size: 17px">
        {{ day.isToday ? "Oggi" : "Quel giorno" }} · <span class="tabular text-alcohol">{{ day.alcGrams }} g</span> di alcol
      </div>
      <div class="space-y-2">
        <AppCard v-for="(d, i) in today.drinks" :key="i" pad="p-3.5">
          <div class="flex items-center justify-between gap-3">
            <span class="text-ink truncate" style="font-size: 14px; font-weight: 500">{{ d.name }}</span>
            <div class="flex items-center gap-2.5 shrink-0">
              <span class="text-alcohol tabular" style="font-size: 13px; font-weight: 600">{{ d.alc }} g</span>
              <button class="text-faint p-1" aria-label="Rimuovi" @click="day.removeDrink(i)"><X :size="15" /></button>
            </div>
          </div>
        </AppCard>
      </div>
    </div>

    <BottomSheet v-model="urgeOpen" title="Aspetta un attimo">
      <UrgeSurf @water="day.addWater(250); urgeOpen = false" />
    </BottomSheet>
    <BottomSheet v-model="drinkOpen" title="Cosa hai bevuto">
      <DrinkLog @log="onDrink" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { Check, Wind, Plus, X, ShieldCheck, Sparkles, Wine, CalendarCheck } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { lastNDays, keyToDate } from "~/utils/date";

const day = useDayStore();
const today = computed(() => day.today);
const urgeOpen = ref(false);
const drinkOpen = ref(false);

const dots = computed(() =>
  lastNDays(14, keyToDate(day.date)).reverse().map((k) => day.summaryOf(k).alcGrams === 0),
);
const caption = computed(() =>
  today.value.drinks.length ? `${day.alcGrams} g di alcol in questo giorno` : "nessuna bevanda in questo giorno",
);
const stats = computed(() => [
  { icon: CalendarCheck, value: dots.value.filter(Boolean).length, label: "puliti su 14" },
  { icon: Wine, value: today.value.drinks.length, label: "bevande nel giorno" },
]);

function onDrink(d: { name: string; alc: number; kcal: number }) {
  day.logDrink(d);
  drinkOpen.value = false;
}
</script>
