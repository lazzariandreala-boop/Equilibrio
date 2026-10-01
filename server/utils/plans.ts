/**
 * Abbonamenti e cosa sbloccano. Unica fonte usata dal server per decidere
 * i permessi: il prezzo vero lo stabilisce il Play Console, qui c'è solo la
 * corrispondenza fra prodotto e funzioni.
 */
export type Feature = "ai" | "export" | "pregnancy" | "diabetes";

export const PRODUCTS: Record<string, Feature[]> = {
  equilibrio_premium: ["ai", "export"],
  equilibrio_gravidanza: ["pregnancy"],
  equilibrio_diabete: ["diabetes"],
  equilibrio_premium_plus: ["ai", "export", "pregnancy", "diabetes"],
};

export const ALL_FEATURES: Feature[] = ["ai", "export", "pregnancy", "diabetes"];

/** Limite giornaliero di richieste all'IA anche per chi è abbonato. */
export const DAILY_AI_LIMIT = 40;
