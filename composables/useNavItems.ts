import {
  Home, Utensils, Activity, User, HeartPulse, Droplet, Baby, CalendarHeart,
} from "lucide-vue-next";
import { useSettingsStore } from "~/stores/settings";

export interface NavItem {
  to: string;
  icon: any;
  label: string;
  tone: string;
}

/** Pagine che fanno parte della sezione Salute: la sua voce resta accesa. */
const HEALTH_ROUTES = ["/salute", "/corpo", "/storico"];

/**
 * Voci di navigazione, condivise fra barra in basso, menù laterale e header.
 *
 * La barra ha sempre le stesse cinque voci: le linee guida di Android e iOS
 * ne indicano al massimo cinque, e oltre quel numero o si comprimono le
 * etichette o si fa scorrere la barra, nascondendo voci a chi non sa che ci
 * sono. I moduli facoltativi (glicemia, ciclo, gravidanza) diventano invece
 * scorciatoie nell'header, visibili solo se attivi.
 */
export function useNavItems() {
  const settings = useSettingsStore();
  const route = useRoute();

  /** Barra in basso del telefono: fissa, sempre cinque voci. */
  const mobileItems = computed<NavItem[]>(() => [
    { to: "/", icon: Home, label: "Oggi", tone: "water" },
    { to: "/pasti", icon: Utensils, label: "Pasti", tone: "food" },
    { to: "/movimento", icon: Activity, label: "Sport", tone: "move" },
    { to: "/salute", icon: HeartPulse, label: "Salute", tone: "alcohol" },
    { to: "/profilo", icon: User, label: "Profilo", tone: "water" },
  ]);

  /** Menù laterale del desktop: pasti e sport vivono nella dashboard. */
  const desktopItems = computed<NavItem[]>(() => [
    { to: "/", icon: Home, label: "Oggi", tone: "water" },
    { to: "/salute", icon: HeartPulse, label: "Salute", tone: "alcohol" },
    { to: "/profilo", icon: User, label: "Profilo", tone: "water" },
  ]);

  /** Moduli facoltativi attivi: compaiono solo se la loro spunta è accesa. */
  const modules = computed<NavItem[]>(() => {
    const list: NavItem[] = [];
    if (settings.profile.diabetes) list.push({ to: "/glicemia", icon: Droplet, label: "Glicemia", tone: "water" });
    if (settings.profile.pregnant) list.push({ to: "/gravidanza", icon: Baby, label: "Gravidanza", tone: "alcohol" });
    if (settings.profile.cycleTracking) list.push({ to: "/ciclo", icon: CalendarHeart, label: "Ciclo", tone: "alcohol" });
    return list;
  });

  const isActive = (to: string) => {
    if (to === "/") return ["/", "/acqua", "/alcol"].includes(route.path);
    if (to === "/salute") return HEALTH_ROUTES.includes(route.path);
    return route.path === to;
  };

  // Compatibilità con chi usava ancora l'elenco unico.
  const items = mobileItems;

  return { items, mobileItems, desktopItems, modules, isActive };
}
