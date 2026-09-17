import { defineStore } from "pinia";
import { DEFAULT_PARAMS, type DiabetesParams } from "~/utils/diabetes";

export interface Goals {
  water: number;
  moveMin: number;
  kcal: number;
}
export interface Profile {
  weightKg: number; // serve a stimare le calorie bruciate
  /** Attiva gli avvisi sugli alimenti sconsigliati in gravidanza. */
  pregnant: boolean;
  /** Mostra la sezione dedicata al ciclo mestruale. */
  cycleTracking: boolean;
  /** Attiva la gestione del diabete: glicemie, boli e calcolatore. */
  diabetes: boolean;
}
export interface Reminders {
  water: boolean;
  waterTimes: string[]; // "HH:MM"
  meal: boolean;
  evening: boolean;
  eveningTime: string;
}

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    goals: <Goals>{ water: 2000, moveMin: 30, kcal: 2000 },
    profile: <Profile>{ weightKg: 75, pregnant: false, cycleTracking: false, diabetes: false },
    diabetes: <DiabetesParams>{ ...DEFAULT_PARAMS },
    /** Chiavi personali: se presenti, le richieste usano queste invece di quelle condivise. */
    keys: { gemini: "" },
    reminders: <Reminders>{
      water: true,
      waterTimes: ["10:00", "13:00", "16:00", "19:00"],
      meal: true,
      evening: true,
      eveningTime: "21:00",
    },
  }),
  actions: {
    hydrate(raw: any) {
      if (!raw) return;
      if (raw.goals) this.goals = { ...this.goals, ...raw.goals };
      if (raw.profile) this.profile = { ...this.profile, ...raw.profile };
      if (raw.diabetes) this.diabetes = { ...this.diabetes, ...raw.diabetes };
      if (raw.keys) this.keys = { ...this.keys, ...raw.keys };
      if (raw.reminders) this.reminders = { ...this.reminders, ...raw.reminders };
    },
  },
});
