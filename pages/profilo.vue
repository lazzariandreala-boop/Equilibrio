<template>
  <div class="space-y-4">
    <!-- Account -->
    <AppCard>
      <div class="flex items-center gap-3">
        <img v-if="user?.photo" :src="user.photo" class="rounded-full" style="width: 44px; height: 44px" />
        <div v-else class="bg-raised rounded-full flex items-center justify-center" style="width: 44px; height: 44px">
          <User :size="20" class="text-dim" />
        </div>
        <div class="flex-1">
          <div style="font-weight: 600">{{ user?.name }}</div>
          <div class="text-faint" style="font-size: 12px">{{ user?.demo ? "Modalità demo (dati locali)" : user?.email }}</div>
        </div>
        <button v-if="!user?.demo" class="text-dim" style="font-size: 13px" @click="signOut">Esci</button>
      </div>
    </AppCard>

    <!-- Obiettivi -->
    <AppCard>
      <div style="font-weight: 600" class="mb-1">Obiettivi giornalieri</div>
      <Row label="Acqua (ml)"><input v-model.number="settings.goals.water" type="number" :class="inp" /></Row>
      <Row label="Movimento (min)"><input v-model.number="settings.goals.moveMin" type="number" :class="inp" /></Row>
      <Row label="Calorie (kcal)"><input v-model.number="settings.goals.kcal" type="number" :class="inp" /></Row>
      <p class="text-faint" style="font-size: 12px; margin-top: 8px">
        Per i valori calorici, conviene impostarli con il medico o un nutrizionista.
      </p>
    </AppCard>

    <!-- Promemoria -->
    <AppCard>
      <div class="flex items-center gap-2 mb-1">
        <Bell :size="16" class="text-water" /><span style="font-weight: 600">Promemoria</span>
      </div>
      <Row label="Bevi acqua"><Toggle :on="settings.reminders.water" @click="settings.reminders.water = !settings.reminders.water" /></Row>
      <Row label="Registra i pasti"><Toggle :on="settings.reminders.meal" @click="settings.reminders.meal = !settings.reminders.meal" /></Row>
      <Row label="Check serale (alcol)"><Toggle :on="settings.reminders.evening" @click="settings.reminders.evening = !settings.reminders.evening" /></Row>
      <div class="flex gap-2 mt-3">
        <button class="flex-1 bg-water-soft text-water rounded-xl py-2.5 font-semibold" style="font-size: 14px" @click="enable">Attiva promemoria</button>
        <button class="bg-raised text-dim rounded-xl px-3" @click="test">Prova</button>
      </div>
      <p class="text-faint" style="font-size: 12px; margin-top: 8px">
        Le notifiche pianificate in background funzionano nell'app nativa (Capacitor). Nel browser arrivano solo a finestra aperta.
      </p>
    </AppCard>

    <!-- Connessioni -->
    <AppCard>
      <div style="font-weight: 600" class="mb-1">Connessioni</div>
      <Row label="Sincronizza con Withings">
        <button v-if="wLoading" class="text-faint" style="font-size: 13px" disabled>…</button>
        <button v-else-if="!wConnected" class="text-water" style="font-size: 13px" @click="wConnect">Collega</button>
        <button v-else class="text-faint" style="font-size: 13px" @click="wDisconnect">Collegato · Scollega</button>
      </Row>
      <Row v-if="wConnected && wWeight != null" label="Ultimo peso">
        <span class="text-ink" style="font-size: 13px">
          {{ wWeight.toFixed(1) }} kg<template v-if="wFat != null"> · {{ wFat.toFixed(1) }}% grasso</template>
        </span>
      </Row>
      <Row label="Backup su Firebase">
        <span class="text-faint" style="font-size: 12px">{{ isDemo ? "non configurato" : "attivo" }}</span>
      </Row>
    </AppCard>

    <p class="text-faint text-center" style="font-size: 12px">Equilibrio · un passo per volta</p>
  </div>
</template>

<script setup lang="ts">
import { User, Bell } from "lucide-vue-next";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useSettingsStore } from "~/stores/settings";

const settings = useSettingsStore();
const { user, isDemo, signOut } = useAuth();
const { requestPermission, schedule, testNow } = useNotifications();

const inp = "bg-raised border border-line text-ink rounded-xl px-2.5 py-1.5 text-right tabular";

// ── Withings (con sincronizzazione token tra dispositivi via Firestore) ──
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

  // Non collegato su questo device ma ho i token nel cloud -> ripristina la sessione.
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
    // Salva/aggiorna i token nel cloud così seguono l'utente sugli altri dispositivi.
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
  if (ref) await setDoc(ref, { withings: null }, { merge: true }); // rimuove anche dal cloud
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

// componenti locali leggeri
const Row = defineComponent({
  props: { label: String },
  setup(props, { slots }) {
    return () =>
      h("div", { class: "flex items-center justify-between py-3 border-b border-line" }, [
        h("span", { class: "text-ink" }, props.label),
        slots.default?.(),
      ]);
  },
});
const Toggle = defineComponent({
  props: { on: Boolean },
  setup(props) {
    return () =>
      h(
        "button",
        {
          style: {
            width: "46px", height: "28px", borderRadius: "99px",
            background: props.on ? "var(--move)" : "var(--line)",
            position: "relative", transition: "background 200ms",
          },
        },
        [
          h("span", {
            style: {
              position: "absolute", top: "3px", left: props.on ? "21px" : "3px",
              width: "22px", height: "22px", borderRadius: "99px", background: "#fff", transition: "left 200ms",
            },
          }),
        ],
      );
  },
});
</script>
