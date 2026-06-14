import { defineStore } from "pinia";

export interface Goals {
  water: number;
  moveMin: number;
  kcal: number;
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
      if (raw.reminders) this.reminders = { ...this.reminders, ...raw.reminders };
    },
  },
});
