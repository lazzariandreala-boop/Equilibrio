<template>
  <div class="space-y-3">
    <div v-for="(tip, i) in tips" :key="i" class="bg-raised rounded-2xl p-3.5 text-ink" style="font-size: 14px">
      {{ tip }}
    </div>
    <button
      class="bg-water-soft text-water w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
      @click="$emit('water')">
      <Droplet :size="18" /> Bevo un bicchiere d'acqua invece
    </button>
    <p class="text-faint" style="font-size: 12px; text-align: center">
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
