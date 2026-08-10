<template>
  <div class="space-y-4">
    <DayNav />

    <!-- hero: la striscia è il dato che conta -->
    <div class="rise rounded-5xl overflow-hidden grad-alcohol relative" style="box-shadow: 0 14px 34px var(--alcohol-glow)">
      <div class="absolute rounded-full" style="width: 190px; height: 190px; left: -70px; bottom: -86px; background: rgba(255,255,255,.13)" />
      <div class="relative p-6 text-center">
        <div style="color: rgba(255,255,255,.82); font-size: 13px; font-weight: 500">
          {{ day.isToday ? "Senza alcol" : "Senza alcol, a quel giorno" }}
        </div>
        <div class="display tabular" style="color: #fff; font-size: 60px; font-weight: 800; line-height: 1.02; margin: 2px 0">
          {{ day.streak }}
        </div>
        <div style="color: rgba(255,255,255,.85); font-size: 14px">
          {{ day.streak === 1 ? "giorno" : "giorni" }} di fila
        </div>
      </div>
    </div>

    <!-- azioni -->
    <div class="grid grid-cols-2 gap-3 rise" style="animation-delay: 80ms">
      <button class="tap rounded-4xl p-4 flex flex-col items-start gap-2" style="background: var(--move-soft)" @click="day.cleanDay()">
        <div class="rounded-2xl grad-move flex items-center justify-center" style="width: 38px; height: 38px">
          <Check :size="19" color="#fff" />
        </div>
        <span class="text-ink" style="font-weight: 600; font-size: 15px; text-align: left">Giornata pulita</span>
      </button>
      <button class="tap rounded-4xl p-4 flex flex-col items-start gap-2" style="background: var(--water-soft)" @click="urgeOpen = true">
        <div class="rounded-2xl grad-water flex items-center justify-center" style="width: 38px; height: 38px">
          <Wind :size="19" color="#fff" />
        </div>
        <span class="text-ink" style="font-weight: 600; font-size: 15px; text-align: left">Ho voglia</span>
      </button>
    </div>

    <button class="tap w-full rounded-4xl py-3.5 font-semibold flex items-center justify-center gap-2 grad-alcohol rise"
      style="color: #fff; font-size: 15px; box-shadow: 0 12px 28px var(--alcohol-glow); animation-delay: 140ms"
      @click="drinkOpen = true">
      <Plus :size="18" /> Registra cosa ho bevuto
    </button>

    <!-- elenco di oggi -->
    <div v-if="today.drinks.length" class="rise" style="animation-delay: 200ms">
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

    <p v-else class="text-faint text-center rise" style="font-size: 13px; padding: 8px 20px; line-height: 1.5; animation-delay: 200ms">
      {{ day.isToday
        ? "Nessuna bevanda registrata oggi. La striscia cresce da sola, basta lasciarla correre."
        : "Nessuna bevanda registrata in questo giorno." }}
    </p>

    <BottomSheet v-model="urgeOpen" title="Aspetta un attimo">
      <UrgeSurf @water="day.addWater(250); urgeOpen = false" />
    </BottomSheet>
    <BottomSheet v-model="drinkOpen" title="Cosa hai bevuto">
      <DrinkLog @log="onDrink" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { Check, Wind, Plus, X } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";

const day = useDayStore();
const today = computed(() => day.today);
const urgeOpen = ref(false);
const drinkOpen = ref(false);

function onDrink(d: { name: string; alc: number; kcal: number }) {
  day.logDrink(d);
  drinkOpen.value = false;
}
</script>
