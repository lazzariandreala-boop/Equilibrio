<template>
  <div class="space-y-5">
    <!-- Account -->
    <div class="rise rounded-4xl flex items-center gap-3.5" style="padding: 13px 14px"
      :style="{ background: 'var(--card)', boxShadow: 'inset 0 0 0 1.5px var(--water-soft), var(--tile-shadow)' }">
      <img v-if="user?.photo" :src="user.photo" class="rounded-full object-cover shrink-0"
        style="width: 56px; height: 56px; box-shadow: 0 0 0 1.5px var(--water), 0 0 18px -5px var(--water-glow)" />
      <div v-else class="rounded-full flex items-center justify-center grad-water shrink-0"
        style="width: 56px; height: 56px; box-shadow: 0 0 18px -5px var(--water-glow)">
        <User :size="24" color="#fff" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="display truncate" style="font-weight: 700; font-size: 18px">{{ user?.name }}</div>
        <div class="text-faint truncate" style="font-size: 12.5px">{{ user?.demo ? "Modalità demo (dati locali)" : user?.email }}</div>
      </div>
      <button v-if="!user?.demo" class="tap text-dim rounded-full shrink-0"
        style="padding: 9px 18px; font-size: 13.5px; font-weight: 600; border: 1px solid var(--line)"
        @click="signOut">
        Esci
      </button>
    </div>

    <!-- Obiettivi -->
    <div class="rise" style="animation-delay: 60ms">
      <div class="display mb-2.5 px-1" style="font-weight: 700; font-size: 19px">Obiettivi giornalieri</div>
      <div class="space-y-2.5">
        <GoalCard :icon="GlassWater" tone="water" label="Acqua" :value="settings.goals.water" unit="ml"
          @click="goalOpen = 'water'" />
        <GoalCard :icon="Footprints" tone="move" label="Movimento" :value="settings.goals.moveMin" unit="min"
          @click="goalOpen = 'move'" />
        <GoalCard :icon="UtensilsCrossed" tone="food" label="Calorie" :value="settings.goals.kcal" unit="kcal"
          note="Per i valori calorici, conviene impostarli con il medico o un nutrizionista."
          @click="goalOpen = 'food'" />
        <GoalCard :icon="Scale" tone="alcohol" label="Peso" hint="per stimare le calorie bruciate"
          :value="settings.profile.weightKg" unit="kg" @click="goalOpen = 'weight'" />
      </div>
    </div>

    <!-- Promemoria -->
    <div class="rise" style="animation-delay: 120ms">
      <div class="display mb-2.5 px-1" style="font-weight: 700; font-size: 19px">Promemoria</div>
      <div class="grid grid-cols-2 gap-2.5">
        <ReminderCard :icon="Droplet" tone="water" label="Acqua"
          :detail="`${settings.reminders.waterTimes.length} volte al giorno`" :on="settings.reminders.water"
          @toggle="settings.reminders.water = !settings.reminders.water" />
        <ReminderCard :icon="UtensilsCrossed" tone="food" label="Pasti" detail="ai pasti principali"
          :on="settings.reminders.meal" @toggle="settings.reminders.meal = !settings.reminders.meal" />
        <ReminderCard :icon="Moon" tone="alcohol" label="Check serale" :detail="settings.reminders.eveningTime"
          :on="settings.reminders.evening" @toggle="settings.reminders.evening = !settings.reminders.evening" />
        <button class="tap rounded-4xl flex flex-col items-center justify-center gap-1.5"
          style="padding: 12px; background: var(--raised); border: 1px solid var(--line)" @click="enable">
          <BellRing :size="19" color="var(--move)" />
          <span class="text-ink" style="font-size: 13px; font-weight: 600">Attiva notifiche</span>
        </button>
      </div>
      <p class="text-faint px-1" style="font-size: 12px; margin-top: 9px; line-height: 1.45">
        In background funzionano nell'app installata. Nel browser arrivano solo a finestra aperta.
        <button class="underline" @click="test">Fai una prova</button>
      </p>
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

      <!-- Salute del telefono -->
      <div class="rounded-4xl p-4 mb-2.5"
        :style="{ background: health.connected.value ? 'var(--move-soft)' : 'var(--raised)', boxShadow: 'var(--tile-shadow)' }">
        <div class="flex items-center gap-3">
          <div class="rounded-2xl flex items-center justify-center shrink-0" :class="health.connected.value ? 'grad-move' : ''"
            style="width: 44px; height: 44px" :style="health.connected.value ? {} : { background: 'var(--line)' }">
            <HeartPulse :size="21" :color="health.connected.value ? '#fff' : 'var(--dim)'" />
          </div>
          <div class="flex-1 min-w-0">
            <div style="font-weight: 600; font-size: 15px">Salute del telefono</div>
            <div class="text-dim" style="font-size: 12.5px; line-height: 1.35">{{ health.label.value }}</div>
          </div>

          <button v-if="health.native.value" class="tap rounded-2xl px-4 py-2.5 font-semibold shrink-0"
            style="font-size: 13px"
            :class="health.connected.value ? 'bg-raised text-dim' : 'grad-move'"
            :style="health.connected.value ? {} : { color: '#fff' }"
            :disabled="health.busy.value"
            @click="runHealth">
            {{ health.busy.value ? "…" : health.connected.value ? "Sincronizza" : "Collega" }}
          </button>
        </div>

        <p v-if="health.error.value" class="text-food" style="font-size: 12.5px; margin-top: 10px; line-height: 1.45">
          {{ health.error.value }}
        </p>

        <!-- Riquadro di diagnostica: mostra l'esito di ogni chiamata al plugin.
             Senza questo, i pulsanti eseguivano tutto ma non si vedeva nulla. -->
        <pre v-if="health.detail.value" class="text-dim rounded-2xl"
          style="font-size: 10.5px; line-height: 1.45; margin-top: 10px; padding: 10px;
                 background: var(--raised); white-space: pre-wrap; word-break: break-word;
                 font-family: ui-monospace, monospace; max-height: 300px; overflow-y: auto">{{ health.detail.value }}</pre>

        <div v-if="health.native.value" class="flex gap-2" style="margin-top: 10px">
          <button class="tap flex-1 rounded-2xl py-2.5 font-semibold bg-raised text-dim" style="font-size: 12.5px"
            @click="health.openSettings()">
            Apri Health Connect
          </button>
          <button class="tap flex-1 rounded-2xl py-2.5 font-semibold bg-raised text-dim"
            style="font-size: 12.5px" @click="runDiagnose">
            Diagnostica
          </button>
        </div>

        <!-- Va detto: senza questa nota si aspettano dati che non arriveranno mai. -->
        <p class="text-faint" style="font-size: 12px; margin-top: 10px; line-height: 1.5">
          Da qui arrivano passi e allenamenti scritti su <strong class="text-dim">Health Connect</strong>:
          Samsung Health, Garmin, Fitbit e Google Health lo fanno.
          <strong class="text-dim">Huawei Health no</strong> — usa un ecosistema separato e non scrive su Health Connect.
          Per portarci i dati Huawei serve un'app tramite come Health Sync.
        </p>
      </div>

      <div class="rounded-4xl flex items-center gap-3" style="padding: 13px 14px"
        :style="{ background: 'var(--card)', border: '1px solid var(--line)', boxShadow: 'var(--tile-shadow)' }">
        <div class="rounded-2xl flex items-center justify-center shrink-0"
          style="width: 44px; height: 44px; background: var(--water-soft)">
          <Cloud :size="21" color="var(--water)" />
        </div>
        <div class="flex-1 min-w-0">
          <div style="font-weight: 600; font-size: 15px">Backup su Firebase</div>
          <div class="text-faint" style="font-size: 12.5px">I dati seguono l'account su ogni dispositivo</div>
        </div>
        <span class="rounded-full px-3 py-1.5 shrink-0" style="font-size: 12px; font-weight: 600"
          :style="isDemo ? { background: 'var(--raised)', color: 'var(--faint)' } : { background: 'var(--move-soft)', color: 'var(--move)' }">
          {{ isDemo ? "non configurato" : "attivo" }}
        </span>
      </div>
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
import { User, GlassWater, Footprints, UtensilsCrossed, Scale, HeartPulse, Droplet, Moon, BellRing, Cloud } from "lucide-vue-next";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useSettingsStore } from "~/stores/settings";

