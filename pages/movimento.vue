<template>
  <div class="space-y-4">
    <DayNav />

    <!-- hero -->
    <div class="rise rounded-5xl overflow-hidden grad-move relative" style="box-shadow: 0 14px 34px var(--move-glow)">
      <div class="absolute rounded-full" style="width: 180px; height: 180px; right: -60px; top: -70px; background: rgba(255,255,255,.14)" />
      <div class="relative p-6 text-center">
        <div style="color: rgba(255,255,255,.82); font-size: 13px; font-weight: 500">
          {{ day.isToday ? "Movimento di oggi" : "Movimento del giorno" }}
        </div>
        <div class="display tabular" style="color: #fff; font-size: 50px; font-weight: 800; line-height: 1.05; margin: 4px 0 2px">
          {{ day.moveMin }}<span style="font-size: 19px; font-weight: 600; opacity: .8"> min</span>
        </div>
        <div style="color: rgba(255,255,255,.78); font-size: 13px">
          obiettivo {{ settings.goals.moveMin }} min<span v-if="burned > 0"> · ~{{ burned }} kcal bruciate</span>
        </div>
        <div class="rounded-full overflow-hidden mt-4" style="height: 8px; background: rgba(255,255,255,.28)">
          <div class="fill" style="background: #fff" :style="{ width: pct }" />
        </div>
      </div>
    </div>

    <!-- scelta attività -->
    <div class="rise" style="animation-delay: 80ms">
      <div class="display px-1 mb-2.5" style="font-weight: 700; font-size: 17px">Aggiungi un'attività</div>
      <div class="grid grid-cols-4 gap-2">
        <button v-for="a in ACTIVITIES" :key="a.id" class="tap rounded-3xl flex flex-col items-center justify-center gap-1.5"
          style="padding: 12px 4px"
          :style="{ background: tint(a.color, 0.13), border: `1px solid ${tint(a.color, 0.22)}` }"
          @click="pick(a)">
          <component :is="icons[a.icon]" :size="21" :color="a.color" />
          <span class="text-ink text-center leading-tight" style="font-size: 10.5px; font-weight: 600">{{ a.name }}</span>
        </button>
      </div>
    </div>

    <!-- registrate oggi -->
    <div v-if="today.moves.length" class="rise" style="animation-delay: 140ms">
      <div class="display px-1 mb-2.5" style="font-weight: 700; font-size: 17px">
        {{ day.isToday ? "Registrate oggi" : "Registrate in questo giorno" }}
      </div>
      <div class="space-y-2">
        <AppCard v-for="(m, i) in today.moves" :key="i" pad="p-3.5">
          <div class="flex items-center gap-3">
            <div class="rounded-2xl flex items-center justify-center shrink-0" style="width: 38px; height: 38px"
              :style="{ background: colorOf(m) }">
              <component :is="icons[iconOf(m)]" :size="18" color="#fff" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="truncate" style="font-weight: 600; font-size: 15px">{{ m.type }}</div>
              <div class="text-dim tabular" style="font-size: 12.5px">
                {{ m.min }} min<span v-if="m.kcal"> · ~{{ m.kcal }} kcal</span>
              </div>
            </div>
            <button class="tap text-faint p-2 rounded-xl bg-raised shrink-0" aria-label="Elimina" @click="day.removeMove(i)">
              <Trash2 :size="15" />
            </button>
          </div>
        </AppCard>
      </div>
    </div>

    <div v-else class="rise text-center" style="padding: 12px 24px; animation-delay: 140ms">
      <p class="text-dim" style="font-size: 14px; line-height: 1.5">
        {{ day.isToday
          ? "Niente ancora oggi. Anche dieci minuti di camminata contano."
          : "Nessuna attività registrata in questo giorno." }}
      </p>
    </div>

    <!-- consigli per la schiena -->
    <AppCard class="rise" style="animation-delay: 200ms">
      <div class="flex items-start gap-3">
        <ShieldCheck :size="18" class="text-move shrink-0" style="margin-top: 2px" />
        <p class="text-dim" style="font-size: 13px; line-height: 1.5">
          Le attività col bollino verde nella scheda sono a basso impatto sulla colonna. La corsa non lo è: se la schiena tira, meglio bici o nuoto.
        </p>
      </div>
    </AppCard>

    <!-- scheda durata -->
    <BottomSheet :model-value="!!chosen" :title="chosen?.name || ''" @update:model-value="chosen = null">
      <div v-if="chosen">
        <div v-if="chosen.id === 'altro'" class="mb-4">
          <div class="text-faint mb-1.5" style="font-size: 12px">Che attività hai fatto?</div>
          <input v-model="customName" placeholder="Es. arrampicata, padel…"
            class="bg-card border border-line text-ink rounded-2xl px-3 py-3 w-full" />
        </div>

        <div v-if="chosen.note" class="rounded-2xl px-3.5 py-2.5 mb-4 flex items-start gap-2"
          :style="{ background: tint(chosen.color, 0.13) }">
          <component :is="chosen.safe ? ShieldCheck : AlertTriangle" :size="15"
            :color="chosen.safe ? chosen.color : 'var(--food)'" style="margin-top: 2px; flex-shrink: 0" />
          <span class="text-dim" style="font-size: 12.5px; line-height: 1.4">{{ chosen.note }}</span>
        </div>

        <div class="display tabular text-center" :style="{ fontSize: '54px', fontWeight: 800, color: chosen.color, lineHeight: 1 }">
          {{ min }}<span class="text-dim" style="font-size: 18px; font-weight: 600"> min</span>
        </div>
        <div class="text-faint text-center tabular mb-5" style="font-size: 13px; margin-top: 4px">
          ≈ {{ estimateKcal(chosen.met, min, settings.profile.weightKg) }} kcal bruciate
        </div>

        <div class="flex items-center gap-3 mb-4">
          <button class="tap bg-raised text-ink rounded-2xl p-3.5" aria-label="Meno" @click="min = Math.max(5, min - 5)">
            <Minus :size="18" />
          </button>
          <input type="range" min="5" max="180" step="5" v-model.number="min" class="flex-1" :style="{ accentColor: chosen.color }" />
          <button class="tap bg-raised text-ink rounded-2xl p-3.5" aria-label="Più" @click="min = Math.min(180, min + 5)">
            <Plus :size="18" />
          </button>
        </div>

        <div class="grid grid-cols-4 gap-2 mb-5">
          <button v-for="p in [15, 30, 45, 60]" :key="p" class="tap rounded-2xl py-2.5 font-semibold tabular"
            style="font-size: 14px" :class="min === p ? '' : 'bg-raised text-dim'"
            :style="min === p ? { background: chosen.color, color: '#fff' } : {}" @click="min = p">
            {{ p }}′
          </button>
        </div>

        <button class="tap w-full py-3.5 rounded-3xl font-semibold" :style="{ background: chosen.color, color: '#fff', fontSize: '15px' }" @click="save">
          Salva attività
        </button>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import {
  Minus, Plus, Trash2, ShieldCheck, AlertTriangle,
  Bike, Footprints, Rabbit, Waves, Dumbbell, Target, Trophy, PersonStanding,
  Mountain, Snowflake, Sailboat, Music, Sprout, Flame, Move3d, CirclePlus,
} from "lucide-vue-next";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";
import { ACTIVITIES, estimateKcal, findActivity, tint, type Activity } from "~/utils/activities";

