import { useSettingsStore } from "~/stores/settings";

// Pianifica i promemoria. Su nativo usa @capacitor/local-notifications,
// sul web prova le Notification API (solo a finestra aperta).
export function useNotifications() {
  const settings = useSettingsStore();

  async function isNative() {
    try {
      const { Capacitor } = await import("@capacitor/core");
      return Capacitor.isNativePlatform();
    } catch {
      return false;
    }
  }

  async function requestPermission() {
    if (await isNative()) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const res = await LocalNotifications.requestPermissions();
      return res.display === "granted";
    }
    if ("Notification" in window) {
      const r = await Notification.requestPermission();
      return r === "granted";
    }
    return false;
  }

  function buildSchedule() {
    const items: { id: number; title: string; body: string; hh: number; mm: number }[] = [];
    let id = 1;
    if (settings.reminders.water) {
      for (const t of settings.reminders.waterTimes) {
        const [hh, mm] = t.split(":").map(Number);
        items.push({ id: id++, title: "Bevi un bicchiere", body: "Un sorso adesso. Piccoli passi.", hh, mm });
      }
    }
    if (settings.reminders.evening) {
      const [hh, mm] = settings.reminders.eveningTime.split(":").map(Number);
      items.push({ id: id++, title: "Check serale", body: "Com'è andata oggi con l'alcol? Nessun giudizio.", hh, mm });
    }
    return items;
  }

  async function schedule() {
    if (!(await isNative())) return false; // background reale solo su nativo
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: (await LocalNotifications.getPending()).notifications });
    const notifications = buildSchedule().map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      schedule: { on: { hour: n.hh, minute: n.mm }, repeats: true, every: "day" as const },
    }));
    await LocalNotifications.schedule({ notifications });
    return true;
  }

  async function testNow() {
    if (await isNative()) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      await LocalNotifications.schedule({
        notifications: [{ id: 999, title: "Equilibrio", body: "Promemoria attivi ✓", schedule: { at: new Date(Date.now() + 2000) } }],
      });
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Equilibrio", { body: "Promemoria attivi ✓" });
    }
  }

  return { requestPermission, schedule, testNow };
}
