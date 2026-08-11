import { defineStore } from "pinia";
import { todayKey, keyToDate } from "~/utils/date";

export interface Meal {
  name: string;
  kcal: number;
  cho: number; // carboidrati (g)
  pro: number; // proteine (g)
  fat: number; // grassi (g)
  fib: number; // fibre (g)
  alc: number; // alcol (g)
  at: number;
}
export interface Move {
  type: string;
  min: number;
  at: number;
  kcal?: number; // stima delle calorie bruciate
  activityId?: string; // id dal catalogo attività
  extId?: string; // id dell'allenamento importato da Health Connect / HealthKit
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
    date: todayKey(), // giorno selezionato (visualizzato e modificato)
    following: true, // true = segue automaticamente "oggi" (avanza a mezzanotte/resume)
    days: <Record<string, DayData>>{},
  }),

  getters: {
    // Dati del giorno selezionato (i componenti usano day.today).
    today(state): DayData {
      return state.days[state.date] ?? emptyDay();
    },
    isToday(state): boolean {
      return state.date === todayKey();
    },
    totals(): { kcal: number; cho: number; pro: number; fat: number; fib: number; alc: number } {
      return this.today.meals.reduce(
        (a, m) => ({
          kcal: a.kcal + m.kcal,
          cho: a.cho + m.cho,
          pro: a.pro + m.pro,
          fat: a.fat + m.fat,
          fib: a.fib + (m.fib ?? 0), // i pasti salvati prima non avevano le fibre
          alc: a.alc + m.alc,
        }),
        { kcal: 0, cho: 0, pro: 0, fat: 0, fib: 0, alc: 0 },
      );
    },
    /**
     * Giorni consecutivi senza alcol fino al giorno indicato (default: quello
     * selezionato). Navigando indietro nel tempo il valore è quello che
     * l'app avrebbe mostrato in quel giorno, non quello di oggi.
     */
    streakAt(state) {
      return (dayKey: string): number => {
        const keys = Object.keys(state.days).sort();
        if (keys.length === 0) return 0;
        const first = keys[0];

        let count = 0;
        const cursor = keyToDate(dayKey);
        for (let i = 0; i < 3650; i++) {
          const key = todayKey(cursor);
          if (key < first) break;
          if ((state.days[key]?.drinks.length ?? 0) > 0) break;
          count++;
          cursor.setDate(cursor.getDate() - 1);
        }
        return count;
      };
    },
    /** Striscia riferita al giorno attualmente selezionato. */
    streak(state): number {
      return this.streakAt(state.date);
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
    // Riepilogo sintetico di un giorno qualsiasi (per lo storico).
    summaryOf(state) {
      return (key: string) => {
        const d = state.days[key] ?? emptyDay();
        const kcal = d.meals.reduce((a, m) => a + m.kcal, 0);
        const moveMin = d.moves.reduce((a, m) => a + m.min, 0);
        const alcGrams = d.drinks.reduce((a, x) => a + (x.alc || 0), 0);
        return {
          water: d.water,
          kcal,
          moveMin,
          alcGrams,
          meals: d.meals.length,
          drinks: d.drinks.length,
          hasData: d.water > 0 || d.meals.length > 0 || d.moves.length > 0 || d.drinks.length > 0,
        };
      };
    },
  },

  actions: {
    ensureDay() {
      if (!this.days[this.date]) this.days[this.date] = emptyDay();
    },
    /** Come ensureDay ma per una data qualsiasi: serve all'import dello storico. */
    ensureDayKey(key: string) {
      if (!this.days[key]) this.days[key] = emptyDay();
      return this.days[key];
    },
    /** Aggiunge un'attività a un giorno preciso, saltando i doppioni. */
    addMoveOn(key: string, m: Omit<Move, "at">) {
      const d = this.ensureDayKey(key);
      const ext = (m as any).extId;
      if (ext && d.moves.some((x: any) => x.extId === ext)) return false;
      d.moves.push({ ...m, at: keyToDate(key).getTime() });
      return true;
    },
    /** Voce "Passi" di un giorno preciso: si aggiorna invece di duplicarsi. */
    upsertStepsMoveOn(key: string, minutes: number, steps: number) {
      const d = this.ensureDayKey(key);
      const i = d.moves.findIndex((m) => m.activityId === "passi");
      const entry = {
        type: `Passi (${steps.toLocaleString("it-IT")})`,
        min: minutes,
        activityId: "passi",
        at: keyToDate(key).getTime(),
      };
      if (i >= 0) d.moves[i] = { ...d.moves[i], ...entry };
      else d.moves.push(entry);
    },
    // Cambia il giorno visualizzato/modificato. "following" resta attivo solo se è oggi.
    setDate(key: string) {
      this.date = key;
      this.following = key === todayKey();
      this.ensureDay();
    },
    goToday() {
      this.setDate(todayKey());
    },
    shiftDate(deltaDays: number) {
      const d = new Date(`${this.date}T00:00:00`);
      d.setDate(d.getDate() + deltaDays);
      this.setDate(todayKey(d));
    },
    // Se stiamo seguendo "oggi" ed è cambiato il giorno (mezzanotte/resume), avanza.
    refreshDay() {
      if (this.following && this.date !== todayKey()) {
        this.date = todayKey();
        this.ensureDay();
      }
    },
    // All'avvio si parte sempre da oggi.
    ensureToday() {
      this.date = todayKey();
      this.following = true;
      this.ensureDay();
    },
    addWater(ml: number) {
      this.ensureDay();
      this.days[this.date].water = Math.max(0, this.days[this.date].water + ml);
    },
    addMeal(m: Omit<Meal, "at">) {
      this.ensureDay();
      const at = Date.now();
      this.days[this.date].meals.push({ ...m, at });
      // Se il pasto contiene alcol, registralo anche nella sezione Alcol.
      // Le kcal restano nel pasto (drink.kcal = 0) per non contarle due volte.
      if (m.alc > 0) {
        this.days[this.date].drinks.push({
          name: `${m.name} (alcol nel pasto)`,
          alc: m.alc,
          kcal: 0,
          at,
          mealAt: at,
        });
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
      this.ensureDay();
      this.days[this.date].moves.push({ ...m, at: Date.now() });
    },
    /** Voce "Passi" del giorno: si aggiorna invece di duplicarsi a ogni sync. */
    upsertStepsMove(minutes: number, steps: number) {
      this.ensureDay();
      const moves = this.days[this.date].moves;
      const i = moves.findIndex((m) => m.activityId === "passi");
      const entry = {
        type: `Passi (${steps.toLocaleString("it-IT")})`,
        min: minutes,
        activityId: "passi",
        at: Date.now(),
      };
      if (i >= 0) moves[i] = { ...moves[i], ...entry };
      else moves.push(entry);
    },
    removeMove(i: number) {
      this.days[this.date].moves.splice(i, 1);
    },
    /** Registra il giorno come tracciato: la striscia si calcola da sé. */
    cleanDay() {
      this.ensureDay();
    },
    logDrink(d: { name: string; alc: number; kcal?: number }) {
      this.ensureDay();
      this.days[this.date].drinks.push({ name: d.name, alc: d.alc, kcal: d.kcal ?? 0, at: Date.now() });
    },
    removeDrink(i: number) {
      this.days[this.date].drinks.splice(i, 1);
    },
    hydrate(raw: any) {
      if (!raw) return;
      // raw.streak dei salvataggi vecchi viene ignorato: ora si calcola dai dati
      if (raw.days) this.days = raw.days;
      this.ensureDay(); // mantiene il giorno selezionato, non forza oggi
    },
  },
});
