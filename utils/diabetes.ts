/**
 * Calcoli per la gestione del diabete.
 *
 * Le formule sono quelle standard della terapia insulinica:
 *   correzione = (glicemia − obiettivo) / FSI
 *   pasto      = carboidrati / rapporto I:C
 *   totale     = correzione + pasto − insulina ancora attiva
 *
 * Sono stime costruite sui parametri impostati dall'utente: la dose la
 * decide sempre la persona insieme al proprio diabetologo. Per questo ogni
 * risultato viene mostrato scomposto, così da poterlo verificare.
 */

export interface DiabetesParams {
  targetMin: number; // mg/dL
  targetMax: number; // mg/dL
  /** Fattore di sensibilità insulinica: di quanti mg/dL scende con 1 unità. */
  isf: number;
  /** Rapporto insulina/carboidrati: grammi coperti da 1 unità. */
  icr: number;
  /** Durata dell'azione dell'insulina rapida, in ore. */
  duration: number;
  rapidInsulin: string;
  basalInsulin: string;
}

export const DEFAULT_PARAMS: DiabetesParams = {
  targetMin: 80,
  targetMax: 180,
  isf: 30,
  icr: 10,
  duration: 4,
  rapidInsulin: "",
  basalInsulin: "",
};

/** Valore centrale dell'intervallo: è l'obiettivo delle correzioni. */
export const targetMid = (p: DiabetesParams) => Math.round((p.targetMin + p.targetMax) / 2);

export type Range = "bassa" | "in-range" | "alta" | "molto-alta" | "molto-bassa";

export function classify(value: number, p: DiabetesParams): Range {
  if (value < 54) return "molto-bassa";
  if (value < p.targetMin) return "bassa";
  if (value <= p.targetMax) return "in-range";
  if (value <= 250) return "alta";
  return "molto-alta";
}

export const RANGE_TONE: Record<Range, "water" | "move" | "food" | "alcohol"> = {
  "molto-bassa": "alcohol",
  bassa: "food",
  "in-range": "move",
  alta: "food",
  "molto-alta": "alcohol",
};

export const RANGE_LABEL: Record<Range, string> = {
  "molto-bassa": "ipoglicemia grave",
  bassa: "sotto l'obiettivo",
  "in-range": "nell'obiettivo",
  alta: "sopra l'obiettivo",
  "molto-alta": "molto alta",
};

export interface BolusEntry {
  at: number;
  units: number;
}

/**
 * Insulina ancora attiva, con decadimento lineare sulla durata impostata.
 * È un'approssimazione, ma serve a non sommare boli troppo ravvicinati.
 */
export function insulinOnBoard(boluses: BolusEntry[], p: DiabetesParams, now = Date.now()): number {
  const ms = p.duration * 3600000;
  let total = 0;
  for (const b of boluses) {
    const elapsed = now - b.at;
    if (elapsed < 0 || elapsed >= ms) continue;
    total += b.units * (1 - elapsed / ms);
  }
  return Math.round(total * 10) / 10;
}

export interface BolusSuggestion {
  correction: number;
  meal: number;
  iob: number;
  total: number;
  /** Totale arrotondato al mezzo, come le penne da 0,5 unità. */
  rounded: number;
  /** Avvisi da mostrare accanto al risultato. */
  warnings: string[];
  /** Vero quando non ha senso proporre insulina. */
  hypo: boolean;
  /** Grammi di zuccheri suggeriti per risalire, in caso di ipoglicemia. */
  carbsToRecover: number;
}

export function suggestBolus(opts: {
  glucose?: number | null;
  carbs?: number;
  params: DiabetesParams;
  iob?: number;
}): BolusSuggestion {
  const { params: p } = opts;
  const carbs = Math.max(0, opts.carbs ?? 0);
  const iob = Math.max(0, opts.iob ?? 0);
  const bg = opts.glucose ?? null;
  const warnings: string[] = [];

  const target = targetMid(p);
  const meal = p.icr > 0 ? carbs / p.icr : 0;

  let correction = 0;
  if (bg !== null && p.isf > 0) {
    correction = (bg - target) / p.isf;
  }

  // Sotto l'obiettivo la priorità è risalire, non iniettare.
  const hypo = bg !== null && bg < p.targetMin;
  const carbsToRecover =
    hypo && p.isf > 0 && p.icr > 0 ? Math.ceil(((target - (bg as number)) * p.icr) / p.isf) : 0;

  let total = meal + correction - iob;
  if (total < 0) total = 0;

  if (bg !== null && bg < 54) {
    warnings.push("Glicemia molto bassa: tratta subito l'ipoglicemia, l'insulina non va fatta ora.");
  } else if (hypo) {
    warnings.push("Glicemia sotto l'obiettivo: valuta di correggere con zuccheri prima di iniettare.");
  }
  if (iob > 0) {
    warnings.push(`Sono state sottratte ${iob} unità ancora attive da boli recenti.`);
  }
  if (bg !== null && bg > 250) {
    warnings.push("Glicemia molto alta: può valere la pena controllare i chetoni.");
  }
  if (total > 20) {
    warnings.push("Dose insolitamente alta: ricontrolla i valori inseriti prima di procedere.");
  }

  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    correction: round(correction),
    meal: round(meal),
    iob: round(iob),
    total: round(total),
    rounded: Math.round(total * 2) / 2,
    warnings,
    hypo,
    carbsToRecover,
  };
}

