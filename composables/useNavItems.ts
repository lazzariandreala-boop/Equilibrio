import {
  Home, Utensils, Activity, CalendarDays, User, Scale, Droplet, Baby, CalendarHeart,
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
  /** Nascosto sul desktop, dove la sezione vive nella dashboard. */
  mobileOnly?: boolean;
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
      { to: "/corpo", icon: Scale, label: "Corpo", tone: "water" },
    ];

    if (settings.profile.diabetes) {
      list.push({ to: "/glicemia", icon: Droplet, label: "Glicemia", tone: "water" });
    }
    // In gravidanza le previsioni del ciclo sono sospese: si mostra la sezione
    // dedicata al posto di quella del ciclo, non entrambe.
    if (settings.profile.pregnant) {
      list.push({ to: "/gravidanza", icon: Baby, label: "Gravidanza", tone: "alcohol" });
    } else if (settings.profile.cycleTracking) {
      list.push({ to: "/ciclo", icon: CalendarHeart, label: "Ciclo", tone: "alcohol" });
    }

    list.push(
      { to: "/storico", icon: CalendarDays, label: "Storico", tone: "alcohol" },
      { to: "/profilo", icon: User, label: "Profilo", tone: "water" },
    );
    return list;
  });

  // Acqua e Alcol sono figlie della dashboard: la voce "Oggi" resta accesa.
  const isActive = (to: string) =>
    to === "/" ? ["/", "/acqua", "/alcol"].includes(route.path) : route.path === to;

  return { items, isActive };
}
