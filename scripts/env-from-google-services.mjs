/**
 * La build statica dentro l'APK non ha accesso alle variabili d'ambiente di
 * Vercel: senza di esse l'app parte in "modalità demo" e il login non funziona.
 * Qui ricaviamo la configurazione Firebase da google-services.json e la
 * scriviamo in un .env che `nuxt generate` legge.
 *
 * NUXT_PUBLIC_FIREBASE_APP_ID può essere sovrascritto da variabile d'ambiente:
 * serve se in Firebase esiste un'app Web dedicata (consigliato), invece
 * dell'id dell'app Android usato come ripiego.
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";

const SRC = process.env.GOOGLE_SERVICES_PATH || "android-config/google-services.json";

if (!existsSync(SRC)) {
  console.log(`• ${SRC} assente: l'app resterà in modalità demo`);
  process.exit(0);
}

const gs = JSON.parse(readFileSync(SRC, "utf8"));
const client = gs.client[0];
const info = gs.project_info;

const cfg = {
  NUXT_PUBLIC_FIREBASE_API_KEY: client.api_key[0].current_key,
  NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN: `${info.project_id}.firebaseapp.com`,
  NUXT_PUBLIC_FIREBASE_PROJECT_ID: info.project_id,
  NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET: info.storage_bucket ?? `${info.project_id}.appspot.com`,
  NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: info.project_number,
  NUXT_PUBLIC_FIREBASE_APP_ID: process.env.FIREBASE_WEB_APP_ID || client.client_info.mobilesdk_app_id,
  // L'app installata non ha un server proprio: le API girano sul deploy.
  NUXT_PUBLIC_API_BASE: process.env.API_BASE || "https://equilibrio-ebpu.vercel.app",
};

const lines = Object.entries(cfg)
  .map(([k, v]) => `${k}=${v}`)
  .join("\n");

if (existsSync(".env")) appendFileSync(".env", `\n${lines}\n`);
else writeFileSync(".env", `${lines}\n`);

console.log("✓ .env scritto per la build nativa:");
console.log(`  progetto ${cfg.NUXT_PUBLIC_FIREBASE_PROJECT_ID}`);
console.log(`  API base ${cfg.NUXT_PUBLIC_API_BASE}`);
if (!process.env.FIREBASE_WEB_APP_ID) {
  console.log("  ⚠ APP_ID: uso quello Android. Meglio creare un'app Web in Firebase");
  console.log("     e passarla come secret FIREBASE_WEB_APP_ID.");
}
