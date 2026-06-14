<template>
  <div class="space-y-4">
    <AppCard class="!p-5">
      <div class="flex items-baseline justify-between mb-3">
        <span class="text-dim" style="font-size: 14px">Movimento di oggi</span>
        <span class="tabular" style="font-size: 28px; font-weight: 700">{{ day.moveMin }}′</span>
      </div>
      <div class="bg-line rounded-full overflow-hidden" style="height: 8px">
        <div class="bg-move h-full" :style="{ width: pct }" />
      </div>
    </AppCard>

    <AppCard>
      <div style="font-weight: 600" class="mb-2.5">Registra un giro in bici</div>
      <div class="flex items-center gap-3 mb-3">
        <button class="bg-raised text-ink rounded-xl p-3" @click="min = Math.max(5, min - 5)"><Minus :size="16" /></button>
        <span class="flex-1 text-center tabular" style="font-size: 26px; font-weight: 700">{{ min }}′</span>
        <button class="bg-raised text-ink rounded-xl p-3" @click="min += 5"><Plus :size="16" /></button>
      </div>
      <button class="bg-move-soft text-move w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2" @click="day.addMove({ type: 'Bici', min })">
        <Bike :size="18" /> Salva il giro
      </button>
    </AppCard>

    <div>
      <div class="text-dim" style="font-size: 13px; margin: 4px 0 10px">Adatti a chi ha problemi al disco — niente corsa</div>
      <div class="space-y-3">
        <AppCard v-for="(s, i) in safe" :key="i" class="!p-3.5">
          <div class="flex items-start gap-3">
            <div class="bg-move-soft text-move rounded-xl p-2"><component :is="s.icon" :size="18" /></div>
            <div class="flex-1">
              <div style="font-weight: 600">{{ s.title }}</div>
              <div class="text-dim" style="font-size: 13px">{{ s.desc }}</div>
            </div>
            <button class="text-move p-1" @click="day.addMove({ type: s.title, min: 10 })"><Plus :size="20" /></button>
          </div>
        </AppCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Minus, Plus, Bike, Heart, Activity, Wind } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";

const day = useDayStore();
const settings = useSettingsStore();
const min = ref(20);
const pct = computed(() => `${Math.min(100, (day.moveMin / settings.goals.moveMin) * 100)}%`);

const safe = [
  { title: "Giro in bici tranquillo", desc: "Schiena dritta, sella regolata: la bici scarica la colonna meglio della corsa.", icon: Bike },
  { title: "Mobilità del bacino", desc: "5′ a terra: ginocchia al petto alternate, gatto-mucca lento.", icon: Heart },
  { title: "Plank dolce sui gomiti", desc: "3 × 20″, schiena neutra. Niente carico assiale.", icon: Activity },
  { title: "Camminata breve in piano", desc: "10–15′ senza forzare. Stop appena tira.", icon: Wind },
];
</script>
