/**
 * Piani in abbonamento mostrati nell'app. I permessi veri li decide il
 * server (server/utils/plans.ts): qui ci sono testi, prezzi di riserva e
 * il prodotto da acquistare su Google Play.
 */
export type Feature = "ai" | "export" | "pregnancy" | "diabetes";
export type PlanId = "premium" | "gravidanza" | "diabete" | "plus";

export interface Plan {
  id: PlanId;
  name: string;
  productId: string;
  /** Piano base mensile configurato nel Play Console. */
  basePlanId: string;
  /** Prezzo mostrato finché Google Play non restituisce quello locale. */
  fallbackPrice: string;
  tone: "water" | "food" | "move" | "alcohol";
  emoji: string;
  tagline: string;
  features: Feature[];
  includes: string[];
}

export const PLANS: Plan[] = [
  {
    id: "premium", name: "Premium", productId: "equilibrio_premium", basePlanId: "mensile",
    fallbackPrice: "2,99 €", tone: "food", emoji: "✨",
    tagline: "L'intelligenza artificiale per i pasti e tutti i tuoi dati in PDF.",
    features: ["ai", "export"],
    includes: [
      "Foto del piatto: l'IA riconosce gli alimenti e stima calorie, carboidrati, proteine, grassi e fibre",
      "Descrizione a parole del pasto con stima automatica dei valori",
      "Fino a 40 analisi al giorno",
      "Rapporto PDF curato di alimentazione, movimento, acqua, alcol e moduli attivi",
      "Scelta del periodo e delle sezioni, da salvare o condividere con il medico",
      "Tutto il resto dell'app resta gratuito: diario, ricette, spesa, ciclo",
    ],
  },
  {
    id: "gravidanza", name: "Gravidanza", productId: "equilibrio_gravidanza", basePlanId: "mensile",
    fallbackPrice: "0,99 €", tone: "alcohol", emoji: "🤰",
    tagline: "Settimana per settimana, con gli alimenti da evitare sotto controllo.",
    features: ["pregnancy"],
    includes: [
      "Settimana e trimestre in corso, data presunta del parto",
      "Controllo automatico di ogni pasto e ricetta: alimenti da evitare o limitare (salumi crudi, pesce crudo, formaggi a latte crudo, alcol, caffeina…) con il motivo",
      "Esami e visite consigliati per periodo, con promemoria",
      "Appuntamenti con il ginecologo e l'ostetrica",
      "Guida alle pratiche e ai diritti in Italia",
    ],
  },
  {
    id: "diabete", name: "Diabete", productId: "equilibrio_diabete", basePlanId: "mensile",
    fallbackPrice: "1,99 €", tone: "water", emoji: "💧",
    tagline: "Glicemie, boli e carboidrati in un unico posto.",
    features: ["diabetes"],
    includes: [
      "Registro delle glicemie in mg/dL o mmol/L, con grafico e tempo nel range",
      "Calcolatore del bolo con rapporto insulina/carboidrati, fattore di sensibilità e insulina attiva",
      "Bolo stimato direttamente mentre inserisci il pasto",
      "Carboidrati a porzione su ogni ricetta",
      "Avviso in caso di ipoglicemia con i grammi di zuccheri per risalire",
    ],
  },
  {
    id: "plus", name: "Premium Plus", productId: "equilibrio_premium_plus", basePlanId: "mensile",
    fallbackPrice: "4,99 €", tone: "move", emoji: "🌟",
    tagline: "Tutto insieme, a meno della somma dei singoli piani.",
    features: ["ai", "export", "pregnancy", "diabetes"],
    includes: [
      "Tutto Premium: IA sulle foto e sulle descrizioni, rapporti PDF",
      "Tutto Gravidanza: settimane, alimenti da evitare, esami e appuntamenti",
      "Tutto Diabete: glicemie, calcolatore del bolo, carboidrati nelle ricette",
    ],
  },
];

export const planById = (id: string) => PLANS.find((p) => p.id === id);

/** Piano più economico che sblocca una funzione: usato per l'invito all'upgrade. */
export const PLAN_FOR: Record<Feature, PlanId> = {
  ai: "premium",
  export: "premium",
  pregnancy: "gravidanza",
  diabetes: "diabete",
};