/** Indice di gestione del glucosio, stima dell'emoglobina glicata. */
export function estimatedA1c(averageMgDl: number): number {
  // Formula GMI: 3,31 + 0,02392 × media glicemica in mg/dL
  return Math.round((3.31 + 0.02392 * averageMgDl) * 10) / 10;
}

export interface RangeStats {
  count: number;
  average: number;
  inRange: number; // percentuale
  below: number;
  above: number;
  gmi: number | null;
}

export function rangeStats(values: number[], p: DiabetesParams): RangeStats {
  if (!values.length) {
    return { count: 0, average: 0, inRange: 0, below: 0, above: 0, gmi: null };
  }
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const below = values.filter((v) => v < p.targetMin).length;
  const above = values.filter((v) => v > p.targetMax).length;
  const inside = values.length - below - above;
  const pct = (n: number) => Math.round((n / values.length) * 100);

  return {
    count: values.length,
    average: Math.round(avg),
    inRange: pct(inside),
    below: pct(below),
    above: pct(above),
    gmi: estimatedA1c(avg),
  };
}

export const READING_TAGS = [
  "a digiuno",
  "prima del pasto",
  "dopo il pasto",
  "prima di dormire",
  "notte",
  "dopo attività",
  "altro",
] as const;

export type ReadingTag = (typeof READING_TAGS)[number];

/**
 * Tendenza della glicemia fra le ultime due misurazioni.
 *
 * Con le misurazioni capillari i valori sono sporadici: calcolare una pendenza
 * fra letture distanti ore darebbe un numero senza significato. Per questo la
 * tendenza si calcola solo se le due misure distano meno di 90 minuti.
 */
export type TrendKind = "crollo" | "scende" | "stabile" | "sale" | "impennata" | "sconosciuta";

export interface Trend {
  kind: TrendKind;
  /** Variazione in mg/dL al minuto. */
  rate: number;
  /** Differenza assoluta fra le due misurazioni. */
  delta: number;
  minutes: number;
  arrow: string;
  label: string;
  /** Rotazione della freccia, in gradi. */
  rotation: number;
}

const TREND_WINDOW_MIN = 90;

export function glucoseTrend(readings: { at: number; value: number }[]): Trend {
  const unknown: Trend = {
    kind: "sconosciuta",
    rate: 0,
    delta: 0,
    minutes: 0,
    arrow: "→",
    label: "tendenza non calcolabile",
    rotation: 0,
  };

  const sorted = [...readings].sort((a, b) => b.at - a.at);
  if (sorted.length < 2) return unknown;

  const [last, prev] = sorted;
  const minutes = (last.at - prev.at) / 60000;
  if (minutes <= 0 || minutes > TREND_WINDOW_MIN) return unknown;

  const delta = last.value - prev.value;
  const rate = delta / minutes;

  // Soglie analoghe a quelle usate dai sensori in continuo.
  let kind: TrendKind;
  if (rate <= -3) kind = "crollo";
  else if (rate <= -1) kind = "scende";
  else if (rate < 1) kind = "stabile";
  else if (rate < 3) kind = "sale";
  else kind = "impennata";

  const meta: Record<Exclude<TrendKind, "sconosciuta">, { arrow: string; label: string; rotation: number }> = {
    crollo: { arrow: "↓", label: "in rapida discesa", rotation: 0 },
    scende: { arrow: "↘", label: "in lenta discesa", rotation: 0 },
    stabile: { arrow: "→", label: "stabile", rotation: 0 },
    sale: { arrow: "↗", label: "in lenta salita", rotation: 0 },
    impennata: { arrow: "↑", label: "in rapida salita", rotation: 0 },
  };

  return {
    kind,
    rate: Math.round(rate * 100) / 100,
    delta,
    minutes: Math.round(minutes),
    ...meta[kind],
  };
}

export const TREND_TONE: Record<TrendKind, "water" | "move" | "food" | "alcohol"> = {
  crollo: "alcohol",
  scende: "food",
  stabile: "move",
  sale: "food",
  impennata: "alcohol",
};
