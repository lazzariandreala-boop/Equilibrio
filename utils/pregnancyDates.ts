import { todayKey, keyToDate } from "~/utils/date";

/**
 * Calcoli della gravidanza.
 *
 * In ostetricia l'età gestazionale si conta dal primo giorno dell'ultima
 * mestruazione, non dal concepimento: l'ovulazione avviene circa 14 giorni
 * dopo, quindi alla data del concepimento corrispondono già "2 settimane".
 * Qui si accetta l'una o l'altra e si converte, perché è facile confonderle.
 */

export const GESTATION_DAYS = 280; // 40 settimane dalla data di riferimento
const OVULATION_OFFSET = 14;

export type DateBasis = "mestruazione" | "concepimento";

/** Riporta qualunque data inserita al riferimento usato dai calcoli. */
export function toReferenceDate(date: string, basis: DateBasis): string {
  if (basis === "mestruazione") return date;
  const d = keyToDate(date);
  d.setDate(d.getDate() - OVULATION_OFFSET);
  return todayKey(d);
}

/** Operazione inversa: utile per mostrare la data di concepimento stimata. */
export function conceptionFrom(reference: string): string {
  const d = keyToDate(reference);
  d.setDate(d.getDate() + OVULATION_OFFSET);
  return todayKey(d);
}

export interface PregnancyInfo {
  /** Giorni trascorsi dal riferimento. */
  days: number;
  weeks: number;
  dayOfWeek: number;
  /** 1, 2 o 3. */
  trimester: number;
  dueDate: string;
  daysToDue: number;
  /** Percentuale di gravidanza trascorsa, limitata a 100. */
  progress: number;
  /** Vero se la data inserita non è plausibile. */
  invalid: boolean;
}

export function pregnancyInfo(reference: string, on = todayKey()): PregnancyInfo {
  const start = keyToDate(reference);
  const day = keyToDate(on);
  const days = Math.floor((day.getTime() - start.getTime()) / 86400000);

  const due = keyToDate(reference);
  due.setDate(due.getDate() + GESTATION_DAYS);

  const weeks = Math.floor(days / 7);
  const trimester = weeks < 14 ? 1 : weeks < 28 ? 2 : 3;

  return {
    days,
    weeks,
    dayOfWeek: days % 7,
    trimester,
    dueDate: todayKey(due),
    daysToDue: Math.ceil((due.getTime() - day.getTime()) / 86400000),
    progress: Math.max(0, Math.min(100, (days / GESTATION_DAYS) * 100)),
    // Date future o oltre le 45 settimane indicano quasi sempre un errore.
    invalid: days < 0 || days > 315,
  };
}

export interface ScheduledCheck {
  /** Settimana indicativa in cui si colloca. */
  week: number;
  title: string;
  detail: string;
}

/**
 * Scaletta indicativa dei controlli in gravidanza secondo le linee guida
 * italiane. Le tempistiche esatte le stabilisce sempre chi segue la gravidanza.
 */
export const PRENATAL_SCHEDULE: ScheduledCheck[] = [
  { week: 7, title: "Prima visita", detail: "Anamnesi, esami del sangue e delle urine, ecografia di datazione." },
  { week: 11, title: "Ecografia del primo trimestre", detail: "Fra 11 e 13 settimane: translucenza nucale e datazione." },
  { week: 16, title: "Controllo del secondo trimestre", detail: "Visita di controllo ed esami di routine." },
  { week: 20, title: "Ecografia morfologica", detail: "Fra 19 e 21 settimane: valuta lo sviluppo degli organi." },
  { week: 24, title: "Curva da carico glicemico", detail: "Fra 24 e 28 settimane, se indicata: screening del diabete gestazionale." },
  { week: 28, title: "Controllo del terzo trimestre", detail: "Esami del sangue, valutazione della crescita." },
  { week: 32, title: "Ecografia di accrescimento", detail: "Fra 30 e 34 settimane: crescita e posizione." },
  { week: 36, title: "Tampone vaginale e rettale", detail: "Fra 35 e 37 settimane: ricerca dello streptococco di gruppo B." },
  { week: 38, title: "Controlli finali", detail: "Monitoraggi ravvicinati fino al parto." },
];

export const TRIMESTER_LABEL: Record<number, string> = {
  1: "Primo trimestre",
  2: "Secondo trimestre",
  3: "Terzo trimestre",
};
