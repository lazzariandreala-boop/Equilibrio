import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Espone $firebase = { app, auth, db } oppure null se non configurato (modalità demo).
export default defineNuxtPlugin(() => {
  const cfg = useRuntimeConfig().public.firebase;
  const configured = !!cfg?.apiKey && !!cfg?.projectId;

  let app: FirebaseApp | null = null;
  let auth: Auth | null = null;
  let db: Firestore | null = null;

  if (configured) {
    app = initializeApp({
      apiKey: cfg.apiKey,
      authDomain: cfg.authDomain,
      projectId: cfg.projectId,
      storageBucket: cfg.storageBucket,
      messagingSenderId: cfg.messagingSenderId,
      appId: cfg.appId,
    });
    auth = getAuth(app);
    db = getFirestore(app);
  } else if (import.meta.dev) {
    console.info("[Equilibrio] Firebase non configurato → modalità demo (dati solo locali).");
  }

  return {
    provide: {
      firebase: configured ? { app, auth, db } : null,
    },
  };
});
