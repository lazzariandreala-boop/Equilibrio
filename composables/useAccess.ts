import { useSettingsStore } from "~/stores/settings";

/**
 * Cosa l'utente vede davvero: il modulo deve essere acceso nel Profilo
 * e compreso nel suo piano. Un solo posto, così pagine e menù concordano.
 */
export function useAccess() {
  const settings = useSettingsStore();
  const { has } = useEntitlements();
  return reactive({
    ai: computed(() => has("ai") || !!settings.keys?.gemini?.trim()),
    export: computed(() => has("export")),
    diabetes: computed(() => !!settings.profile.diabetes && has("diabetes")),
    pregnancy: computed(() => !!settings.profile.pregnant && has("pregnancy")),
    cycle: computed(() => !!settings.profile.cycleTracking),
  });
}
