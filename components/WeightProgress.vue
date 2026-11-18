<template>
  <div class="rounded-4xl" style="padding: 16px; background: var(--card); border: 1px solid var(--line); box-shadow: var(--tile-shadow)">
    <div class="text-center text-dim" style="font-size: 0.875rem; font-weight: 600">Il mio peso</div>
    <div class="text-center display tabular text-ink" style="font-size: 2.25rem; font-weight: 800; line-height: 1.15">{{ fmt(current) }} kg</div>

    <!-- Avanzamento dal primo peso registrato verso l'obiettivo -->
    <template v-if="goal">
      <div class="relative" style="margin: 14px 4px 6px; height: 12px; border-radius: 99px; background: var(--raised)">
        <div style="position: absolute; inset: 0 auto 0 0; border-radius: 99px; background: linear-gradient(90deg, var(--move-2), var(--move))"
          :style="{ width: `${progress}%` }" />
        <div class="absolute rounded-full flex items-center justify-center grad-move"
          style="right: -6px; top: 50%; transform: translateY(-50%); width: 30px; height: 30px; box-shadow: 0 0 0 3px var(--card)">
          <Target :size="16" color="#fff" />
        </div>
      </div>
      <div class="text-center text-ink" style="font-size: 0.9375rem; font-weight: 600">Obiettivo {{ fmt(goal) }} kg</div>
      <div class="text-center text-dim tabular" style="font-size: 0.8125rem; margin-top: 2px">
        <template v-if="Math.abs(current - goal) < 0.05">Obiettivo raggiunto! 🎉</template>
        <template v-else>{{ start !== current ? `${signed(current - start)} kg dall'inizio · ` : "" }}mancano {{ fmt(Math.abs(current - goal)) }} kg</template>
      </div>
    </template>
    <button v-else class="tap block mx-auto text-move" style="margin-top: 8px; font-weight: 700; font-size: 0.875rem" @click="editGoal = true">
      Imposta un obiettivo di peso
    </button>

    <!-- Pesata di oggi -->
    <div class="flex items-center gap-2.5" style="margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--line)">
      <button class="tap rounded-full flex items-center justify-center bg-raised text-ink" style="width: 46px; height: 46px; border: 1px solid var(--line)"
        aria-label="Togli 100 grammi" @click="draft = r1(draft - 0.1)"><Minus :size="19" /></button>
      <div class="flex-1 text-center">
        <input v-model.number="draft" type="number" step="0.1" inputmode="decimal" aria-label="Peso di oggi in kg"
          class="bg-transparent text-ink text-center tabular display w-full" style="font-size: 1.5rem; font-weight: 800" />
        <div class="text-faint" style="font-size: 0.75rem">{{ todayLogged ? "peso di oggi salvato" : "peso di oggi" }}</div>
      </div>
      <button class="tap rounded-full flex items-center justify-center bg-raised text-ink" style="width: 46px; height: 46px; border: 1px solid var(--line)"
        aria-label="Aggiungi 100 grammi" @click="draft = r1(draft + 0.1)"><Plus :size="19" /></button>
    </div>
    <div class="flex gap-2" style="margin-top: 10px">
      <button class="tap flex-1 rounded-3xl grad-move" style="padding: 12px; color: #fff; font-weight: 700" @click="save">
        {{ saved ? "Salvato ✓" : "Salva il peso" }}
      </button>
      <button class="tap rounded-3xl text-dim" style="padding: 12px 14px; border: 1px solid var(--line); font-weight: 600; font-size: 0.875rem" @click="editGoal = !editGoal">
        Obiettivo
      </button>
    </div>
    <div v-if="editGoal" class="flex items-center gap-2" style="margin-top: 10px">
      <input v-model.number="goalDraft" type="number" step="0.5" inputmode="decimal" placeholder="es. 70"
        aria-label="Obiettivo di peso in kg"
        class="flex-1 bg-card border border-line text-ink rounded-2xl tabular" style="padding: 10px 12px" />
      <span class="text-dim">kg</span>
      <button class="tap rounded-2xl text-move" style="padding: 10px 12px; font-weight: 700" @click="saveGoal">OK</button>
    </div>

    <TrendChart v-if="series.length >= 2" :points="series" tone="move" :height="110" style="margin-top: 12px" />
  </div>
</template>

<script setup lang="ts">
import { Target, Minus, Plus } from "lucide-vue-next";
import { useSettingsStore } from "~/stores/settings";
import { todayKey, keyToDate } from "~/utils/date";

const settings = useSettingsStore();
const r1 = (n: number) => Math.round(n * 10) / 10;
const fmt = (n: number) => r1(n).toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const signed = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "±") + fmt(Math.abs(n));

const last = computed(() => settings.weights[settings.weights.length - 1]);
const current = computed(() => last.value?.kg ?? settings.profile.weightKg);
const start = computed(() => settings.weights[0]?.kg ?? current.value);
const goal = computed(() => settings.profile.goalWeightKg || 0);
const todayLogged = computed(() => last.value?.d === todayKey());

const progress = computed(() => {
  const total = start.value - goal.value;
  if (!goal.value || Math.abs(total) < 0.05) return Math.abs(current.value - goal.value) < 0.05 ? 100 : 0;
  return Math.max(0, Math.min(100, ((start.value - current.value) / total) * 100));
});

const draft = ref(current.value);
watch(current, (v) => (draft.value = v));
const saved = ref(false);
function save() {
  if (!(draft.value > 20 && draft.value < 400)) return;
  settings.logWeight(todayKey(), draft.value);
  saved.value = true;
  setTimeout(() => (saved.value = false), 1600);
}

const editGoal = ref(false);
const goalDraft = ref<number | undefined>(settings.profile.goalWeightKg);
function saveGoal() {
  const g = Number(goalDraft.value);
  settings.profile.goalWeightKg = g > 20 && g < 400 ? r1(g) : undefined;
  editGoal.value = false;
}

const series = computed(() =>
  settings.weights.slice(-60).map((w) => ({ t: keyToDate(w.d).getTime(), v: w.kg })),
);
</script>
