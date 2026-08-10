/**
 * Tabella alimenti di riserva, valori per 100 g (o per 100 ml per i liquidi).
 * Dati ricavati dalle tabelle di composizione degli alimenti CREA.
 *
 * Serve quando il servizio di stima non è disponibile: meglio una stima
 * approssimata e dichiarata come tale che una riga di zeri.
 */
export interface FoodEntry {
  /** Termini che compaiono nella descrizione dell'utente. */
  match: string[];
  name: string;
  kcal: number;
  cho: number;
  pro: number;
  fat: number;
  fib: number;
  alc?: number;
  /** Porzione tipica in grammi, usata se l'utente non indica la quantità. */
  portion: number;
  unit?: "g" | "ml";
}

export const FOODS: FoodEntry[] = [
  // ── primi e cereali ──
  { match: ["pasta al pomodoro", "pasta pomodoro"], name: "Pasta al pomodoro", kcal: 158, cho: 28, pro: 5, fat: 3, fib: 2, portion: 250 },
  { match: ["pasta al ragù", "pasta ragu", "ragù", "ragu"], name: "Pasta al ragù", kcal: 190, cho: 26, pro: 8, fat: 6, fib: 2, portion: 250 },
  { match: ["carbonara"], name: "Pasta alla carbonara", kcal: 250, cho: 27, pro: 11, fat: 11, fib: 1, portion: 250 },
  { match: ["pasta", "spaghetti", "penne", "maccheroni"], name: "Pasta", kcal: 353, cho: 72, pro: 11, fat: 1, fib: 3, portion: 80 },
  { match: ["riso", "risotto"], name: "Riso", kcal: 332, cho: 80, pro: 7, fat: 0, fib: 1, portion: 80 },
  { match: ["pane", "panino", "fetta di pane"], name: "Pane", kcal: 275, cho: 57, pro: 9, fat: 1, fib: 3, portion: 50 },
  { match: ["pizza margherita", "pizza"], name: "Pizza margherita", kcal: 271, cho: 34, pro: 11, fat: 10, fib: 2, portion: 300 },
  { match: ["fette biscottate", "cracker"], name: "Fette biscottate", kcal: 408, cho: 76, pro: 12, fat: 6, fib: 3, portion: 20 },
  { match: ["cereali", "muesli"], name: "Cereali", kcal: 370, cho: 70, pro: 9, fat: 5, fib: 7, portion: 40 },
  { match: ["polenta"], name: "Polenta", kcal: 85, cho: 18, pro: 2, fat: 0, fib: 1, portion: 250 },
  { match: ["gnocchi"], name: "Gnocchi di patate", kcal: 157, cho: 33, pro: 4, fat: 0, fib: 2, portion: 250 },

  // ── carne e pesce ──
  { match: ["pollo", "petto di pollo"], name: "Petto di pollo", kcal: 100, cho: 0, pro: 23, fat: 1, fib: 0, portion: 150 },
  { match: ["tacchino"], name: "Tacchino", kcal: 107, cho: 0, pro: 24, fat: 1, fib: 0, portion: 150 },
  { match: ["manzo", "bistecca", "carne rossa"], name: "Manzo", kcal: 180, cho: 0, pro: 21, fat: 11, fib: 0, portion: 150 },
  { match: ["maiale", "salsiccia"], name: "Maiale", kcal: 242, cho: 0, pro: 20, fat: 18, fib: 0, portion: 150 },
  { match: ["prosciutto crudo"], name: "Prosciutto crudo", kcal: 224, cho: 0, pro: 26, fat: 13, fib: 0, portion: 50 },
  { match: ["prosciutto cotto", "prosciutto"], name: "Prosciutto cotto", kcal: 215, cho: 1, pro: 20, fat: 15, fib: 0, portion: 50 },
  { match: ["tonno"], name: "Tonno", kcal: 103, cho: 0, pro: 22, fat: 1, fib: 0, portion: 100 },
  { match: ["salmone"], name: "Salmone", kcal: 185, cho: 0, pro: 20, fat: 12, fib: 0, portion: 150 },
  { match: ["pesce", "orata", "branzino", "merluzzo"], name: "Pesce bianco", kcal: 90, cho: 0, pro: 18, fat: 2, fib: 0, portion: 150 },
  { match: ["uovo", "uova", "frittata"], name: "Uovo", kcal: 143, cho: 1, pro: 13, fat: 9, fib: 0, portion: 60 },

  // ── latticini ──
  { match: ["mozzarella"], name: "Mozzarella", kcal: 253, cho: 1, pro: 19, fat: 20, fib: 0, portion: 125 },
  { match: ["parmigiano", "grana"], name: "Parmigiano", kcal: 387, cho: 0, pro: 33, fat: 28, fib: 0, portion: 20 },
  { match: ["formaggio"], name: "Formaggio", kcal: 350, cho: 2, pro: 24, fat: 27, fib: 0, portion: 80 },
  { match: ["yogurt greco"], name: "Yogurt greco", kcal: 97, cho: 4, pro: 9, fat: 5, fib: 0, portion: 150 },
  { match: ["yogurt"], name: "Yogurt", kcal: 66, cho: 5, pro: 4, fat: 3, fib: 0, portion: 125 },
  { match: ["latte"], name: "Latte", kcal: 64, cho: 5, pro: 3, fat: 4, fib: 0, portion: 200, unit: "ml" },

  // ── verdure e legumi ──
  { match: ["insalata", "lattuga"], name: "Insalata", kcal: 19, cho: 2, pro: 2, fat: 0, fib: 2, portion: 100 },
  { match: ["pomodoro", "pomodori"], name: "Pomodori", kcal: 19, cho: 3, pro: 1, fat: 0, fib: 2, portion: 150 },
  { match: ["zucchine"], name: "Zucchine", kcal: 11, cho: 1, pro: 1, fat: 0, fib: 1, portion: 200 },
  { match: ["spinaci"], name: "Spinaci", kcal: 31, cho: 3, pro: 3, fat: 1, fib: 2, portion: 200 },
  { match: ["broccoli"], name: "Broccoli", kcal: 27, cho: 3, pro: 3, fat: 0, fib: 3, portion: 200 },
  { match: ["patate", "patata"], name: "Patate", kcal: 85, cho: 18, pro: 2, fat: 0, fib: 2, portion: 200 },
  { match: ["verdura", "verdure", "contorno"], name: "Verdure miste", kcal: 25, cho: 4, pro: 2, fat: 0, fib: 2, portion: 200 },
  { match: ["fagioli"], name: "Fagioli", kcal: 91, cho: 12, pro: 7, fat: 1, fib: 6, portion: 150 },
  { match: ["ceci"], name: "Ceci", kcal: 120, cho: 17, pro: 7, fat: 2, fib: 6, portion: 150 },
  { match: ["lenticchie"], name: "Lenticchie", kcal: 92, cho: 13, pro: 7, fat: 0, fib: 6, portion: 150 },

  // ── frutta e frutta secca ──
  { match: ["mela"], name: "Mela", kcal: 52, cho: 12, pro: 0, fat: 0, fib: 2, portion: 150 },
  { match: ["banana"], name: "Banana", kcal: 89, cho: 21, pro: 1, fat: 0, fib: 3, portion: 120 },
  { match: ["arancia"], name: "Arancia", kcal: 47, cho: 9, pro: 1, fat: 0, fib: 2, portion: 150 },
  { match: ["frutta"], name: "Frutta", kcal: 55, cho: 12, pro: 1, fat: 0, fib: 2, portion: 150 },
  { match: ["mandorle", "noci", "frutta secca"], name: "Frutta secca", kcal: 600, cho: 5, pro: 20, fat: 52, fib: 8, portion: 30 },

  // ── condimenti e dolci ──
  { match: ["olio", "olio d'oliva"], name: "Olio d'oliva", kcal: 899, cho: 0, pro: 0, fat: 100, fib: 0, portion: 10 },
  { match: ["burro"], name: "Burro", kcal: 758, cho: 1, pro: 1, fat: 83, fib: 0, portion: 10 },
  { match: ["biscotti"], name: "Biscotti", kcal: 460, cho: 70, pro: 7, fat: 17, fib: 2, portion: 40 },
  { match: ["cioccolato"], name: "Cioccolato", kcal: 545, cho: 50, pro: 7, fat: 34, fib: 6, portion: 25 },
  { match: ["gelato"], name: "Gelato", kcal: 207, cho: 24, pro: 4, fat: 11, fib: 0, portion: 100 },
  { match: ["dolce", "torta"], name: "Dolce", kcal: 350, cho: 45, pro: 5, fat: 17, fib: 1, portion: 100 },

  // ── bevande ──
  { match: ["birra"], name: "Birra", kcal: 34, cho: 3, pro: 0, fat: 0, fib: 0, alc: 4, portion: 330, unit: "ml" },
  { match: ["vino rosso", "vino bianco", "vino", "calice"], name: "Vino", kcal: 70, cho: 1, pro: 0, fat: 0, fib: 0, alc: 10, portion: 125, unit: "ml" },
  { match: ["spritz"], name: "Spritz", kcal: 120, cho: 12, pro: 0, fat: 0, fib: 0, alc: 8, portion: 150, unit: "ml" },
  { match: ["caffè", "caffe"], name: "Caffè", kcal: 2, cho: 0, pro: 0, fat: 0, fib: 0, portion: 30, unit: "ml" },
  { match: ["cappuccino"], name: "Cappuccino", kcal: 55, cho: 5, pro: 3, fat: 3, fib: 0, portion: 150, unit: "ml" },
  { match: ["succo"], name: "Succo di frutta", kcal: 46, cho: 11, pro: 0, fat: 0, fib: 0, portion: 200, unit: "ml" },
];

