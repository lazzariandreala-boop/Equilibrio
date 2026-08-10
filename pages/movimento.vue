<template>
  <div class="space-y-4">
    <DayNav />

    <HeroCard tone="move" :icon="ActivityIcon" :title="day.isToday ? 'Movimento di oggi' : 'Movimento del giorno'"
      :value="day.moveMin" unit="min" :caption="`obiettivo ${settings.goals.moveMin} min`"
      :progress="(day.moveMin / settings.goals.moveMin) * 100" :stats="stats" />

    <button class="tap w-full rounded-full py-3.5 font-semibold flex items-center justify-center gap-2.5 grad-move rise cta-glow-move"
      style="color: #fff; font-size: 15.5px; animation-delay: 70ms" @click="pickerOpen = true">
      <Plus :size="19" /> Aggiungi un'attività
    </button>

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

    <EmptyState v-else tone="move" style="animation-delay: 140ms"
      :title="day.isToday ? 'Niente ancora oggi' : 'Nessuna attività in questo giorno'"
      subtitle="Anche dieci minuti di camminata contano." />

    <!-- elenco delle attività, cercabile -->
    <BottomSheet v-model="pickerOpen" title="Che attività hai fatto?">
      <div class="relative mb-3">
        <Search :size="17" class="absolute text-faint" style="left: 13px; top: 50%; transform: translateY(-50%)" />
        <input v-model="query" placeholder="Cerca fra le attività…"
          class="bg-card border border-line text-ink rounded-2xl w-full"
          style="padding: 11px 12px 11px 38px" />
      </div>

      <div class="space-y-1.5" style="max-height: 52vh; overflow-y: auto">
        <button v-for="a in filtered" :key="a.id" class="tap w-full text-left rounded-3xl flex items-center gap-3"
          style="padding: 11px 12px; background: var(--raised)" @click="pick(a)">
          <div class="rounded-2xl flex items-center justify-center shrink-0" style="width: 38px; height: 38px"
            :style="{ background: tint(a.color, 0.16) }">
            <component :is="icons[a.icon]" :size="19" :color="a.color" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-ink" style="font-weight: 600; font-size: 15px">{{ a.name }}</div>
            <div class="text-faint truncate" style="font-size: 11.5px">{{ a.note || `${a.met} MET` }}</div>
          </div>
          <ShieldCheck v-if="a.safe" :size="16" class="text-move shrink-0" />
        </button>

        <p v-if="!filtered.length" class="text-faint text-center" style="font-size: 13px; padding: 18px 12px">
          Nessuna attività trovata. Scegli <strong class="text-ink">Altro</strong> e scrivi il nome che preferisci.
        </p>
      </div>
    </BottomSheet>

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
  Minus, Plus, Trash2, ShieldCheck, AlertTriangle, Timer, Search,
  Activity as ActivityIcon,
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

const pickerOpen = ref(false);
const query = ref("");
const chosen = ref<Activity | null>(null);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return ACTIVITIES;
  return ACTIVITIES.filter((a) => a.name.toLowerCase().includes(q) || a.note?.toLowerCase().includes(q));
});
const min = ref(30);
const customName = ref("");

const pct = computed(() => `${Math.min(100, (day.moveMin / settings.goals.moveMin) * 100)}%`);
const burned = computed(() => today.value.moves.reduce((a, m) => a + (m.kcal || 0), 0));

const stats = computed(() => [
  { icon: Timer, value: today.value.moves.length, label: "attività" },
  { icon: Flame, value: burned.value, unit: "kcal", label: "stimate bruciate" },
]);

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
  pickerOpen.value = false;
  query.value = "";
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
