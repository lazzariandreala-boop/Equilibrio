import { useDayStore } from "~/stores/day";
import { useSettingsStore } from "~/stores/settings";
import { useGlucoseStore } from "~/stores/glucose";
import { useCycleStore } from "~/stores/cycle";
import { usePregnancyStore } from "~/stores/pregnancy";
import { SECTION_LABEL, type ReportSection } from "~/utils/report";
import logoDark from "~/assets/logo-dark.png";

/** Esportazione dei dati in PDF ed eliminazione dell'account. */
export function useDataExport() {
  const day = useDayStore();
  const settings = useSettingsStore();
  const glucose = useGlucoseStore();
  const cycle = useCycleStore();
  const preg = usePregnancyStore();
  const { user } = useAuth();

  /** Sezioni esportabili: quelle dei moduli spenti non compaiono. */
  const sections = computed(() => {
    const list: ReportSection[] = ["tutto", "pasti", "movimento", "acqua"];
    if (settings.profile.diabetes) list.push("glicemia");
    if (settings.profile.cycleTracking) list.push("ciclo");
    if (settings.profile.pregnant) list.push("gravidanza");
    return list.map((key) => ({ key, label: SECTION_LABEL[key] }));
  });

  /** Il logo va incorporato nel PDF come immagine, non come indirizzo. */
  async function logoDataUrl(): Promise<string | undefined> {
    try {
      const blob = await (await fetch(logoDark)).blob();
      return await new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => resolve(undefined);
        r.readAsDataURL(blob);
      });
    } catch {
      return undefined;
    }
  }

  async function exportPdf(section: ReportSection, periodDays: number) {
    // Caricato solo quando serve: la libreria pesa e non va nel caricamento iniziale.
    const { buildReport } = await import("~/utils/report");

    const doc = buildReport(
      {
        userName: user.value?.name || user.value?.email || "",
        days: day.days,
        goals: settings.goals,
        diabetes: settings.diabetes,
        readings: glucose.readings,
        boluses: glucose.boluses,
        cycles: cycle.entries,
        cycleAverage: cycle.averageLength,
        pregnancy: { reference: preg.reference, appointments: preg.appointments },
        enabled: {
          diabetes: settings.profile.diabetes,
          cycle: settings.profile.cycleTracking,
          pregnant: settings.profile.pregnant,
        },
        logo: await logoDataUrl(),
      },
      section,
      periodDays,
    );

    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `Equilibrio-${SECTION_LABEL[section].replace(/\s+/g, "-")}-${stamp}.pdf`;
    await saveFile(filename, doc.output("datauristring").split(",")[1]);
  }

  /**
   * Nell'app installata un normale download non funziona: la WebView non ha
   * una cartella di download. Si scrive il file nella cache e si apre il
   * pannello di condivisione, da cui salvarlo o mandarlo al medico.
   */
  async function saveFile(filename: string, base64: string) {
    const native = !!(window as any).Capacitor?.isNativePlatform?.();
    if (!native) {
      const a = document.createElement("a");
      a.href = `data:application/pdf;base64,${base64}`;
      a.download = filename;
      a.click();
      return;
    }
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const { Share } = await import("@capacitor/share");
    const written = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
    await Share.share({ title: filename, url: written.uri, dialogTitle: "Salva o condividi il rapporto" });
  }

  /**
   * Elimina definitivamente i dati dal cloud e l'account. Firebase rifiuta la
   * cancellazione se l'accesso non è recente: in quel caso lo si comunica,
   * invece di lasciare l'account a metà.
   */
  async function deleteAccount(): Promise<{ ok: boolean; message: string }> {
    const { $firebase } = useNuxtApp() as any;
    const current = $firebase?.auth?.currentUser;
    if (!current) return { ok: false, message: "Nessun account collegato." };

    try {
      const { doc, deleteDoc } = await import("firebase/firestore");
      const { deleteUser } = await import("firebase/auth");
      await deleteDoc(doc($firebase.db, "users", current.uid));
      await deleteUser(current);
    } catch (e: any) {
      if (e?.code === "auth/requires-recent-login") {
        return {
          ok: false,
          message: "Per sicurezza serve un accesso recente: esci, accedi di nuovo e ripeti l'eliminazione.",
        };
      }
      return { ok: false, message: `Eliminazione non riuscita: ${e?.message || e}` };
    }

    // Anche i dati salvati sul dispositivo vanno tolti, non solo quelli nel cloud.
    Object.keys(localStorage)
      .filter((k) => k.startsWith("equilibrio:"))
      .forEach((k) => localStorage.removeItem(k));
    return { ok: true, message: "Account eliminato." };
  }

  return { sections, exportPdf, deleteAccount };
}
