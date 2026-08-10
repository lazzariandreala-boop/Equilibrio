<template>
  <div class="flex items-center justify-between rounded-4xl px-2 py-2"
    style="background: var(--raised); border: 1px solid var(--line)">
    <button class="tap p-2 rounded-2xl" aria-label="Giorno precedente" @click="day.shiftDate(-1)">
      <ChevronLeft :size="20" :color="`var(--${tone})`" />
    </button>
    <button class="tap flex flex-col items-center leading-tight px-3" @click="day.goToday()">
      <span class="text-ink" style="font-weight: 700; font-size: 15.5px; text-transform: capitalize">{{ label }}</span>
      <span v-if="!day.isToday" class="text-faint" style="font-size: 11px">tocca per tornare a oggi</span>
    </button>
    <button class="tap p-2 rounded-2xl" :disabled="day.isToday" :style="day.isToday ? { opacity: 0.3 } : {}"
      aria-label="Giorno successivo" @click="day.shiftDate(1)">
      <ChevronRight :size="20" :color="`var(--${tone})`" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { fmtIT, keyToDate } from "~/utils/date";

const day = useDayStore();
const label = computed(() => (day.isToday ? "Oggi" : fmtIT(keyToDate(day.date))));

const route = useRoute();
const tone = computed(() => {
  const p = route.path;
  if (p.startsWith("/pasti")) return "food";
  if (p.startsWith("/movimento")) return "move";
  if (p.startsWith("/alcol")) return "alcohol";
  if (p.startsWith("/acqua")) return "water";
  return "water";
});
</script>
