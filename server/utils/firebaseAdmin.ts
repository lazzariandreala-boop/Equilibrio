import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Accesso amministrativo a Firebase, con la chiave del service account
 * presa dalla variabile FIREBASE_SERVICE_ACCOUNT (il JSON in base64).
 *
 * Restituisce null se la variabile manca: in quel caso il sistema degli
 * abbonamenti non è ancora configurato e i chiamanti lo trattano come tale,
 * invece di andare in errore.
 */
let app: App | null | undefined;

export function serviceAccount(): Record<string, any> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(text);
  } catch {
    console.error("FIREBASE_SERVICE_ACCOUNT non leggibile: attesi JSON o JSON in base64");
    return null;
  }
}

export function adminApp(): App | null {
  if (app !== undefined) return app;
  const sa = serviceAccount();
  if (!sa) return (app = null);
  app = getApps()[0] ?? initializeApp({ credential: cert(sa as any), projectId: sa.project_id });
  return app;
}

export const adminAuth = () => (adminApp() ? getAuth(adminApp()!) : null);
export const adminDb = () => (adminApp() ? getFirestore(adminApp()!) : null);
