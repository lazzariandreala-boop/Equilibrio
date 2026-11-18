import { defineStore } from "pinia";
import { DEFAULT_PARAMS, type DiabetesParams } from "~/utils/diabetes";

export interface Goals {
  water: number;
  moveMin: number;
  kcal: number;
}
export interface FavoriteMeal {
  name: string;
  items: {
    name: string; qty: string; kcal: number; cho: number;
    pro: number; fat: number; fib: number; alc: number;
  }[];
}

export interface Profile {
  weightKg: number; // serve a stimare le calorie bruciate
  /** Attiva gli avvisi sugli alimenti sconsigliati in gravidanza. */
  pregnant: boolean;
  /** Mostra la sezione dedicata al ciclo mestruale. */
  cycleTracking: boolean;
  /** Attiva la gestione del diabete: glicemie, boli e calcolatore. */
  diabetes: boolean;
  /** Moltiplicatore del testo, in aggiunta a quello di sistema. */
  textScale: number;
}
export interface Reminders {
  water: boolean;
  waterTimes: string[]; // "HH:MM"
  meal: boolean;
  evening: boolean;
  eveningTime: string;
}

export interface ShopItem {
  id: string;
  name: string;
  qty: string;
  aisle: string;
  done: boolean;
  /** Ricetta da cui proviene, se c'è. */
  from?: string;
}

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    goals: <Goals>{ water: 2000, moveMin: 30, kcal: 2000 },
    profile: <Profile>{ weightKg: 75, pregnant: false, cycleTracking: false, diabetes: false, textScale: 1 },
    diabetes: <DiabetesParams>{ ...DEFAULT_PARAMS },
    /** Chiavi personali: se presenti, le richieste usano queste invece di quelle condivise. */
    keys: { gemini: "" },
    /** Pasti salvati come preferiti, da riaggiungere con un tocco. */
    favorites: [] as FavoriteMeal[],
    /** Ricette salvate fra le preferite (id del ricettario). */
    recipeFavorites: [] as string[],
    /** Lista della spesa, sincronizzata con l'account. */
    shopping: [] as ShopItem[],
    reminders: <Reminders>{
      water: true,
      waterTimes: ["10:00", "13:00", "16:00", "19:00"],
      meal: true,
      evening: true,
      eveningTime: "21:00",
    },
  }),
  actions: {
    isFavorite(name: string) {
      return this.favorites.some((f) => f.name === name);
    },
    toggleFavorite(meal: FavoriteMeal) {
      const i = this.favorites.findIndex((f) => f.name === meal.name);
      if (i >= 0) this.favorites.splice(i, 1);
      else this.favorites.unshift({ name: meal.name, items: meal.items.map((x) => ({ ...x })) });
    },
    isRecipeFavorite(id: string) {
      return this.recipeFavorites.includes(id);
    },
    toggleRecipeFavorite(id: string) {
      const i = this.recipeFavorites.indexOf(id);
      if (i >= 0) this.recipeFavorites.splice(i, 1);
      else this.recipeFavorites.unshift(id);
    },
    /** Aggiunge alla spesa; se l'articolo c'è già e non è spuntato, non lo duplica. */
    addShopping(items: Omit<ShopItem, "id" | "done">[]) {
      let added = 0;
      for (const it of items) {
        const key = it.name.trim().toLowerCase();
        if (!key) continue;
        const existing = this.shopping.find((s) => !s.done && s.name.trim().toLowerCase() === key);
        if (existing) {
          if (it.qty && it.qty !== "q.b." && !existing.qty.includes(it.qty)) {
            existing.qty = existing.qty && existing.qty !== "q.b." ? `${existing.qty} + ${it.qty}` : it.qty;
          }
          continue;
        }
        this.shopping.push({ ...it, id: Math.random().toString(36).slice(2, 10), done: false });
        added++;
      }
      return added;
    },
    toggleShopping(id: string) {
      const it = this.shopping.find((s) => s.id === id);
      if (it) it.done = !it.done;
    },
    removeShopping(id: string) {
      this.shopping = this.shopping.filter((s) => s.id !== id);
    },
    clearShoppingDone() {
      this.shopping = this.shopping.filter((s) => !s.done);
    },
    hydrate(raw: any) {
      if (!raw) return;
      if (raw.goals) this.goals = { ...this.goals, ...raw.goals };
      if (raw.profile) this.profile = { ...this.profile, ...raw.profile };
      if (raw.diabetes) this.diabetes = { ...this.diabetes, ...raw.diabetes };
      if (raw.keys) this.keys = { ...this.keys, ...raw.keys };
      if (Array.isArray(raw.favorites)) this.favorites = raw.favorites;
      if (Array.isArray(raw.recipeFavorites)) this.recipeFavorites = raw.recipeFavorites;
      if (Array.isArray(raw.shopping)) this.shopping = raw.shopping;
      if (raw.reminders) this.reminders = { ...this.reminders, ...raw.reminders };
    },
  },
});
