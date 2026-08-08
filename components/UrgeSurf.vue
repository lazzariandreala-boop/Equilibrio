<template>
  <div class="space-y-3">
    <div v-for="(tip, i) in tips" :key="i" class="rounded-3xl p-4 flex gap-3" style="background: var(--raised)">
      <span class="display tabular shrink-0" :style="{ color: `var(--water)`, fontWeight: 700, fontSize: '15px', lineHeight: 1.5 }">
        {{ i + 1 }}
      </span>
      <p class="text-ink" style="font-size: 14px; line-height: 1.5">{{ tip }}</p>
    </div>

    <button class="tap grad-water w-full py-3.5 rounded-3xl font-semibold flex items-center justify-center gap-2"
      style="color: #fff; font-size: 15px" @click="$emit('water')">
      <Droplet :size="18" /> Bevo un bicchiere d'acqua invece
    </button>

    <p class="text-faint text-center" style="font-size: 12.5px; line-height: 1.5">
      Se la voglia è forte e costante ogni giorno, parlarne col medico è la mossa più forte, non la più debole.
    </p>
  </div>
</template>

<script setup lang="ts">
import { Droplet } from "lucide-vue-next";
defineEmits<{ water: [] }>();
const tips = [
  "La voglia è un'onda: sale, tocca il picco e scende. Di solito passa in 15–20 minuti.",
  "Bevi un bicchiere d'acqua fredda o una tisana adesso: spesso è sete o noia, non sete d'alcol.",
  "Cambia stanza o esci 5 minuti. Spezzare il contesto spezza l'automatismo.",
  "Chiediti: cosa sto cercando davvero? Rilassarmi? Riempire un vuoto? Spesso c'è altro sotto.",
];
</script>