export interface LocalItem {
  name: string;
  qty: string;
  kcal: number;
  cho: number;
  pro: number;
  fat: number;
  fib: number;
  alc: number;
}

const NUMBER_WORDS: Record<string, number> = {
  un: 1, uno: 1, una: 1, "un'": 1, due: 2, tre: 3, quattro: 4, cinque: 5,
  sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10, mezzo: 0.5, mezza: 0.5,
};

/**
 * Stima locale: cerca gli alimenti noti dentro la descrizione e ne calcola
 * i valori sulla porzione trovata (o su quella tipica).
 * Non capisce frasi complesse: è un ripiego, non un sostituto del servizio.
 */
export function estimateLocally(text: string): LocalItem[] {
  const lower = ` ${text.toLowerCase()} `;
  const found: LocalItem[] = [];
  const used = new Set<string>();

  // Gli alimenti con più parole vanno provati per primi ("pasta al pomodoro"
  // deve vincere su "pasta").
  const ordered = [...FOODS].sort(
    (a, b) => Math.max(...b.match.map((m) => m.length)) - Math.max(...a.match.map((m) => m.length)),
  );

  for (const food of ordered) {
    const term = food.match.find((m) => lower.includes(m));
    if (!term || used.has(food.name)) continue;

    // Se un alimento più specifico ha già coperto queste parole, salta.
    if (found.some((f) => f.name.toLowerCase().includes(term))) continue;
    used.add(food.name);

    const grams = extractGrams(lower, term) ?? food.portion * (extractCount(lower, term) ?? 1);
    const k = grams / 100;

    found.push({
      name: food.name,
      qty: `${Math.round(grams)} ${food.unit ?? "g"}`,
      kcal: Math.round(food.kcal * k),
      cho: Math.round(food.cho * k),
      pro: Math.round(food.pro * k),
      fat: Math.round(food.fat * k),
      fib: Math.round(food.fib * k),
      alc: Math.round((food.alc ?? 0) * k),
    });
  }

  return found;
}

