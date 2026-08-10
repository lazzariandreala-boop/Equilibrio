// GET /api/foods?q=pasta  ->  { alimenti: [{ name, kcal, cho, pro, fat, fib, source }] }
//
// Ricerca dei valori nutrizionali (per 100 g) su due fonti gratuite che non
// richiedono chiave: OpenFoodFacts per i prodotti confezionati e USDA
// FoodData Central per gli alimenti generici. Alla tabella locale ci pensa
// il client, così qualcosa compare comunque anche offline.

interface FoodResult {
  name: string;
  kcal: number;
  cho: number;
  pro: number;
  fat: number;
  fib: number;
  source: string;
}

const n = (v: any) => Math.round((Number(v) || 0) * 10) / 10;

export default defineEventHandler(async (event) => {
  const q = String(getQuery(event).q || "").trim();
  if (q.length < 2) return { alimenti: [] };

  const results: FoodResult[] = [];

  // ── OpenFoodFacts: ottimo sui prodotti da supermercato italiani ──
  try {
    const off: any = await $fetch("https://world.openfoodfacts.org/cgi/search.pl", {
      params: {
        search_terms: q,
        json: 1,
        page_size: 8,
        search_simple: 1,
        action: "process",
        fields: "product_name,nutriments",
        lc: "it",
      },
      headers: { "User-Agent": "Equilibrio/1.0 (app benessere personale)" },
      timeout: 6000,
    });

    for (const p of off?.products ?? []) {
      const nut = p.nutriments || {};
      const name = p.product_name;
      if (!name) continue;
      if (nut["carbohydrates_100g"] == null && nut["proteins_100g"] == null) continue;
      results.push({
        name,
        kcal: n(nut["energy-kcal_100g"]),
        cho: n(nut["carbohydrates_100g"]),
        pro: n(nut["proteins_100g"]),
        fat: n(nut["fat_100g"]),
        fib: n(nut["fiber_100g"]),
        source: "OpenFoodFacts",
      });
    }
  } catch {
    // fonte non raggiungibile: si prosegue con l'altra
  }

  // ── USDA FoodData Central: alimenti generici, DEMO_KEY senza registrazione ──
  try {
    const usda: any = await $fetch("https://api.nal.usda.gov/fdc/v1/foods/search", {
      params: {
        query: q,
        api_key: process.env.USDA_API_KEY || "DEMO_KEY",
        dataType: "SR Legacy,Survey (FNDDS)",
        pageSize: 6,
      },
      timeout: 6000,
    });

    const ID = { kcal: 1008, pro: 1003, fat: 1004, cho: 1005, fib: 1079 };
    for (const f of usda?.foods ?? []) {
      const get = (id: number) =>
        f.foodNutrients?.find((x: any) => x.nutrientId === id)?.value ?? 0;
      results.push({
        name: f.description,
        kcal: n(get(ID.kcal)),
        cho: n(get(ID.cho)),
        pro: n(get(ID.pro)),
        fat: n(get(ID.fat)),
        fib: n(get(ID.fib)),
        source: "USDA",
      });
    }
  } catch {
    // idem
  }

  // I risultati più completi per primi: una voce senza macro è inutile.
  const score = (r: FoodResult) =>
    (r.kcal > 0 ? 1 : 0) + (r.cho > 0 ? 1 : 0) + (r.pro > 0 ? 1 : 0) + (r.fat > 0 ? 1 : 0) + (r.fib > 0 ? 1 : 0);

  const seen = new Set<string>();
  const alimenti = results
    .filter((r) => {
      const key = r.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return score(r) > 0;
    })
    .sort((a, b) => score(b) - score(a))
    .slice(0, 12);

  return { alimenti };
});
