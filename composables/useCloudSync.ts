import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";

// Sincronizzazione cloud opzionale: attiva solo con Firebase configurato + utente loggato.
// Realtime: le modifiche fatte su un dispositivo arrivano live sugli altri (onSnapshot),
// e le modifiche locali vengono spinte su Firestore con un piccolo debounce.
export function useCloudSync() {
  const { $firebase } = useNuxtApp();
  const { user } = useAuth();
  const day = useDayStore();
  const settings = useSettingsStore();
  let timer: any = null;
  let unsub: null | (() => void) = null;
  let started = false;
  // Firma dell'ultimo stato sincronizzato: evita che un aggiornamento remoto
  // applicato in locale generi un push di ritorno (loop di eco).
  let lastSync = "";

  function snapshot(): string {
    return JSON.stringify({
      day: { streak: day.streak, days: day.days },
      settings: { goals: settings.goals, reminders: settings.reminders },
    });
  }

  function applyRemote(data: any) {
    if (!data) return;
    day.hydrate(data.day);
    settings.hydrate(data.settings);
    lastSync = snapshot(); // allinea la firma: nessun push di ritorno
  }

  async function pull() {
    if (!$firebase?.db || !user.value || user.value.demo) return;
    const ref = doc($firebase.db, "users", user.value.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) applyRemote(snap.data());
  }

  async function push() {
    if (!$firebase?.db || !user.value || user.value.demo) return;
    const payload = snapshot();
    if (payload === lastSync) return; // niente di nuovo da inviare
    lastSync = payload;
    const ref = doc($firebase.db, "users", user.value.uid);
    await setDoc(
      ref,
      {
        day: { streak: day.streak, days: day.days },
        settings: { goals: settings.goals, reminders: settings.reminders },
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  }

  function schedulePush() {
    clearTimeout(timer);
    timer = setTimeout(push, 1200); // debounce
  }

  function start() {
    if (!$firebase?.db) return;
    watch(
      user,
      async (u) => {
        if (u && !u.demo && !started) {
          started = true;
          const ref = doc($firebase.db!, "users", u.uid);

          // Primo login: se il documento cloud è vuoto/inesistente, migra i dati
          // locali (demo); altrimenti scarica quelli cloud.
          const snap = await getDoc(ref);
          if (snap.exists() && snap.data()?.day) applyRemote(snap.data());
          else await push();

          // Realtime: applica le modifiche provenienti dagli altri dispositivi.
          // Ignora gli snapshot delle nostre stesse scritture ancora in volo.
          unsub = onSnapshot(ref, (s) => {
            if (!s.exists() || s.metadata.hasPendingWrites) return;
            applyRemote(s.data());
          });

          // Modifiche locali -> cloud (debounce).
          day.$subscribe(schedulePush);
          settings.$subscribe(schedulePush);
        }

        // Logout: chiudi la sottoscrizione realtime.
        if (!u && unsub) {
          unsub();
          unsub = null;
          started = false;
          lastSync = "";
        }
      },
      { immediate: true },
    );
  }

  return { start, pull, push };
}
