<template>
  <div class="flex items-center justify-between bg-card border border-line rounded-2xl px-1.5 py-1.5">
    <button class="text-dim p-2 rounded-xl" aria-label="Giorno precedente" @click="day.shiftDate(-1)">
      <ChevronLeft :size="20" />
    </button>
    <button class="flex flex-col items-center leading-tight px-3" @click="day.goToday()">
      <span class="text-ink" style="font-weight: 600; font-size: 15px; text-transform: capitalize">{{ label }}</span>
      <span v-if="!day.isToday" class="text-faint" style="font-size: 11px">tocca per tornare a oggi</span>
    </button>
    <button
      class="p-2 rounded-xl"
      :class="day.isToday ? 'text-faint opacity-40' : 'text-dim'"
      :disabled="day.isToday"
      aria-label="Giorno successivo"
      @click="day.shiftDate(1)">
      <ChevronRight :size="20" />
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
