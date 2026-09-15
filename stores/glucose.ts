import { defineStore } from "pinia";
import type { ReadingTag, TrendKind, MoodKey } from "~/utils/diabetes";

export interface Reading {
  id: string;
  at: number;
  value: number; // mg/dL
  tag: ReadingTag;
  notes?: string;
  /** Andamento indicato da chi misura (o letto dal sensore). */
  trend?: TrendKind;
  /** Stato d'animo al momento della misurazione. */
  mood?: MoodKey;
  /** Giornata con attività fisica: incide sull'andamento. */
  sport?: boolean;
}

export interface Bolus {
  id: string;
  at: number;
  units: number;
  kind: "pasto" | "correzione" | "misto" | "basale";
  carbs?: number;
  glucose?: number;
  notes?: string;
}

const id = () => Math.random().toString(36).slice(2, 10);

export const useGlucoseStore = defineStore("glucose", {
  state: () => ({
    readings: [] as Reading[],
    boluses: [] as Bolus[],
  }),

  getters: {
    /** Dalla più recente. */
    sortedReadings(state): Reading[] {
      return [...state.readings].sort((a, b) => b.at - a.at);
    },
    lastReading(): Reading | null {
      return this.sortedReadings[0] ?? null;
    },
    sortedBoluses(state): Bolus[] {
      return [...state.boluses].sort((a, b) => b.at - a.at);
    },
    /** Boli delle ultime ore: servono al calcolo dell'insulina attiva. */
    recentBoluses(state) {
      return (hours: number) => {
        const from = Date.now() - hours * 3600000;
        return state.boluses.filter((b) => b.at >= from && b.kind !== "basale");
      };
    },
  },

  actions: {
    addReading(r: Omit<Reading, "id">) {
      this.readings.push({ ...r, id: id() });
    },
    updateReading(rid: string, patch: Partial<Reading>) {
      const i = this.readings.findIndex((r) => r.id === rid);
      if (i >= 0) this.readings[i] = { ...this.readings[i], ...patch };
    },
    removeReading(rid: string) {
      this.readings = this.readings.filter((r) => r.id !== rid);
    },

    addBolus(b: Omit<Bolus, "id" | "at"> & { at?: number }) {
      this.boluses.push({ ...b, id: id(), at: b.at ?? Date.now() });
    },
    removeBolus(bid: string) {
      this.boluses = this.boluses.filter((b) => b.id !== bid);
    },

    /** Valori registrati negli ultimi giorni, per le statistiche. */
    valuesSince(days: number): number[] {
      const from = Date.now() - days * 86400000;
      return this.readings.filter((r) => r.at >= from).map((r) => r.value);
    },

    hydrate(raw: any) {
      if (!raw) return;
      if (Array.isArray(raw.readings)) this.readings = raw.readings;
      if (Array.isArray(raw.boluses)) this.boluses = raw.boluses;
    },
  },
});