const day = useDayStore();
const settings = useSettingsStore();
const today = computed(() => day.today);

const icons: Record<string, any> = {
  Bike, Footprints, Rabbit, Waves, Dumbbell, Target, Trophy, PersonStanding,
  Mountain, Snowflake, Sailboat, Music, Sprout, Flame, Move3d, CirclePlus,
};

const chosen = ref<Activity | null>(null);
const min = ref(30);
const customName = ref("");

const pct = computed(() => `${Math.min(100, (day.moveMin / settings.goals.moveMin) * 100)}%`);
const burned = computed(() => today.value.moves.reduce((a, m) => a + (m.kcal || 0), 0));

function iconOf(m: any) {
  return findActivity(m.activityId || "")?.icon || "Footprints";
}
function colorOf(m: any) {
  return findActivity(m.activityId || "")?.color || "var(--move)";
}

function pick(a: Activity) {
  chosen.value = a;
  min.value = 30;
  customName.value = "";
}

function save() {
  if (!chosen.value) return;
  const a = chosen.value;
  const name = a.id === "altro" && customName.value.trim() ? customName.value.trim() : a.name;
  day.addMove({
    type: name,
    min: min.value,
    activityId: a.id,
    kcal: estimateKcal(a.met, min.value, settings.profile.weightKg),
  });
  chosen.value = null;
}
</script>
