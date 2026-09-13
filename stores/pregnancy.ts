import { defineStore } from "pinia";
import { todayKey } from "~/utils/date";
import { toReferenceDate, type DateBasis } from "~/utils/pregnancyDates";

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  title: string;
  place?: string;
  notes?: string;
  done?: boolean;
}

export const usePregnancyStore = defineStore("pregnancy", {
  state: () => ({
    /** Primo giorno dell'ultima mestruazione: è il riferimento dei calcoli. */
    reference: "" as string,
    /** Come è stata inserita la data, per poterla rimostrare com'era. */
    basis: "mestruazione" as DateBasis,
    /** Data digitata dall'utente, prima della conversione. */
    entered: "" as string,
    appointments: [] as Appointment[],
  }),

  getters: {
    configured(state): boolean {
      return !!state.reference;
    },
    sortedAppointments(state): Appointment[] {
      return [...state.appointments].sort((a, b) =>
        `${a.date}${a.time || ""}` < `${b.date}${b.time || ""}` ? -1 : 1,
      );
    },
    upcoming(): Appointment[] {
      const t = todayKey();
      return this.sortedAppointments.filter((a: Appointment) => !a.done && a.date >= t);
    },
    past(): Appointment[] {
      const t = todayKey();
      return this.sortedAppointments.filter((a: Appointment) => a.done || a.date < t).reverse();
    },
  },

  actions: {
    /** Imposta la data, convertendola se indicata come concepimento. */
    setDate(date: string, basis: DateBasis) {
      this.entered = date;
      this.basis = basis;
      this.reference = toReferenceDate(date, basis);
    },
    clear() {
      this.reference = "";
      this.entered = "";
      this.basis = "mestruazione";
    },
    addAppointment(a: Omit<Appointment, "id">) {
      this.appointments.push({ ...a, id: Math.random().toString(36).slice(2, 10) });
    },
    updateAppointment(id: string, patch: Partial<Appointment>) {
      const i = this.appointments.findIndex((a) => a.id === id);
      if (i >= 0) this.appointments[i] = { ...this.appointments[i], ...patch };
    },
    removeAppointment(id: string) {
      this.appointments = this.appointments.filter((a) => a.id !== id);
    },
    toggleDone(id: string) {
      const a = this.appointments.find((x) => x.id === id);
      if (a) a.done = !a.done;
    },
    hydrate(raw: any) {
      if (!raw) return;
      if (typeof raw.reference === "string") this.reference = raw.reference;
      if (typeof raw.entered === "string") this.entered = raw.entered;
      if (raw.basis === "mestruazione" || raw.basis === "concepimento") this.basis = raw.basis;
      if (Array.isArray(raw.appointments)) this.appointments = raw.appointments;
    },
  },
});
