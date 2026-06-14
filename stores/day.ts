import { defineStore } from "pinia";
import { todayKey } from "~/utils/date";

export interface Meal {
  name: string;
  kcal: number;
  cho: number;
  pro: number;
  fat: number;
  alc: number;
  at: number;
}
export interface Move {
  type: string;
  min: number;
  at: number;
}
export interface Drink {
  name: string;
  alc: number; // grammi di alcol
  kcal: number; // kcal della bevanda (0 se già conteggiate in un pasto)
  at: number;
  mealAt?: number; // collega la bevanda al pasto da cui proviene
}
export interface DayData {
  water: number;
  drinks: Drink[];
  meals: Meal[];
  moves: Move[];
}

const emptyDay = (): DayData => ({ water: 0, drinks: [], meals: [], moves: [] });

export const useDayStore = defineStore("day", {
  state: () => ({
    date: todayKey(),
    streak: 0,
    days: <Record<string, DayData>>{},
  }),

  getters: {
    today(state): DayData {
      return state.days[state.date] ?? emptyDay();
    },
    totals(): { kcal: number; cho: number; pro: number; fat: number; alc: number } {
      return this.today.meals.reduce(
        (a, m) => ({
          kcal: a.kcal + m.kcal,
          cho: a.cho + m.cho,
          pro: a.pro + m.pro,
          fat: a.fat + m.fat,
          alc: a.alc + m.alc,
        }),
        { kcal: 0, cho: 0, pro: 0, fat: 0, alc: 0 },
      );
    },
    moveMin(): number {
      return this.today.moves.reduce((a, m) => a + m.min, 0);
    },
    alcGrams(): number {
      return this.today.drinks.reduce((a, d) => a + (d.alc || 0), 0);
    },
    alcKcal(): number {
      return this.today.drinks.reduce((a, d) => a + (d.kcal || 0), 0);
    },
  },

  actions: {
    ensureToday() {
      const k = todayKey();
      this.date = k;
      if (!this.days[k]) this.days[k] = emptyDay();
    },
    addWater(ml: number) {
      this.ensureToday();
      this.days[this.date].water = Math.max(0, this.days[this.date].water + ml);
    },
    addMeal(m: Omit<Meal, "at">) {
      this.ensureToday();
      const at = Date.now();
      this.days[this.date].meals.push({ ...m, at });
      // Se il pasto contiene alcol, registralo anche nella sezione Alcol e azzera la striscia.
      // Le kcal restano nel pasto (drink.kcal = 0) per non contarle due volte.
      if (m.alc > 0) {
        this.days[this.date].drinks.push({
          name: `${m.name} (alcol nel pasto)`,
          alc: m.alc,
          kcal: 0,
          at,
          mealAt: at,
        });
        this.streak = 0;
      }
    },
    removeMeal(i: number) {
      const meal = this.days[this.date].meals[i];
      this.days[this.date].meals.splice(i, 1);
      // rimuove anche la bevanda collegata a questo pasto
      if (meal) {
        this.days[this.date].drinks = this.days[this.date].drinks.filter((d) => d.mealAt !== meal.at);
      }
    },
    addMove(m: Omit<Move, "at">) {
      this.ensureToday();
      this.days[this.date].moves.push({ ...m, at: Date.now() });
    },
    cleanDay() {
      this.streak += 1;
    },
    logDrink(d: { name: string; alc: number; kcal?: number }) {
      this.ensureToday();
      this.days[this.date].drinks.push({ name: d.name, alc: d.alc, kcal: d.kcal ?? 0, at: Date.now() });
      this.streak = 0;
    },
    removeDrink(i: number) {
      this.days[this.date].drinks.splice(i, 1);
    },
    hydrate(raw: any) {
      if (!raw) return;
      if (typeof raw.streak === "number") this.streak = raw.streak;
      if (raw.days) this.days = raw.days;
      this.ensureToday();
    },
  },
});
