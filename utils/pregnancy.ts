/**
 * Alimenti da evitare o limitare in gravidanza.
 *
 * Le indicazioni seguono le linee guida di sanità pubblica su listeriosi,
 * toxoplasmosi, salmonella, mercurio e caffeina. Restano indicazioni generali:
 * ogni gravidanza fa storia a sé e il riferimento è sempre il proprio medico
 * o l'ostetrica.
 */

export type Severity = "evitare" | "limitare" | "attenzione";

export interface FoodRisk {
  id: string;
  /** Termini che compaiono nel nome dell'alimento. */
  match: string[];
  title: string;
  severity: Severity;
  reason: string;
  advice: string;
  /** Caffeina in mg per porzione tipica, dove ha senso contarla. */
  caffeineMg?: number;
}

/** Limite giornaliero di caffeina indicato in gravidanza. */
export const CAFFEINE_LIMIT_MG = 200;

export const FOOD_RISKS: FoodRisk[] = [
  // ── alcol ──
  {
    id: "alcol",
    match: ["vino", "birra", "spritz", "cocktail", "prosecco", "champagne", "liquore", "amaro", "grappa", "rum", "vodka", "gin", "whisky", "aperol", "negroni", "limoncello"],
    title: "Bevande alcoliche",
    severity: "evitare",
    reason: "L'alcol attraversa la placenta e non esiste una quantità considerata sicura.",
    advice: "Nessun consumo per tutta la gravidanza. Le versioni analcoliche vanno bene.",
  },

  // ── caffeina ──
  {
    id: "caffe",
    match: ["caffè", "caffe", "espresso", "moka", "americano"],
    title: "Caffè",
    severity: "limitare",
    reason: `In gravidanza si consiglia di restare sotto ${CAFFEINE_LIMIT_MG} mg di caffeina al giorno.`,
    advice: "Un espresso è circa 80 mg: due o tre al giorno sono già al limite, contando anche tè e cioccolato.",
    caffeineMg: 80,
  },
  {
    id: "cappuccino",
    match: ["cappuccino", "latte macchiato", "caffelatte"],
    title: "Cappuccino",
    severity: "limitare",
    reason: `Contiene caffeina, che va tenuta sotto i ${CAFFEINE_LIMIT_MG} mg al giorno.`,
    advice: "Circa 80 mg a tazza. Il latte deve essere pastorizzato.",
    caffeineMg: 80,
  },
  {
    id: "te",
    match: ["tè", "the ", "tè verde", "tè nero", "matcha"],
    title: "Tè",
    severity: "limitare",
    reason: "Contribuisce al totale giornaliero di caffeina.",
    advice: "Circa 45 mg a tazza. Il tè verde riduce anche l'assorbimento del ferro: meglio lontano dai pasti.",
    caffeineMg: 45,
  },
  {
    id: "energetiche",
    match: ["energy drink", "red bull", "monster", "energetica"],
    title: "Bevande energetiche",
    severity: "evitare",
    reason: "Caffeina molto concentrata, spesso con altri stimolanti non valutati in gravidanza.",
    advice: "Meglio evitarle del tutto.",
    caffeineMg: 80,
  },
  {
    id: "cola",
    match: ["cola", "pepsi", "coca"],
    title: "Bibite alla cola",
    severity: "limitare",
    reason: "Contengono caffeina oltre agli zuccheri.",
    advice: "Circa 35 mg per lattina.",
    caffeineMg: 35,
  },
  {
    id: "cioccolato",
    match: ["cioccolato", "cioccolata", "cacao"],
    title: "Cioccolato",
    severity: "attenzione",
    reason: "Anche il cioccolato porta caffeina, soprattutto quello fondente.",
    advice: "Circa 25 mg ogni 50 g di fondente: conta poco da solo, ma si somma al resto.",
    caffeineMg: 25,
  },

  // ── listeria e toxoplasmosi ──
  {
    id: "salumi-crudi",
    match: ["prosciutto crudo", "salame", "bresaola", "speck", "coppa", "pancetta", "salsiccia cruda", "mortadella", "culatello", "capocollo"],
    title: "Salumi crudi e stagionati",
    severity: "evitare",
    reason: "Possibile veicolo di toxoplasmosi e listeria se non si è immuni.",
    advice: "Vanno bene ben cotti, per esempio sulla pizza o saltati in padella fino a farli diventare croccanti.",
  },
  {
    id: "prosciutto-cotto",
    match: ["prosciutto cotto", "affettato", "tacchino affettato", "wurstel"],
    title: "Affettati cotti",
    severity: "attenzione",
    reason: "Cotti sono più sicuri, ma dopo l'affettatura possono contaminarsi con listeria.",
    advice: "Consumali freschi di giornata, oppure scaldali fino a fumanti.",
  },
  {
    id: "carne-cruda",
    match: ["tartare", "carpaccio", "carne cruda", "al sangue", "bistecca al sangue", "roast beef"],
    title: "Carne cruda o poco cotta",
    severity: "evitare",
    reason: "Rischio di toxoplasmosi e altri patogeni.",
    advice: "Cuoci fino a che non resta rosa al centro, almeno 70 °C.",
  },
  {
    id: "pesce-crudo",
    match: ["sushi", "sashimi", "pesce crudo", "salmone crudo", "tonno crudo", "crudo abbattuto", "poke", "ostriche", "tartare di pesce", "ceviche", "carpaccio di pesce", "vongole crude"],
    title: "Pesce e molluschi crudi",
    severity: "evitare",
    reason: "Rischio di listeria e parassiti come l'anisakis.",
    advice: "Il pesce ben cotto va benissimo, anche nel sushi cotto.",
  },
  {
    id: "affumicato",
    match: ["salmone affumicato", "affumicato", "salmone marinato"],
    title: "Pesce affumicato o marinato",
    severity: "evitare",
    reason: "Non subisce cottura: possibile presenza di listeria.",
    advice: "Va bene se cotto, per esempio in un primo caldo.",
  },
  {
    id: "formaggi-molli",
    match: ["gorgonzola", "brie", "camembert", "roquefort", "taleggio", "feta", "formaggio erborinato", "crescenza", "stracchino", "burrata"],
    title: "Formaggi molli ed erborinati",
    severity: "attenzione",
    reason: "Se a latte crudo possono contenere listeria.",
    advice: "Controlla che siano a latte pastorizzato, oppure usali cotti. I formaggi duri stagionati sono sicuri.",
  },
  {
    id: "latte-crudo",
    match: ["latte crudo", "latte non pastorizzato"],
    title: "Latte crudo",
    severity: "evitare",
    reason: "Può contenere listeria e altri patogeni.",
    advice: "Usa latte pastorizzato o UHT, oppure fallo bollire.",
  },
  {
    id: "uova-crude",
    match: ["tiramisù", "tiramisu", "maionese", "uovo crudo", "uova crude", "zabaione", "mousse", "uovo alla coque", "uova poco cotte"],
    title: "Uova crude o poco cotte",
    severity: "evitare",
    reason: "Rischio di salmonella.",
    advice: "Vanno bene con uova pastorizzate o con albume e tuorlo ben rappresi.",
  },

  // ── mercurio ──
  {
    id: "pesce-mercurio",
    match: ["pesce spada", "tonno rosso", "squalo", "marlin", "verdesca", "palombo"],
    title: "Pesci grandi predatori",
    severity: "evitare",
    reason: "Accumulano mercurio, che interferisce con lo sviluppo del sistema nervoso.",
    advice: "Preferisci pesce azzurro piccolo, salmone, merluzzo, orata: due o tre porzioni a settimana.",
  },
  {
    id: "tonno-scatola",
    match: ["tonno in scatola", "tonno"],
    title: "Tonno in scatola",
    severity: "limitare",
    reason: "Contiene mercurio, anche se meno del tonno rosso fresco.",
    advice: "Al massimo due porzioni a settimana.",
  },

  // ── altri ──
  {
    id: "fegato",
    match: ["fegato", "fegatini", "paté"],
    title: "Fegato e derivati",
    severity: "evitare",
    reason: "Molto ricco di vitamina A preformata, che in eccesso può nuocere al feto.",
    advice: "Meglio evitarlo, soprattutto nel primo trimestre.",
  },
  {
    id: "verdure-crude",
    match: ["insalata", "verdure crude", "misticanza", "rucola", "songino"],
    title: "Verdure crude",
    severity: "attenzione",
    reason: "La terra residua può veicolare toxoplasmosi.",
    advice: "Lava accuratamente foglia per foglia, o usa bicarbonato. Al ristorante meglio verdure cotte.",
  },
  {
    id: "frutta-non-lavata",
    match: ["frutta"],
    title: "Frutta con buccia",
    severity: "attenzione",
    reason: "Come per le verdure, il rischio è la terra non rimossa.",
    advice: "Lava bene la buccia anche quando non la mangi.",
  },
  {
    id: "liquirizia",
    match: ["liquirizia"],
    title: "Liquirizia",
    severity: "limitare",
    reason: "In quantità elevate può alzare la pressione.",
    advice: "Qualche caramella occasionale, non di più.",
  },
  // ── aggiunte: altri alimenti da evitare o limitare ──
  {
    id: "frutti-mare-crudi",
    match: ["frutti di mare crudi", "crudo di mare", "ricci di mare", "cozze crude", "tartufi di mare", "gamberi crudi", "scampi crudi", "gamberi rossi crudi"],
    title: "Frutti di mare crudi",
    severity: "evitare",
    reason: "Possono trasmettere epatite A, norovirus, vibrioni e listeria.",
    advice: "Vanno bene solo ben cotti, con il guscio aperto dalla cottura.",
  },
  {
    id: "germogli",
    match: ["germogli", "germogli di soia", "alfalfa", "germogli di erba medica", "microgreens"],
    title: "Germogli crudi",
    severity: "evitare",
    reason: "Crescono al caldo e umido, l'ambiente ideale per salmonella ed E. coli; il lavaggio non basta.",
    advice: "Mangiali solo cotti, saltati in padella finché sono caldi in ogni punto.",
  },
  {
    id: "spalmabili-carne",
    match: ["nduja", "'nduja", "crema di salame", "spalmabile di carne", "rillettes"],
    title: "Salumi crudi spalmabili",
    severity: "evitare",
    reason: "Sono carne cruda stagionata: possibile toxoplasma e listeria.",
    advice: "Se cotti a lungo in un sugo bollente il rischio si annulla.",
  },
  {
    id: "affettati-banco",
    match: ["porchetta", "roast-beef affettato", "arrosto affettato", "pollo arrosto freddo", "insalata di pollo pronta", "insalata di riso pronta", "insalata russa"],
    title: "Carni cotte affettate o piatti pronti freddi",
    severity: "attenzione",
    reason: "Dopo la cottura, il taglio e la conservazione in frigo possono contaminarli con la listeria.",
    advice: "Meglio appena preparati, o riscaldati fino a fumare. Evita quelli aperti da giorni.",
  },
  {
    id: "pate-pesce",
    match: ["paté di pesce", "pate di pesce", "crema di salmone", "mousse di tonno", "taramasalata"],
    title: "Paté e creme di pesce refrigerate",
    severity: "evitare",
    reason: "Sono tra gli alimenti più spesso legati alla listeria.",
    advice: "Vanno bene quelli in scatola a lunga conservazione, a temperatura ambiente.",
  },
  {
    id: "formaggi-latte-crudo",
    match: ["formaggio a latte crudo", "formaggi di malga", "formaggio di malga", "tomino fresco", "ricotta di pecora fresca", "caprino fresco", "robiola di capra", "pecorino fresco", "primo sale artigianale"],
    title: "Formaggi freschi a latte crudo",
    severity: "evitare",
    reason: "Senza pastorizzazione il latte può contenere listeria e brucella.",
    advice: "Controlla l'etichetta: se è pastorizzato va bene. I formaggi duri stagionati (parmigiano, grana) sono sicuri.",
  },
  {
    id: "gelato-soft",
    match: ["gelato soft", "gelato alla spina", "frozen yogurt", "gelato artigianale all'uovo", "semifreddo", "crema al mascarpone"],
    title: "Gelati soft e dolci al cucchiaio non cotti",
    severity: "attenzione",
    reason: "Le macchine per il gelato soft e le creme con uova crude possono ospitare listeria e salmonella.",
    advice: "Preferisci gelati confezionati o di gelaterie che usano basi pastorizzate.",
  },
  {
    id: "salse-uovo",
    match: ["salsa olandese", "salsa bernese", "aioli", "aïoli", "salsa tonnata fatta in casa", "carbonara"],
    title: "Salse e piatti con uovo poco cotto",
    severity: "attenzione",
    reason: "Se l'uovo non raggiunge i 70 °C resta il rischio di salmonella.",
    advice: "Le versioni industriali sono pastorizzate; in casa cuoci l'uovo finché si rapprende.",
  },
  {
    id: "succhi-crudi",
    match: ["succo non pastorizzato", "succo fresco del bar", "centrifugato del bar", "estratto del bar", "sidro artigianale"],
    title: "Succhi freschi non pastorizzati",
    severity: "attenzione",
    reason: "Frutta e verdura spremute fuori casa possono non essere lavate a dovere.",
    advice: "Fatti in casa con frutta ben lavata vanno bene; altrimenti scegli succhi pastorizzati.",
  },
  {
    id: "selvaggina",
    match: ["cinghiale", "cervo", "capriolo", "lepre", "fagiano", "selvaggina"],
    title: "Selvaggina",
    severity: "attenzione",
    reason: "Può contenere toxoplasma se poco cotta e tracce di piombo dei pallini da caccia.",
    advice: "Solo ben cotta e non spesso.",
  },
  {
    id: "pesce-grande",
    match: ["luccio", "anguilla", "sgombro reale", "pesce persico del nilo", "storione"],
    title: "Pesci predatori o di lago",
    severity: "limitare",
    reason: "Accumulano mercurio e altri contaminanti.",
    advice: "Al massimo una porzione a settimana; preferisci alici, sardine, salmone, merluzzo, orata.",
  },
  {
    id: "erbe-integratori",
    match: ["ginseng", "iperico", "tisana dimagrante", "tisana drenante", "aloe vera", "olio di fegato di merluzzo", "integratore di vitamina a", "salvia in grandi quantità", "tisana alla liquirizia"],
    title: "Erbe e integratori non prescritti",
    severity: "evitare",
    reason: "Alcuni stimolano l'utero o contengono troppa vitamina A, dannosa per il feto.",
    advice: "Prendi solo gli integratori consigliati dal ginecologo (acido folico, ferro, iodio se indicato).",
  },
  {
    id: "alghe-iodio",
    match: ["alga kombu", "kombu", "alga hijiki", "hijiki", "alga wakame", "alga kelp"],
    title: "Alghe molto ricche di iodio",
    severity: "limitare",
    reason: "Kombu e kelp possono superare di molto il fabbisogno di iodio; l'hijiki contiene arsenico.",
    advice: "Il nori del sushi cotto va bene; evita hijiki e usa poco kombu.",
  },
  {
    id: "kombucha",
    match: ["kombucha", "kefir d'acqua", "birra analcolica artigianale"],
    title: "Bevande fermentate non pastorizzate",
    severity: "limitare",
    reason: "Contengono tracce di alcol e microrganismi vivi non controllati.",
    advice: "Meglio rinunciarci in gravidanza; lo yogurt e il kefir di latte pastorizzato vanno bene.",
  },
  {
    id: "dolcificanti",
    match: ["saccarina", "ciclamato"],
    title: "Saccarina e ciclamato",
    severity: "limitare",
    reason: "La saccarina attraversa la placenta; sul ciclamato i dati sono pochi.",
    advice: "Se servono, preferisci piccole quantità di sucralosio o stevia.",
  },
  {
    id: "funghi-selvatici",
    match: ["funghi raccolti", "funghi selvatici", "funghi crudi"],
    title: "Funghi selvatici o crudi",
    severity: "attenzione",
    reason: "Il rischio di intossicazione è più grave in gravidanza; crudi possono portare batteri del terreno.",
    advice: "Solo funghi coltivati o controllati dal micologo, sempre cotti.",
  },
];

