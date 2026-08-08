<template>
  <div class="flex items-center justify-between rounded-3xl px-1.5 py-1.5" style="background: var(--surface-2)">
    <button class="tap text-dim p-2 rounded-2xl" aria-label="Giorno precedente" @click="day.shiftDate(-1)">
      <ChevronLeft :size="19" />
    </button>
    <button class="tap flex flex-col items-center leading-tight px-3" @click="day.goToday()">
      <span class="text-ink" style="font-weight: 600; font-size: 15px; text-transform: capitalize">{{ label }}</span>
      <span v-if="!day.isToday" class="text-faint" style="font-size: 11px">tocca per tornare a oggi</span>
    </button>
    <button class="tap p-2 rounded-2xl" :class="day.isToday ? 'text-faint opacity-40' : 'text-dim'" :disabled="day.isToday"
      aria-label="Giorno successivo" @click="day.shiftDate(1)">
      <ChevronRight :size="19" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { fmtIT, keyToDate } from "~/utils/date";

const day = useDayStore();
const label = computed(() => (day.isToday ? "Oggi" : fmtIT(keyToDate(day.date))));
</script>
