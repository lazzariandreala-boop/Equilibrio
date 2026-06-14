import { doc, getDoc, setDoc } from "firebase/firestore";
import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";

// Sincronizzazione cloud opzionale: attiva solo con Firebase configurato + utente loggato.
export function useCloudSync() {
  const { $firebase } = useNuxtApp();
  const { user } = useAuth();
  const day = useDayStore();
  const settings = useSettingsStore();
  let timer: any = null;
  let subscribed = false;

  async function pull() {
    if (!$firebase?.db || !user.value || user.value.demo) return;
    const ref = doc($firebase.db, "users", user.value.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      day.hydrate(data.day);
      settings.hydrate(data.settings);
    }
  }

  // Primo login: se il documento cloud è vuoto/inesistente, migra i dati locali
  // (modalità demo) verso Firestore così non vengono persi; altrimenti scarica.
  async function syncInitial() {
    if (!$firebase?.db || !user.value || user.value.demo) return;
    const ref = doc($firebase.db, "users", user.value.uid);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.day) {
      const data = snap.data();
      day.hydrate(data.day);
      settings.hydrate(data.settings);
    } else {
      await push(); // push iniziale dei dati locali prima delle subscribe
    }
  }

  async function push() {
    if (!$firebase?.db || !user.value || user.value.demo) return;
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
    timer = setTimeout(push, 1500); // debounce
  }

  function start() {
    if (!$firebase?.db) return;
    // appena l'utente è disponibile, scarica e poi tieni allineato
    watch(
      user,
      async (u) => {
        if (u && !u.demo && !subscribed) {
          subscribed = true;
          await syncInitial(); // migra i dati locali o scarica quelli cloud
          day.$subscribe(schedulePush);
          settings.$subscribe(schedulePush);
        }
      },
      { immediate: true },
    );
  }

  return { start, pull, push };
}