export interface RiskHit extends FoodRisk {
  /** Nome dell'alimento che ha fatto scattare l'avviso. */
  food: string;
}

/**
 * Il termine deve comparire come parola intera: altrimenti "olio extravergine"
 * conteneva "gin" e "tortillas di frumento" conteneva "rum".
 */
function hasTerm(text: string, term: string): boolean {
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^a-zà-ÿ])${esc}(?=$|[^a-zà-ÿ])`, "i");
  if (!re.test(text)) return false;
  // "Amaro" è anche un aggettivo: cacao amaro, caffè amaro, cioccolato amaro.
  if (term === "amaro" && /(cacao|caff[eè]|cioccolat[oa]|gusto)\s+amar[oa]/i.test(text)) return false;
  return true;
}

/** Cerca nel nome di un alimento i rischi noti in gravidanza. */
export function checkFood(name: string): RiskHit[] {
  const t = ` ${String(name || "").toLowerCase()} `;
  const hits: RiskHit[] = [];
  const seen = new Set<string>();

  // I termini più lunghi vincono: "prosciutto cotto" non deve far scattare
  // l'avviso dei salumi crudi solo perché contiene "prosciutto".
  const ordered = [...FOOD_RISKS].sort(
    (a, b) => Math.max(...b.match.map((m) => m.length)) - Math.max(...a.match.map((m) => m.length)),
  );

  for (const risk of ordered) {
    if (seen.has(risk.id)) continue;
    const term = risk.match.find((m) => hasTerm(t, m));
    if (!term) continue;

    // Se un rischio più specifico copre già queste parole, si evita il doppione.
    if (hits.some((h) => h.match.some((m) => m.includes(term) && m !== term))) continue;

    seen.add(risk.id);
    hits.push({ ...risk, food: name });
  }
  return hits;
}

/** Controlla un elenco di alimenti in una volta sola. */
export function checkFoods(names: string[]): RiskHit[] {
  const all = names.flatMap((n) => checkFood(n));
  const seen = new Set<string>();
  return all.filter((h) => {
    const key = `${h.id}|${h.food}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const SEVERITY_TONE: Record<Severity, "alcohol" | "food" | "move"> = {
  evitare: "alcohol",
  limitare: "food",
  attenzione: "move",
};
