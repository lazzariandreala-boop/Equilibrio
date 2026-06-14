import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

export interface AppUser {
  uid: string;
  name: string;
  email: string | null;
  photo: string | null;
  demo: boolean;
}

const user = ref<AppUser | null>(null);
const ready = ref(false);

export function useAuth() {
  const { $firebase } = useNuxtApp();

  const isDemo = computed(() => !$firebase);

  function setFromFb(u: User | null) {
    user.value = u
      ? { uid: u.uid, name: u.displayName || "Tu", email: u.email, photo: u.photoURL, demo: false }
      : null;
    ready.value = true;
  }

  // inizializza una sola volta lato client
  function init() {
    if (ready.value) return;
    if (!$firebase) {
      // modalità demo: utente locale finto, niente login richiesto
      user.value = { uid: "demo", name: "Ospite", email: null, photo: null, demo: true };
      ready.value = true;
      return;
    }
    onAuthStateChanged($firebase.auth!, setFromFb);
  }

  async function signInWithGoogle() {
    if (!$firebase) return; // in demo non serve
    const provider = new GoogleAuthProvider();
    await signInWithPopup($firebase.auth!, provider);
  }

  async function signOut() {
    if (!$firebase) return;
    await fbSignOut($firebase.auth!);
  }

  return { user, ready, isDemo, init, signInWithGoogle, signOut };
}
