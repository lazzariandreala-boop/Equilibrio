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
