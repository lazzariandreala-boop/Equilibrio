// Catalogo attività. I MET vengono dal Compendium of Physical Activities
// (valori a intensità moderata, quella tipica di chi si muove per stare bene).
// Ogni attività ha un colore proprio: una griglia tutta della stessa tinta
// non aiuta a riconoscere le voci a colpo d'occhio.
export interface Activity {
  id: string;
  name: string;
  icon: string; // nome dell'icona lucide
  color: string; // tinta identificativa
  met: number;
  safe?: boolean; // a basso impatto sulla colonna
  note?: string;
}

export const ACTIVITIES: Activity[] = [
  { id: "bici", name: "Bici", icon: "Bike", color: "#34d07f", met: 6.8, safe: true, note: "Scarica la colonna meglio della corsa" },
  { id: "camminata", name: "Camminata", icon: "Footprints", color: "#4ecdc4", met: 3.5, safe: true, note: "In piano, senza forzare" },
  { id: "corsa", name: "Corsa", icon: "Rabbit", color: "#ff8f45", met: 9.8, note: "Impatto alto sulla schiena" },
  { id: "nuoto", name: "Nuoto", icon: "Waves", color: "#3aa8e0", met: 7.0, safe: true, note: "L'acqua toglie carico alla colonna" },
  { id: "palestra", name: "Palestra", icon: "Dumbbell", color: "#a76ce8", met: 5.0 },
  { id: "tennis", name: "Tennis", icon: "Target", color: "#d9d334", met: 7.3 },
  { id: "calcio", name: "Calcio", icon: "Trophy", color: "#2f9e6b", met: 7.0 },
  { id: "yoga", name: "Yoga", icon: "PersonStanding", color: "#e87ec0", met: 3.0, safe: true, note: "Ottimo per la mobilità" },
  { id: "trekking", name: "Trekking", icon: "Mountain", color: "#c98a3e", met: 6.0 },
  { id: "sci", name: "Sci", icon: "Snowflake", color: "#7fd3f0", met: 7.0 },
  { id: "canoa", name: "Canoa", icon: "Sailboat", color: "#4a7fd4", met: 5.8 },
  { id: "danza", name: "Danza", icon: "Music", color: "#e8608f", met: 5.5 },
  { id: "moto", name: "Moto / enduro", icon: "Flame", color: "#e05252", met: 4.0, note: "Fuoristrada, non su asfalto" },
  { id: "giardinaggio", name: "Giardinaggio", icon: "Sprout", color: "#8bbf42", met: 3.8 },
  { id: "mobilita", name: "Mobilità", icon: "Move3d", color: "#f0a868", met: 2.5, safe: true, note: "Gatto-mucca, ginocchia al petto" },
  { id: "altro", name: "Altro", icon: "CirclePlus", color: "#9c9187", met: 4.0 },
];

export const findActivity = (id: string) => ACTIVITIES.find((a) => a.id === id);

/** Stima delle calorie bruciate: MET × peso(kg) × ore. Resta una stima. */
export function estimateKcal(met: number, minutes: number, weightKg: number) {
  return Math.round(met * weightKg * (minutes / 60));
}

/** Versione trasparente di un colore esadecimale, per gli sfondi tenui. */
export function tint(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
