// Catalogo attività. I MET vengono dal Compendium of Physical Activities
// (valori a intensità moderata, quella tipica di chi si allena per stare bene).
export interface Activity {
  id: string;
  name: string;
  icon: string; // nome dell'icona lucide
  met: number;
  safe?: boolean; // adatta a chi ha problemi alla schiena
  note?: string;
}

export const ACTIVITIES: Activity[] = [
  { id: "bici", name: "Bici", icon: "Bike", met: 6.8, safe: true, note: "Scarica la colonna meglio della corsa" },
  { id: "camminata", name: "Camminata", icon: "Footprints", met: 3.5, safe: true, note: "In piano, senza forzare" },
  { id: "corsa", name: "Corsa", icon: "Zap", met: 9.8, note: "Impatto alto sulla schiena" },
  { id: "nuoto", name: "Nuoto", icon: "Waves", met: 7.0, safe: true, note: "L'acqua toglie carico alla colonna" },
  { id: "palestra", name: "Palestra", icon: "Dumbbell", met: 5.0 },
  { id: "tennis", name: "Tennis", icon: "Zap", met: 7.3 },
  { id: "calcio", name: "Calcio", icon: "Goal", met: 7.0 },
  { id: "yoga", name: "Yoga", icon: "StretchHorizontal", met: 3.0, safe: true, note: "Ottimo per la mobilità" },
  { id: "trekking", name: "Trekking", icon: "Mountain", met: 6.0 },
  { id: "sci", name: "Sci", icon: "Snowflake", met: 7.0 },
  { id: "canoa", name: "Canoa", icon: "Sailboat", met: 5.8 },
  { id: "danza", name: "Danza", icon: "Music", met: 5.5 },
  { id: "moto", name: "Moto / enduro", icon: "Bike", met: 4.0, note: "Fuoristrada, non su asfalto" },
  { id: "giardinaggio", name: "Giardinaggio", icon: "Sprout", met: 3.8 },
  { id: "mobilita", name: "Mobilità", icon: "StretchHorizontal", met: 2.5, safe: true, note: "Gatto-mucca, ginocchia al petto" },
  { id: "altro", name: "Altro", icon: "CirclePlus", met: 4.0 },
];

export const findActivity = (id: string) => ACTIVITIES.find((a) => a.id === id);

/** Stima delle calorie bruciate: MET × peso(kg) × ore. Resta una stima. */
export function estimateKcal(met: number, minutes: number, weightKg: number) {
  return Math.round(met * weightKg * (minutes / 60));
}
