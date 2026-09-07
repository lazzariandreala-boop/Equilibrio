import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";
import { useCycleStore } from "~/stores/cycle";

// Persistenza locale (offline + demo). La sincronizzazione cloud è in useCloudSync.
export default defineNuxtPlugin((nuxtApp) => {
  const day = useDayStore(nuxtApp.$pinia as any);
  const settings = useSettingsStore(nuxtApp.$pinia as any);
  const cycle = useCycleStore(nuxtApp.$pinia as any);

  try {
    day.hydrate(JSON.parse(localStorage.getItem("equilibrio:day") || "null"));
    settings.hydrate(JSON.parse(localStorage.getItem("equilibrio:settings") || "null"));
    cycle.hydrate(JSON.parse(localStorage.getItem("equilibrio:cycle") || "null"));
  } catch {
    /* primo avvio */
  }
  day.ensureToday();

  day.$subscribe((_m, state) => {
    localStorage.setItem("equilibrio:day", JSON.stringify({ streak: state.streak, days: state.days }));
  });
  settings.$subscribe((_m, state) => {
    localStorage.setItem("equilibrio:settings", JSON.stringify(state));
  });
  cycle.$subscribe((_m, state) => {
    localStorage.setItem("equilibrio:cycle", JSON.stringify({ entries: state.entries }));
  });
});
