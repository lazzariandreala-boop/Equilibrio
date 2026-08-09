import { useDayStore } from "~/stores/day";
import { todayKey } from "~/utils/date";

/**
 * Legge passi e allenamenti dalla piattaforma salute del telefono:
 * Health Connect su Android, HealthKit su iPhone.
 *
 * Health Connect è l'hub dove Samsung Health, Huawei Health, Garmin Connect e
 * Google Health scrivono i loro dati: collegando lui arrivano tutti insieme,
 * senza dover integrare ogni servizio uno per uno.
 *
 * Il plugin nativo esiste solo nella build Capacitor. Nel browser il composable
 * resta inerte e l'interfaccia lo dice, invece di far finta di funzionare.
 */

export function useHealthSync() {
  const day = useDayStore();
  const available = useState("health:available", () => false);
  const connected = useState("health:connected", () => false);
  const busy = useState("health:busy", () => false);
  const lastSync = useState<string | null>("health:lastSync", () => null);
  const steps = useState("health:steps", () => 0);

  async function plugin(): Promise<any | null> {
    if (!import.meta.client) return null;
    try {
      const cap = (window as any).Capacitor;
      if (!cap?.isNativePlatform?.()) return null; // nel browser non esiste
      const mod = await import("capacitor-health").catch(() => null);
      return (mod as any)?.Health ?? null;
    } catch {
      return null;
    }
  }

  /** Se Health Connect non è installato, lo apre nel Play Store. */
  async function install() {
    const H = await plugin();
    await H?.showHealthConnectInPlayStore?.().catch(() => {});
  }

  /** Apre le impostazioni Health Connect (serve se i permessi sono stati negati). */
  async function openSettings() {
    const H = await plugin();
    await H?.openHealthConnectSettings?.().catch(() => {});
  }

  const label = computed(() => {
    if (!available.value) return "Disponibile nell'app installata";
    if (busy.value) return "Sincronizzo…";
    if (!connected.value) return "Non collegato";
    const s = steps.value ? `${steps.value.toLocaleString("it-IT")} passi oggi` : "Collegato";
    return lastSync.value ? `${s} · ultimo aggiornamento ${lastSync.value}` : s;
  });

  async function check() {
    const H = await plugin();
    if (!H) return;
    try {
      const res = await H.isHealthAvailable();
      available.value = !!res?.available;
    } catch {
      available.value = false;
    }
  }

  async function connect() {
    const H = await plugin();
    if (!H) return;
    busy.value = true;
    try {
      await H.requestHealthPermissions({
        permissions: ["READ_STEPS", "READ_WORKOUTS", "READ_ACTIVE_CALORIES", "READ_DISTANCE"],
      });
      connected.value = true;
      await sync();
    } catch {
      connected.value = false;
    } finally {
      busy.value = false;
    }
  }

  /** Porta in Equilibrio passi e allenamenti di oggi, senza creare doppioni. */
  async function sync() {
    const H = await plugin();
    if (!H) return;
    busy.value = true;
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();

      const agg = await H.queryAggregated({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        dataType: "steps",
        bucket: "day",
      }).catch(() => null);
      steps.value = Math.round(agg?.aggregatedData?.[0]?.value ?? 0);

      const wk = await H.queryWorkouts({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        includeHeartRate: false,
        includeRoute: false,
        includeSteps: false,
      }).catch(() => null);

      const existing = new Set(day.today.moves.map((m: any) => m.extId).filter(Boolean));
      for (const w of wk?.workouts ?? []) {
        const id = w.id || `${w.startDate}-${w.workoutType}`;
        if (existing.has(id)) continue; // già importato in una sincronizzazione precedente
        const minutes = Math.round((w.duration ?? 0) / 60);
        if (minutes < 1) continue;
        day.addMove({
          type: translate(w.workoutType),
          min: minutes,
          kcal: Math.round(w.calories ?? 0) || undefined,
          activityId: mapId(w.workoutType),
          extId: id,
        } as any);
      }

      lastSync.value = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    } finally {
      busy.value = false;
    }
  }

  /** Passi convertiti in minuti di movimento, per chi non registra allenamenti. */
  const stepsAsMinutes = computed(() => Math.round(steps.value / 100));

  onMounted(check);

  return { available, connected, busy, steps, stepsAsMinutes, lastSync, label, connect, sync, install, openSettings };
}

function mapId(type = "") {
  const t = type.toLowerCase();
  if (t.includes("bik") || t.includes("cycl")) return "bici";
  if (t.includes("run")) return "corsa";
  if (t.includes("walk") || t.includes("hik")) return "camminata";
  if (t.includes("swim")) return "nuoto";
  if (t.includes("tennis")) return "tennis";
  if (t.includes("yoga")) return "yoga";
  if (t.includes("strength") || t.includes("weight") || t.includes("gym")) return "palestra";
  return "altro";
}

function translate(type = "") {
  const map: Record<string, string> = {
    bici: "Bici", corsa: "Corsa", camminata: "Camminata", nuoto: "Nuoto",
    tennis: "Tennis", yoga: "Yoga", palestra: "Palestra",
  };
  const id = mapId(type);
  return map[id] ?? (type ? type.replace(/_/g, " ") : "Attività");
}
