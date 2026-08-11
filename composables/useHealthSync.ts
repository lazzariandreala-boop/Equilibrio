import { Health } from "capacitor-health";
import { useDayStore } from "~/stores/day";

/**
 * Lettura di passi e allenamenti da Health Connect (Android) e HealthKit (iOS).
 *
 * Nota sul plugin: il client di Health Connect viene creato dentro
 * isHealthAvailable(), quindi va invocata prima di qualunque lettura.
 *
 * Huawei Health non scrive su Health Connect (ecosistema separato): per quei
 * dati serve un'app tramite come Health Sync.
 */

const PERMISSIONS = [
  "READ_STEPS",
  "READ_WORKOUTS",
  "READ_ACTIVE_CALORIES",
  "READ_DISTANCE",
] as const;

const ENABLED_KEY = "equilibrio:health:enabled";

export function useHealthSync() {
  const day = useDayStore();

  const native = useState("health:native", () => false);
  const connected = useState("health:connected", () => false);
  const busy = useState("health:busy", () => false);
  const steps = useState("health:steps", () => 0);
  const workouts = useState("health:workouts", () => 0);
  const lastSync = useState<string | null>("health:lastSync", () => null);
  const error = useState<string | null>("health:error", () => null);

  const isNative = () => !!(window as any).Capacitor?.isNativePlatform?.();

  /** L'utente ha scelto di tenere attivo il collegamento? */
  const wasEnabled = () => import.meta.client && localStorage.getItem(ENABLED_KEY) === "1";
  const setEnabled = (v: boolean) => {
    if (import.meta.client) localStorage.setItem(ENABLED_KEY, v ? "1" : "0");
  };

  const label = computed(() => {
    if (!native.value) return "Disponibile solo nell'app installata";
    if (busy.value) return "Sincronizzo…";
    if (!connected.value) return "Non collegato";
    const parts = [`${steps.value.toLocaleString("it-IT")} passi oggi`];
    if (workouts.value) parts.push(`${workouts.value} allenamenti`);
    if (lastSync.value) parts.push(`aggiornato alle ${lastSync.value}`);
    return parts.join(" · ");
  });

  /** Elenco dei permessi effettivamente concessi. */
  async function grantedPermissions(): Promise<string[]> {
    const res = await Health.checkHealthPermissions({ permissions: PERMISSIONS as any }).catch(() => null);
    return (res?.permissions ?? []).flatMap((entry: any) =>
      Object.entries(entry ?? {}).filter(([, v]) => v).map(([k]) => k),
    );
  }

  /**
   * Collega: se Health Connect non è disponibile apre lo store, altrimenti
   * chiede i permessi e, se concessi, sincronizza subito.
   */
  async function connect() {
    error.value = null;
    if (!isNative()) {
      error.value = "Funziona solo nell'app installata.";
      return;
    }

    busy.value = true;
    try {
      const avail = await Health.isHealthAvailable().catch(() => ({ available: false }));
      if (!avail?.available) {
        // Non installato: si porta l'utente direttamente allo store.
        await Health.showHealthConnectInPlayStore().catch(() => {
          error.value = "Health Connect non è disponibile su questo telefono.";
        });
        return;
      }

      await Health.requestHealthPermissions({ permissions: PERMISSIONS as any });

      const granted = await grantedPermissions();
      if (!granted.includes("READ_STEPS") && !granted.includes("READ_WORKOUTS")) {
        error.value =
          "Permessi non concessi. Puoi darli manualmente in Health Connect, alla voce Equilibrio.";
        return;
      }

      setEnabled(true);
      connected.value = true;
      await readData();
    } catch (e: any) {
      error.value = `Collegamento non riuscito: ${e?.message || e}`;
    } finally {
      busy.value = false;
    }
  }

  /** Scollega: i permessi restano in Health Connect, qui si smette di leggerli. */
  function disconnect() {
    setEnabled(false);
    connected.value = false;
    steps.value = 0;
    workouts.value = 0;
    lastSync.value = null;
    error.value = null;
  }

  /** Legge i dati di oggi e li porta nel diario. */
  async function readData() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();

    // Il client vive dentro isHealthAvailable(): senza questa chiamata le
    // query successive falliscono.
    await Health.isHealthAvailable().catch(() => null);

    const agg = await Health.queryAggregated({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      dataType: "steps" as any,
      bucket: "day",
    }).catch(() => null);
    steps.value = Math.round(agg?.aggregatedData?.[0]?.value ?? 0);

    const wk = await Health.queryWorkouts({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      includeHeartRate: false,
      includeRoute: false,
      includeSteps: false,
    }).catch(() => null);

    const list = wk?.workouts ?? [];
    workouts.value = list.length;

    const existing = new Set(day.today.moves.map((m: any) => m.extId).filter(Boolean));
    for (const w of list) {
      const id = w.id || `${w.startDate}-${w.workoutType}`;
      if (existing.has(id)) continue; // già importato
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

    // I passi diventano minuti di movimento: circa 100 passi al minuto.
    if (steps.value > 300) day.upsertStepsMove(Math.round(steps.value / 100), steps.value);

    lastSync.value = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  }

  async function sync() {
    if (!isNative() || !connected.value) return;
    busy.value = true;
    error.value = null;
    try {
      await readData();
    } catch (e: any) {
      error.value = `Lettura non riuscita: ${e?.message || e}`;
    } finally {
      busy.value = false;
    }
  }

  /** All'avvio ripristina il collegamento se i permessi ci sono ancora. */
  async function restore() {
    if (!import.meta.client) return;
    native.value = isNative();
    if (!native.value || !wasEnabled()) return;

    busy.value = true;
    try {
      const avail = await Health.isHealthAvailable().catch(() => ({ available: false }));
      if (!avail?.available) return;
      const granted = await grantedPermissions();
      if (!granted.length) {
        connected.value = false;
        return;
      }
      connected.value = true;
      await readData();
    } catch {
      // silenzioso: è un ripristino automatico, l'utente non ha chiesto nulla
    } finally {
      busy.value = false;
    }
  }

  onMounted(restore);

  return { native, connected, busy, steps, workouts, lastSync, label, error, connect, disconnect, sync };
}

function mapId(type = "") {
  const t = String(type).toLowerCase();
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
  return map[id] ?? (type ? String(type).replace(/_/g, " ") : "Attività");
}
