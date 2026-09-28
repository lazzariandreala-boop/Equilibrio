import { useSettingsStore } from "~/stores/settings";
import { isRouteAllowed } from "~/utils/features";

/**
 * Impedisce di aprire le sezioni facoltative quando la relativa funzione
 * è spenta, anche digitando l'indirizzo o seguendo un collegamento salvato.
 *
 * Si esegue solo nel browser: sul server le impostazioni non sono ancora
 * state lette, quindi risulterebbero tutte spente e ogni visita a queste
 * pagine verrebbe rimandata alla home per errore.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;
  const settings = useSettingsStore();
  if (!isRouteAllowed(to.path, settings)) return navigateTo("/", { replace: true });
});
