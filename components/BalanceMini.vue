<template>
  <div class="rounded-4xl relative overflow-hidden h-full"
    :style="{ background: 'var(--card)', border: '1px solid var(--line)', boxShadow: 'var(--tile-shadow)' }">
    <svg class="absolute pointer-events-none" viewBox="0 0 120 90" aria-hidden="true"
      style="right: -6px; top: -4px; width: 118px; height: 90px; opacity: .35">
      <circle cx="92" cy="26" r="13" fill="var(--food)" opacity=".35" />
      <path d="M56 66c11-13 21-17 31-13s16 3 24-5 18-6 18-6v24H56Z" fill="var(--food)" opacity=".22" />
    </svg>

    <div class="relative flex flex-col h-full" style="padding: 13px">
      <div class="flex items-center gap-2">
        <div class="rounded-full flex items-center justify-center" style="width: 28px; height: 28px; background: var(--food-soft)">
          <Sprout :size="15" color="var(--food)" />
        </div>
        <span class="text-dim" style="font-size: 12.5px; font-weight: 600">
          {{ day.isToday ? "Oggi" : "Il giorno" }}
        </span>
      </div>

      <div class="mt-auto" style="padding-top: 12px">
        <div class="display" style="color: var(--food); font-size: 30px; font-weight: 800; line-height: 1.05">
          {{ onTrack }}<span class="text-dim" style="font-size: 16px; font-weight: 700">/4</span>
        </div>
        <div class="text-dim" style="font-size: 12.5px; margin-top: 1px">
          {{ onTrack === 1 ? "abitudine avviata" : "abitudini avviate" }}
        </div>
      </div>

      <!-- Quattro tacche: dicono quali voci sono a posto senza dover leggere -->
      <div class="flex gap-1.5" style="margin-top: 10px">
        <span v-for="(ok, i) in marks" :key="i" class="flex-1 rounded-full"
          :style="{ height: '5px', background: ok ? `var(--${tones[i]})` : 'var(--line)' }" />
      </div>

      <div class="text-faint" style="font-size: 11.5px; margin-top: 8px; line-height: 1.3">{{ message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sprout } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";

const props = defineProps<{ marks: boolean[]; message: string }>();
const day = useDayStore();
const tones = ["water", "move", "food", "alcohol"];
const onTrack = computed(() => props.marks.filter(Boolean).length);
</script>
