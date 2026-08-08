<template>
  <div class="space-y-4">
    <DayNav />

    <div class="rise rounded-5xl overflow-hidden grad-move relative" style="box-shadow: 0 14px 34px var(--move-glow)">
      <div class="absolute rounded-full" style="width: 180px; height: 180px; right: -60px; top: -70px; background: rgba(255,255,255,.14)" />
      <div class="relative p-6 text-center">
        <div style="color: rgba(255,255,255,.82); font-size: 13px; font-weight: 500">
          {{ day.isToday ? "Movimento di oggi" : "Movimento del giorno" }}
        </div>
        <div class="display tabular" style="color: #fff; font-size: 52px; font-weight: 800; line-height: 1.05; margin: 4px 0 2px">
          {{ day.moveMin }}<span style="font-size: 20px; font-weight: 600; opacity: .8"> min</span>
        </div>
        <div style="color: rgba(255,255,255,.78); font-size: 13px">obiettivo {{ settings.goals.moveMin }} min</div>
        <div class="rounded-full overflow-hidden mt-4" style="height: 8px; background: rgba(255,255,255,.28)">
          <div class="fill" style="background: #fff" :style="{ width: pct }" />
        </div>
      </div>
    </div>

    <AppCard class="rise" style="animation-delay: 80ms">
      <div class="display mb-3" style="font-weight: 700; font-size: 17px">Registra un giro in bici</div>
      <div class="flex items-center gap-3 mb-3">
        <button class="tap bg-raised text-ink rounded-2xl p-3.5" aria-label="Meno 5 minuti" @click="min = Math.max(5, min - 5)">
          <Minus :size="17" />
        </button>
        <span class="flex-1 text-center display tabular" style="font-size: 34px; font-weight: 700">{{ min }}′</span>
        <button class="tap bg-raised text-ink rounded-2xl p-3.5" aria-label="Più 5 minuti" @click="min += 5">
          <Plus :size="17" />
        </button>
      </div>
      <button class="tap w-full py-3.5 rounded-3xl font-semibold flex items-center justify-center gap-2 grad-move"
        style="color: #fff; font-size: 15px" @click="day.addMove({ type: 'Bici', min })">
        <Bike :size="18" /> Salva il giro
      </button>
    </AppCard>

    <div class="rise" style="animation-delay: 140ms">
      <div class="display px-1 mb-1" style="font-weight: 700; font-size: 17px">Movimenti sicuri</div>
      <p class="text-dim px-1 mb-3" style="font-size: 13px">Adatti a chi ha problemi al disco — niente corsa.</p>
      <div class="space-y-2.5">
        <AppCard v-for="(s, i) in safe" :key="i" pad="p-3.5">
          <div class="flex items-start gap-3">
            <div class="rounded-2xl grad-move flex items-center justify-center shrink-0" style="width: 40px; height: 40px">
              <component :is="s.icon" :size="19" color="#fff" />
            </div>
            <div class="flex-1 min-w-0">
              <div style="font-weight: 600; font-size: 15px">{{ s.title }}</div>
              <div class="text-dim" style="font-size: 13px; line-height: 1.45">{{ s.desc }}</div>
            </div>
            <button class="tap text-move p-1.5 rounded-xl shrink-0" style="background: var(--move-soft)" aria-label="Aggiungi 10 minuti"
              @click="day.addMove({ type: s.title, min: 10 })">
              <Plus :size="18" />
            </button>
          </div>
        </AppCard>
      </div>
    </div>

    <div v-if="today.moves.length" class="rise" style="animation-delay: 200ms">
      <div class="display px-1 mb-2.5" style="font-weight: 700; font-size: 17px">Registrati oggi</div>
      <div class="space-y-2">
        <AppCard v-for="(m, i) in today.moves" :key="i" pad="p-3.5">
          <div class="flex items-center justify-between">
            <span class="text-ink truncate" style="font-size: 14px; font-weight: 500">{{ m.type }}</span>
            <span class="text-move tabular" style="font-size: 14px; font-weight: 600">{{ m.min }}′</span>
          </div>
        </AppCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Minus, Plus, Bike, StretchHorizontal, Dumbbell, Footprints } from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);
const min = ref(20);
const pct = computed(() => `${Math.min(100, (day.moveMin / settings.goals.moveMin) * 100)}%`);

const safe = [
  { title: "Giro in bici tranquillo", desc: "Schiena dritta, sella regolata: la bici scarica la colonna meglio della corsa.", icon: Bike },
  { title: "Mobilità del bacino", desc: "5′ a terra: ginocchia al petto alternate, gatto-mucca lento.", icon: StretchHorizontal },
  { title: "Plank dolce sui gomiti", desc: "3 × 20″, schiena neutra. Niente carico assiale.", icon: Dumbbell },
  { title: "Camminata breve in piano", desc: "10–15′ senza forzare. Stop appena tira.", icon: Footprints },
];
</script>
