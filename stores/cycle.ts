import { defineStore } from "pinia";
import { todayKey, keyToDate } from "~/utils/date";

export interface CycleEntry {
  /** Data di inizio, formato YYYY-MM-DD. */
  start: string;
  /** Data di fine, assente se il ciclo è ancora in corso. */
  end?: string;
  flow?: "leggero" | "normale" | "abbondante";
  /** Dolore da 0 (nessuno) a 3 (forte). */
  pain?: number;
  /** Sintomi selezionati, per esempio "svenimento" o "dolori addominali forti". */
  symptoms?: string[];
  notes?: string;
}

/** Durata usata finché non ci sono abbastanza dati per calcolarla. */
const DEFAULT_LENGTH = 28;

/** Giorni di tolleranza prima di parlare di anticipo o ritardo. */
export const TOLERANCE = 3;

const daysBetween = (a: string, b: string) =>
  Math.round((keyToDate(b).getTime() - keyToDate(a).getTime()) / 86400000);

const addDays = (key: string, n: number) => {
  const d = keyToDate(key);
  d.setDate(d.getDate() + n);
  return todayKey(d);
};

export const useCycleStore = defineStore("cycle", {
  state: () => ({
    entries: [] as CycleEntry[],
  }),

  getters: {
    /** Dal più recente al più vecchio. */
    sorted(state): CycleEntry[] {
      return [...state.entries].sort((a, b) => (a.start < b.start ? 1 : -1));
    },

    last(): CycleEntry | null {
      return this.sorted[0] ?? null;
    },

    /**
     * Durata media del ciclo, calcolata sugli ultimi intervalli disponibili.
     * Con meno di due registrazioni si usa il valore convenzionale di 28 giorni.
     */
    averageLength(): number {
      const starts = this.sorted.map((e: CycleEntry) => e.start).slice(0, 7);
      if (starts.length < 2) return DEFAULT_LENGTH;

      const gaps: number[] = [];
      for (let i = 0; i < starts.length - 1; i++) {
        const gap = daysBetween(starts[i + 1], starts[i]);
        // Intervalli implausibili (registrazioni doppie o errori) vanno scartati
        // per non falsare la media.
        if (gap >= 15 && gap <= 60) gaps.push(gap);
      }
      if (!gaps.length) return DEFAULT_LENGTH;
      return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    },

    /** Durata media dei giorni di flusso, sui cicli conclusi. */
    averageDuration(): number | null {
      const done = this.sorted.filter((e: CycleEntry) => e.end);
      if (!done.length) return null;
      const lens = done.slice(0, 6).map((e: CycleEntry) => daysBetween(e.start, e.end!) + 1);
      return Math.round(lens.reduce((a, b) => a + b, 0) / lens.length);
    },

    /** Data prevista del prossimo inizio. Null se non ci sono registrazioni. */
    predictedStart(): string | null {
      if (!this.last) return null;
      return addDays(this.last.start, this.averageLength);
    },

    /** Giorno del ciclo in corso, contando dall'ultimo inizio. */
    dayOfCycle(): number | null {
      if (!this.last) return null;
      return daysBetween(this.last.start, todayKey()) + 1;
    },

    /**
     * Stato rispetto alla previsione. "in-corso" ha la precedenza: se il
     * ciclo è attivo adesso, non ha senso parlare di attesa o ritardo.
     */
    status(): {
      kind: "nessun-dato" | "in-corso" | "atteso" | "in-arrivo" | "in-ritardo";
      days: number;
      predicted: string | null;
    } {
      const predicted = this.predictedStart;
      if (!this.last) return { kind: "nessun-dato", days: 0, predicted: null };

      const today = todayKey();
      // Ciclo ancora aperto, oppure chiuso ma non ancora terminato.
      if (!this.last.end && daysBetween(this.last.start, today) >= 0) {
        return { kind: "in-corso", days: this.dayOfCycle ?? 1, predicted };
      }

      const diff = daysBetween(predicted!, today); // >0 = previsione superata
      if (diff > TOLERANCE) return { kind: "in-ritardo", days: diff, predicted };
      if (diff >= -TOLERANCE) return { kind: "in-arrivo", days: Math.abs(diff), predicted };
      return { kind: "atteso", days: Math.abs(diff), predicted };
    },
  },

  actions: {
    /** Registra un nuovo ciclo, evitando doppioni sulla stessa data. */
    add(entry: CycleEntry) {
      if (this.entries.some((e) => e.start === entry.start)) {
        this.update(entry.start, entry);
        return;
      }
      this.entries.push({ ...entry });
    },

    update(start: string, patch: Partial<CycleEntry>) {
      const i = this.entries.findIndex((e) => e.start === start);
      if (i >= 0) this.entries[i] = { ...this.entries[i], ...patch, start: patch.start ?? start };
    },

    remove(start: string) {
      this.entries = this.entries.filter((e) => e.start !== start);
    },

    /**
     * Quanto è arrivato prima o dopo rispetto alla previsione basata sui
     * cicli precedenti. Serve a mostrare "in anticipo" o "in ritardo" nello storico.
     */
    deviationOf(entry: CycleEntry): number | null {
      const previous = this.sorted.filter((e: CycleEntry) => e.start < entry.start);
      if (previous.length < 2) return null;

      const gaps: number[] = [];
      for (let i = 0; i < Math.min(previous.length - 1, 6); i++) {
        const gap = daysBetween(previous[i + 1].start, previous[i].start);
        if (gap >= 15 && gap <= 60) gaps.push(gap);
      }
      if (!gaps.length) return null;

      const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
      const expected = addDays(previous[0].start, avg);
      return daysBetween(expected, entry.start);
    },

    hydrate(raw: any) {
      if (!raw) return;
      if (Array.isArray(raw.entries)) this.entries = raw.entries;
    },
  },
});