const settings = useSettingsStore();
const { user, isDemo, signOut } = useAuth();
const health = useHealthSync();

// Qualunque cosa accada deve finire nel riquadro di diagnostica: finora un
// errore lanciato prima dei try interni lasciava il pulsante apparentemente inerte.
async function runHealth() {
  try {
    if (health.connected.value) await health.sync();
    else await health.connect();
  } catch (e: any) {
    health.detail.value = `click: ERRORE ${e?.message || e}`;
  }
}
async function runDiagnose() {
  try {
    await health.diagnose();
  } catch (e: any) {
    health.detail.value = `diagnostica: ERRORE ${e?.message || e}`;
  }
}
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
      await $fetch(`${apiBase}/api/withings/restore`, {
        method: "POST", body: w, credentials: "include",
      }).catch(() => null);
      s = await withingsStatus();
    }
  }

  wConnected.value = !!s.connected;
  if (wConnected.value) {
    if (ref) {
      const tok = await $fetch(`${apiBase}/api/withings/token`, { credentials: "include" }).catch(() => null);
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

// Dopo una reinstallazione la sessione lato server è persa e i token si
// recuperano solo da Firestore: serve però che l'utente sia già autenticato.
// onMounted da solo arrivava troppo presto, quindi si riprova appena c'è.
onMounted(loadWithings);
watch(
  () => user.value?.uid,
  (uid) => {
    if (uid && !wConnected.value) loadWithings();
  },
);

async function enable() {
  const ok = await requestPermission();
  if (ok) await schedule();
}
async function test() {
  await requestPermission();
  await testNow();
}
</script>
