<template>
  <div class="space-y-5">
    <!-- Account -->
    <div class="rise rounded-5xl p-4 flex items-center gap-3.5" style="background: var(--card); border: 1px solid var(--line); box-shadow: var(--shadow)">
      <img v-if="user?.photo" :src="user.photo" class="rounded-full object-cover" style="width: 52px; height: 52px" />
      <div v-else class="rounded-full flex items-center justify-center grad-water" style="width: 52px; height: 52px">
        <User :size="22" color="#fff" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="display truncate" style="font-weight: 700; font-size: 17px">{{ user?.name }}</div>
        <div class="text-faint truncate" style="font-size: 12.5px">{{ user?.demo ? "Modalità demo (dati locali)" : user?.email }}</div>
      </div>
      <button v-if="!user?.demo" class="tap text-dim bg-raised rounded-2xl px-3.5 py-2" style="font-size: 13px; font-weight: 600" @click="signOut">
        Esci
      </button>
    </div>

    <!-- Obiettivi -->
    <div class="rise" style="animation-delay: 60ms">
      <div class="display mb-3 px-1" style="font-weight: 700; font-size: 18px">Obiettivi giornalieri</div>
      <div class="space-y-2.5">
        <GoalCard :icon="GlassWater" tone="water" label="Acqua" :value="settings.goals.water" unit="ml" @click="goalOpen = 'water'" />
        <GoalCard :icon="Footprints" tone="move" label="Movimento" :value="settings.goals.moveMin" unit="min" @click="goalOpen = 'move'" />
        <GoalCard :icon="UtensilsCrossed" tone="food" label="Calorie" :value="settings.goals.kcal" unit="kcal" @click="goalOpen = 'food'" />
      </div>
      <p class="text-faint px-1" style="font-size: 12.5px; margin-top: 10px; line-height: 1.5">
        Per i valori calorici, conviene impostarli con il medico o un nutrizionista.
      </p>

      <div class="mt-2.5">
        <GoalCard :icon="Scale" tone="alcohol" label="Peso (per stimare le calorie bruciate)"
          :value="settings.profile.weightKg" unit="kg" @click="goalOpen = 'weight'" />
      </div>
    </div>

    <!-- Promemoria -->
    <div class="rise" style="animation-delay: 120ms">
      <div class="display mb-3 px-1" style="font-weight: 700; font-size: 18px">Promemoria</div>
      <AppCard>
        <SettingRow label="Bevi acqua">
          <Toggle :on="settings.reminders.water" @click="settings.reminders.water = !settings.reminders.water" />
        </SettingRow>
        <SettingRow label="Registra i pasti">
          <Toggle :on="settings.reminders.meal" @click="settings.reminders.meal = !settings.reminders.meal" />
        </SettingRow>
        <SettingRow label="Check serale (alcol)" :last="true">
          <Toggle :on="settings.reminders.evening" @click="settings.reminders.evening = !settings.reminders.evening" />
        </SettingRow>
        <div class="flex gap-2 mt-4">
          <button class="tap flex-1 grad-water rounded-2xl py-3 font-semibold" style="color: #fff; font-size: 14px" @click="enable">
            Attiva promemoria
          </button>
          <button class="tap bg-raised text-dim rounded-2xl px-4 font-semibold" style="font-size: 14px" @click="test">Prova</button>
        </div>
        <p class="text-faint" style="font-size: 12px; margin-top: 10px; line-height: 1.5">
          In background funzionano nell'app nativa. Nel browser arrivano solo a finestra aperta.
        </p>
      </AppCard>
    </div>

    <!-- Connessioni -->
    <div class="rise" style="animation-delay: 180ms">
      <div class="display mb-3 px-1" style="font-weight: 700; font-size: 18px">Connessioni</div>

      <div class="rounded-4xl p-4 mb-2.5" :style="{ background: wConnected ? 'var(--move-soft)' : 'var(--raised)' }">
        <div class="flex items-center gap-3">
          <div class="rounded-2xl flex items-center justify-center shrink-0" :class="wConnected ? 'grad-move' : ''"
            style="width: 44px; height: 44px" :style="wConnected ? {} : { background: 'var(--line)' }">
            <Scale :size="21" :color="wConnected ? '#fff' : 'var(--dim)'" />
          </div>
          <div class="flex-1 min-w-0">
            <div style="font-weight: 600; font-size: 15px">Withings</div>
            <div class="text-dim" style="font-size: 12.5px">
              <template v-if="wLoading">Verifico…</template>
              <template v-else-if="wConnected && wWeight != null">
                {{ wWeight.toFixed(1) }} kg<template v-if="wFat != null"> · {{ wFat.toFixed(1) }}% grasso</template>
              </template>
              <template v-else-if="wConnected">Collegato</template>
              <template v-else>Non collegato</template>
            </div>
          </div>
          <button v-if="!wLoading" class="tap rounded-2xl px-4 py-2.5 font-semibold shrink-0" style="font-size: 13px"
            :class="wConnected ? 'bg-raised text-dim' : 'grad-move'" :style="wConnected ? {} : { color: '#fff' }"
            @click="wConnected ? wDisconnect() : wConnect()">
            {{ wConnected ? "Scollega" : "Collega" }}
          </button>
        </div>
      </div>

      <!-- Health Connect: legge passi e allenamenti dal telefono -->
      <div class="rounded-4xl p-4 mb-2.5" :style="{ background: health.connected.value ? 'var(--move-soft)' : 'var(--raised)' }">
        <div class="flex items-center gap-3">
          <div class="rounded-2xl flex items-center justify-center shrink-0" :class="health.connected.value ? 'grad-move' : ''"
            style="width: 44px; height: 44px" :style="health.connected.value ? {} : { background: 'var(--line)' }">
            <HeartPulse :size="21" :color="health.connected.value ? '#fff' : 'var(--dim)'" />
          </div>
          <div class="flex-1 min-w-0">
            <div style="font-weight: 600; font-size: 15px">Salute del telefono</div>
            <div class="text-dim" style="font-size: 12.5px; line-height: 1.35">{{ health.label.value }}</div>
          </div>
          <button v-if="health.available.value" class="tap rounded-2xl px-4 py-2.5 font-semibold shrink-0" style="font-size: 13px"
            :class="health.connected.value ? 'bg-raised text-dim' : 'grad-move'"
            :style="health.connected.value ? {} : { color: '#fff' }"
            @click="health.connected.value ? health.sync() : health.connect()">
            {{ health.connected.value ? "Sincronizza" : "Collega" }}
          </button>
        </div>
        <p v-if="!health.available.value" class="text-faint" style="font-size: 12px; margin-top: 10px; line-height: 1.5">
          Funziona nell'app installata su Android (Health Connect) o iPhone (Salute). Dal browser non è accessibile:
          Huawei Health, Samsung Health, Garmin e Google Health scrivono lì i loro dati, quindi collegando Health Connect
          arrivano passi e allenamenti di tutti insieme.
        </p>
      </div>

      <AppCard pad="p-4">
        <SettingRow label="Backup su Firebase" :last="true">
          <span class="rounded-full px-3 py-1" style="font-size: 12px; font-weight: 600"
            :style="isDemo ? { background: 'var(--raised)', color: 'var(--faint)' } : { background: 'var(--move-soft)', color: 'var(--move)' }">
            {{ isDemo ? "non configurato" : "attivo" }}
          </span>
        </SettingRow>
      </AppCard>
    </div>

    <p class="text-faint text-center" style="font-size: 12.5px">Equilibrio · un passo per volta</p>

    <BottomSheet :model-value="goalOpen === 'water'" title="Obiettivo acqua" @update:model-value="goalOpen = null">
      <GoalPicker tone="water" unit="ml" :model-value="settings.goals.water" :presets="[1500, 2000, 2500]" :min="500" :max="4000" :step="100" @save="saveGoal('water', $event)" />
    </BottomSheet>
    <BottomSheet :model-value="goalOpen === 'move'" title="Obiettivo movimento" @update:model-value="goalOpen = null">
      <GoalPicker tone="move" unit="min" :model-value="settings.goals.moveMin" :presets="[20, 30, 45]" :min="5" :max="120" :step="5" @save="saveGoal('move', $event)" />
    </BottomSheet>
    <BottomSheet :model-value="goalOpen === 'food'" title="Obiettivo calorie" @update:model-value="goalOpen = null">
      <GoalPicker tone="food" unit="kcal" :model-value="settings.goals.kcal" :presets="[1600, 1800, 2000]" :min="1000" :max="3500" :step="50" @save="saveGoal('food', $event)" />
    </BottomSheet>
    <BottomSheet :model-value="goalOpen === 'weight'" title="Il tuo peso" @update:model-value="goalOpen = null">
      <GoalPicker tone="alcohol" unit="kg" :model-value="settings.profile.weightKg" :presets="[70, 85, 100]" :min="35" :max="200" :step="1" @save="saveGoal('weight', $event)" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { User, GlassWater, Footprints, UtensilsCrossed, Scale, HeartPulse } from "lucide-vue-next";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useSettingsStore } from "~/stores/settings";