/**
 * Cerca "200 g" / "500 ml" attaccato al nome dell'alimento: prima dopo
 * ("verdure 200 g"), poi appena prima ("200 g di verdure"). La finestra è
 * corta perché un peso lontano appartiene quasi sempre a un altro alimento.
 */
function extractGrams(text: string, term: string): number | null {
  const i = text.indexOf(term);

  const after = text.slice(i + term.length, i + term.length + 12);
  const m1 = after.match(/^\s*(?:da\s*)?(\d+)\s*(g|gr|grammi|ml)\b/);
  if (m1) return Number(m1[1]);

  const before = text.slice(Math.max(0, i - 12), i);
  const m2 = before.match(/(\d+)\s*(g|gr|grammi|ml)\s*(?:di\s*|d')?$/);
  if (m2) return Number(m2[1]);

  return null;
}

/**
 * Cerca "due piatti" / "2 fette" subito prima del nome dell'alimento.
 * La finestra è stretta di proposito: in "150 g di pollo con verdure" il 150
 * appartiene al pollo, non alle verdure.
 */
function extractCount(text: string, term: string): number | null {
  const i = text.indexOf(term);
  const before = text.slice(Math.max(0, i - 14), i);

  // Un numero già seguito da g/ml è il peso di un altro alimento: si ignora.
  const digit = before.match(/(\d+)\s*(?!g\b|gr\b|ml\b)[a-zà-ù']*\s*$/);
  if (digit && !/\d+\s*(g|gr|grammi|ml)\b/.test(before)) return Number(digit[1]);

  for (const [word, n] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${word}\\b`).test(before)) return n;
  }
  return null;
}
