import {
  Home, Utensils, Activity, CalendarDays, User, Scale, Droplet, Baby, CalendarHeart, HeartPulse,
} from "lucide-vue-next";
import { useSettingsStore } from "~/stores/settings";

/**
 * Voci di navigazione, condivise fra la barra in basso (mobile) e il menù
 * laterale (desktop): tenerle in un posto solo evita che le due si allontanino.
 */
export interface NavItem {
  to: string;
  icon: any;
  label: string;
  tone: string;
  /** Nascosto sul desktop, dove la sezione vive in una pagina riassuntiva. */
  mobileOnly?: boolean;
  /** Mostrato solo sul desktop. */
  desktopOnly?: boolean;
}

export function useNavItems() {
  const settings = useSettingsStore();
  const route = useRoute();

  const items = computed(() => {
    const list: NavItem[] = [
      { to: "/", icon: Home, label: "Oggi", tone: "water" },
      // Su desktop pasti e movimento hanno un pannello nella dashboard:
      // tenerli anche nel menù sarebbe un doppione.
      { to: "/pasti", icon: Utensils, label: "Pasti", tone: "food", mobileOnly: true },
      { to: "/movimento", icon: Activity, label: "Sport", tone: "move", mobileOnly: true },
      { to: "/corpo", icon: Scale, label: "Corpo", tone: "water", mobileOnly: true },
      // Sul desktop le sezioni salute confluiscono in una pagina unica.
      { to: "/salute", icon: HeartPulse, label: "Salute", tone: "water", desktopOnly: true },
    ];

    if (settings.profile.diabetes) {
      list.push({ to: "/glicemia", icon: Droplet, label: "Glicemia", tone: "water", mobileOnly: true });
    }
    // In gravidanza le previsioni del ciclo sono sospese: si mostra la sezione
    // dedicata al posto di quella del ciclo, non entrambe.
    if (settings.profile.pregnant) {
      list.push({ to: "/gravidanza", icon: Baby, label: "Gravidanza", tone: "alcohol", mobileOnly: true });
    } else if (settings.profile.cycleTracking) {
      list.push({ to: "/ciclo", icon: CalendarHeart, label: "Ciclo", tone: "alcohol", mobileOnly: true });
    }

    list.push(
      { to: "/storico", icon: CalendarDays, label: "Storico", tone: "alcohol", mobileOnly: true },
      { to: "/profilo", icon: User, label: "Profilo", tone: "water" },
    );
    return list;
  });

  // Acqua e Alcol sono figlie della dashboard: la voce "Oggi" resta accesa.
  const isActive = (to: string) =>
    to === "/" ? ["/", "/acqua", "/alcol"].includes(route.path) : route.path === to;

  return { items, isActive };
}