const settings = useSettingsStore();
const { user, isDemo, signOut } = useAuth();
const health = useHealthSync();
const { requestPermission, schedule, testNow } = useNotifications();

const goalOpen = ref<"water" | "move" | "food" | "weight" | null>(null);
function saveGoal(kind: "water" | "move" | "food" | "weight", value: number) {
  if (kind === "water") settings.goals.water = value;
  if (kind === "move") settings.goals.moveMin = value;
  if (kind === "food") settings.goals.kcal = value;
  if (kind === "weight") settings.profile.weightKg = value;
  goalOpen.value = null;
}

// ── Withings (token sincronizzati tra dispositivi via Firestore) ──
const { connect: connectWithings, status: withingsStatus, fetchMeasures, disconnect: disconnectWithings } = useWithings();
const { $firebase } = useNuxtApp();
const apiBase = useRuntimeConfig().public.apiBase || "";
const wLoading = ref(true);
const wConnected = ref(false);
const wWeight = ref<number | null>(null);
const wFat = ref<number | null>(null);

function withingsDocRef() {
  if (!$firebase?.db || !user.value || user.value.demo) return null;
  return doc($firebase.db, "users", user.value.uid);
}

async function loadWithings() {
  wLoading.value = true;
  let s = await withingsStatus();

  const ref = withingsDocRef();
  if (!s.connected && ref) {
    const snap = await getDoc(ref);
    const w = snap.exists() ? (snap.data() as any)?.withings : null;
    if (w?.refresh_token || w?.access_token) {
      await $fetch(`${apiBase}/api/withings/restore`, { method: "POST", body: w }).catch(() => null);
      s = await withingsStatus();
    }
  }

  wConnected.value = !!s.connected;
  if (wConnected.value) {
    if (ref) {
      const tok = await $fetch(`${apiBase}/api/withings/token`).catch(() => null);
      if (tok) await setDoc(ref, { withings: tok }, { merge: true });
    }
    const m = await fetchMeasures();
    wWeight.value = m?.weight ?? null;
    wFat.value = m?.fatRatio ?? null;
  }
  wLoading.value = false;
}

function wConnect() {
  connectWithings();
}
async function wDisconnect() {
  await disconnectWithings();
  const ref = withingsDocRef();
  if (ref) await setDoc(ref, { withings: null }, { merge: true });
  wConnected.value = false;
  wWeight.value = null;
  wFat.value = null;
}

onMounted(loadWithings);

async function enable() {
  const ok = await requestPermission();
  if (ok) await schedule();
}
async function test() {
  await requestPermission();
  await testNow();
}
</script>
