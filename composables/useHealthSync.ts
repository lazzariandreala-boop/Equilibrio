import { useDayStore } from "~/stores/day";
import { todayKey } from "~/utils/date";

/**
 * Legge passi e allenamenti dalla piattaforma salute del telefono:
 * Health Connect su Android, HealthKit su iPhone.
 *
 * Attenzione: NON tutte le app scrivono su Health Connect. Samsung Health,
 * Garmin Connect, Fitbit e Google Health sì; Huawei Health no, perché HMS e
 * GMS restano ecosistemi separati e non esiste un ponte nativo. Per i dati
 * Huawei serve un'app tramite (per esempio Health Sync) che li ricopi in
 * Health Connect.
 *
 * Il plugin nativo esiste solo nella build Capacitor: nel browser il
 * composable resta inerte e l'interfaccia lo dichiara.
 */

export function useHealthSync() {
  const day = useDayStore();
  const available = useState("health:available", () => false);
  const connected = useState("health:connected", () => false);
  const busy = useState("health:busy", () => false);
  const lastSync = useState<string | null>("health:lastSync", () => null);
  const steps = useState("health:steps", () => 0);
  const native = useState("health:native", () => false);
  const error = useState<string | null>("health:error", () => null);

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
    if (!native.value) return "Disponibile solo nell'app installata";
    if (busy.value) return "Sincronizzo…";
    if (!connected.value) return "Tocca Collega per autorizzare la lettura";
    const s = steps.value ? `${steps.value.toLocaleString("it-IT")} passi oggi` : "Collegato";
    return lastSync.value ? `${s} · aggiornato alle ${lastSync.value}` : s;
  });

  async function check() {
    if (import.meta.client) {
      native.value = !!(window as any).Capacitor?.isNativePlatform?.();
    }
    const H = await plugin();
    if (!H) return;
    try {
      // Nota: su Android 14+ Health Connect è un modulo di sistema e questo
      // controllo può rispondere "non disponibile" pur essendo installato.
      // Perciò il valore è solo informativo: non blocca i pulsanti.
      const res = await H.isHealthAvailable().catch(() => null);
      available.value = !!res?.available;
      // Se i permessi sono già stati concessi in passato, si riparte collegati.
      const perms = await H.checkHealthPermissions({
        permissions: ["READ_STEPS", "READ_WORKOUTS"],
      }).catch(() => null);
      // La risposta è un array di oggetti { NOME_PERMESSO: true|false }
      const granted = (perms?.permissions ?? []).some((entry: any) =>
        Object.values(entry ?? {}).some(Boolean),
      );
      if (granted) {
        connected.value = true;
        await sync();
      }
    } catch {
      available.value = false;
    }
  }

  async function connect() {
    const H = await plugin();
    if (!H) return;
    busy.value = true;
    error.value = null;
    try {
      await H.requestHealthPermissions({
        permissions: ["READ_STEPS", "READ_WORKOUTS", "READ_ACTIVE_CALORIES", "READ_DISTANCE"],
      });
      connected.value = true;
      await sync();
    } catch (e: any) {
      connected.value = false;
      const msg = String(e?.message || e || "");
      error.value = /available|provider|sdk/i.test(msg)
        ? "Health Connect non risponde. Aprilo, controlla che Equilibrio sia fra le app autorizzate, poi riprova."
        : "Permessi non concessi. Aprili in Health Connect e riprova.";
    } finally {
      busy.value = false;
    }
  }

  /** Porta in Equilibrio passi e allenamenti di oggi, senza creare doppioni. */
  async function sync() {
    const H = await plugin();
    if (!H) return;
    busy.value = true;
    error.value = null;
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

      // I passi diventano minuti di movimento: circa 100 passi al minuto a
      // passo normale. Senza questo restavano un numero senza effetto.
      if (steps.value > 300) {
        day.upsertStepsMove(Math.round(steps.value / 100), steps.value);
      }

      lastSync.value = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
      if (!steps.value && !(wk?.workouts?.length ?? 0)) {
        error.value =
          "Nessun dato trovato per oggi. Controlla in Health Connect che Equilibrio abbia i permessi di lettura per passi e allenamenti.";
      }
    } catch (e: any) {
      error.value = "Lettura non riuscita. Apri Health Connect e verifica i permessi di Equilibrio.";
    } finally {
      busy.value = false;
    }
  }

  /** Passi convertiti in minuti di movimento, per chi non registra allenamenti. */
  const stepsAsMinutes = computed(() => Math.round(steps.value / 100));

  onMounted(check);

  return {
    available, connected, busy, steps, stepsAsMinutes, lastSync, label,
    native, error, connect, sync, install, openSettings,
  };
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
