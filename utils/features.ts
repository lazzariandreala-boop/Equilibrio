import type { useSettingsStore } from "~/stores/settings";

/**
 * Pagine legate a una funzione facoltativa. Una sola mappa usata dalla
 * protezione delle rotte e dal controllo in tempo reale, così le due non
 * possono andare in disaccordo.
 */
export const FEATURE_ROUTES: Record<string, (s: ReturnType<typeof useSettingsStore>) => boolean> = {
  "/ciclo": (s) => !!s.profile.cycleTracking,
  "/gravidanza": (s) => !!s.profile.pregnant,
  "/glicemia": (s) => !!s.profile.diabetes,
};

/** Vero se la pagina è libera oppure la sua funzione è attiva. */
export function isRouteAllowed(path: string, settings: ReturnType<typeof useSettingsStore>): boolean {
  const check = FEATURE_ROUTES[path];
  return check ? check(settings) : true;
}

/** Pagine che richiedono anche un abbonamento, oltre al modulo acceso. */
export const PLAN_ROUTES: Record<string, { feature: "pregnancy" | "diabetes"; plan: string; da: string }> = {
  "/gravidanza": { feature: "pregnancy", plan: "gravidanza", da: "gravidanza" },
  "/glicemia": { feature: "diabetes", plan: "diabete", da: "diabete" },
};

/**
 * Dove mandare chi apre una pagina non disponibile: alla home se il modulo è
 * spento, alla pagina dei piani se è acceso ma non compreso nell'abbonamento.
 * null se può restare.
 */
export function routeRedirect(
  path: string,
  settings: ReturnType<typeof useSettingsStore>,
  has: (f: "ai" | "export" | "pregnancy" | "diabetes") => boolean,
): string | null {
  if (!isRouteAllowed(path, settings)) return "/";
  const need = PLAN_ROUTES[path];
  if (need && !has(need.feature)) return `/premium?piano=${need.plan}&da=${need.da}`;
  return null;
}
