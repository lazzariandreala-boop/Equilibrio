/**
 * Ricettario locale: funziona offline e non richiede abbonamento.
 *
 * Valori nutrizionali per porzione, stimati sulle tabelle CREA a partire
 * dagli ingredienti. Le quantità sono per `serves` porzioni e si ricalcolano
 * in proporzione quando si cambia il numero di porzioni.
 */

export type MealKind = "colazione" | "pranzo" | "cena" | "spuntino";
export type Diet = "vegetariana" | "vegana" | "pescetariana" | "proteica" | "lowcarb" | "senzaglutine";
export type Cuisine = "italiana" | "mediterranea" | "asiatica" | "messicana" | "mediorientale" | "internazionale";
export type Unit = "g" | "ml" | "pz" | "cucchiaio" | "cucchiaino" | "spicchio" | "qb";

/** [nome, quantità per `serves` porzioni, unità] */
export type Ingredient = [string, number, Unit];

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  /** Due colori per lo sfondo della copertina, al posto della foto. */
  hue: [string, string];
  meals: MealKind[];
  diets: Diet[];
  cuisine: Cuisine;
  min: number;
  difficulty: "facile" | "media";
  /** Si porta in ufficio o in giro senza problemi. */
  portable?: boolean;
  oven?: boolean;
  serves: number;
  kcal: number;
  cho: number;
  pro: number;
  fat: number;
  fib: number;
  sugar: number;
  desc: string;
  ing: Ingredient[];
  steps: string[];
}

const G: [string, string] = ["#5bbf7a", "#2f8f5b"];
const R: [string, string] = ["#f08a5d", "#d1495b"];
const Y: [string, string] = ["#f6c85f", "#e08e2b"];
const B: [string, string] = ["#5aa9e6", "#3a6fb0"];
const P: [string, string] = ["#c77dff", "#7b4bb7"];
const T: [string, string] = ["#c49a6c", "#8d5b3b"];

export const RECIPES: Recipe[] = [
  // ───────────── colazioni ─────────────
  {
    id: "porridge-mela-cannella", name: "Porridge mela e cannella", emoji: "🥣", hue: T,
    meals: ["colazione"], diets: ["vegetariana"], cuisine: "internazionale", min: 10, difficulty: "facile", serves: 1,
    kcal: 360, cho: 58, pro: 12, fat: 8, fib: 8, sugar: 18,
    desc: "Fiocchi d'avena cotti nel latte con mela a dadini e cannella: sazia fino a pranzo.",
    ing: [["Fiocchi d'avena", 50, "g"], ["Latte parzialmente scremato", 200, "ml"], ["Mela", 1, "pz"], ["Cannella", 1, "cucchiaino"], ["Noci", 10, "g"]],
    steps: ["Taglia la mela a dadini.", "Metti avena, latte e metà della mela in un pentolino e cuoci a fuoco medio per 5 minuti mescolando.", "Versa nella tazza, aggiungi la mela rimasta, le noci spezzettate e la cannella."],
  },
  {
    id: "yogurt-frutti-bosco", name: "Yogurt greco, frutti di bosco e granola", emoji: "🫐", hue: P,
    meals: ["colazione", "spuntino"], diets: ["vegetariana", "proteica"], cuisine: "mediterranea", min: 5, difficulty: "facile", serves: 1, portable: true,
    kcal: 310, cho: 32, pro: 22, fat: 9, fib: 5, sugar: 18,
    desc: "Pronto in cinque minuti e ricco di proteine.",
    ing: [["Yogurt greco 2%", 170, "g"], ["Frutti di bosco", 100, "g"], ["Granola", 30, "g"], ["Miele", 1, "cucchiaino"]],
    steps: ["Metti lo yogurt in una ciotola o in un barattolo.", "Aggiungi i frutti di bosco e la granola.", "Completa con il miele."],
  },
  {
    id: "toast-avocado-uovo", name: "Toast con avocado e uovo in camicia", emoji: "🥑", hue: G,
    meals: ["colazione", "pranzo"], diets: ["vegetariana"], cuisine: "internazionale", min: 12, difficulty: "media", serves: 1,
    kcal: 420, cho: 32, pro: 17, fat: 25, fib: 9, sugar: 2,
    desc: "Pane integrale tostato, avocado schiacciato con limone e un uovo dal tuorlo morbido.",
    ing: [["Pane integrale", 60, "g"], ["Avocado", 0.5, "pz"], ["Uovo", 1, "pz"], ["Succo di limone", 1, "cucchiaino"], ["Sale e pepe", 0, "qb"], ["Peperoncino in fiocchi", 0, "qb"]],
    steps: ["Porta a leggero bollore un pentolino d'acqua con un goccio d'aceto.", "Crea un vortice con il cucchiaio e fai scivolare dentro l'uovo: cuoci 3 minuti.", "Tosta il pane e schiaccia l'avocado con limone, sale e pepe.", "Spalma l'avocado, appoggia l'uovo scolato e completa con il peperoncino."],
  },
  {
    id: "pancake-banana", name: "Pancake banana e avena", emoji: "🥞", hue: Y,
    meals: ["colazione"], diets: ["vegetariana", "senzaglutine"], cuisine: "internazionale", min: 15, difficulty: "facile", serves: 2,
    kcal: 280, cho: 40, pro: 11, fat: 8, fib: 5, sugar: 13,
    desc: "Tre ingredienti e niente zucchero aggiunto: la dolcezza arriva dalla banana.",
    ing: [["Banana matura", 2, "pz"], ["Uova", 2, "pz"], ["Fiocchi d'avena senza glutine", 60, "g"], ["Lievito per dolci", 1, "cucchiaino"], ["Olio di semi", 1, "cucchiaino"]],
    steps: ["Frulla banane, uova, avena e lievito fino a un composto liscio.", "Scalda una padella antiaderente appena unta.", "Versa un mestolino di impasto per pancake e cuoci 2 minuti per lato."],
  },
  {
    id: "overnight-oats", name: "Overnight oats al cacao", emoji: "🍫", hue: T,
    meals: ["colazione"], diets: ["vegetariana"], cuisine: "internazionale", min: 5, difficulty: "facile", serves: 1, portable: true,
    kcal: 350, cho: 48, pro: 16, fat: 10, fib: 8, sugar: 14,
    desc: "Si prepara la sera prima: la mattina è già pronta in frigo.",
    ing: [["Fiocchi d'avena", 45, "g"], ["Latte parzialmente scremato", 150, "ml"], ["Yogurt bianco", 60, "g"], ["Cacao amaro", 1, "cucchiaio"], ["Semi di chia", 1, "cucchiaino"], ["Banana", 0.5, "pz"]],
    steps: ["In un barattolo mescola avena, latte, yogurt, cacao e semi di chia.", "Chiudi e lascia in frigo per tutta la notte.", "Al mattino aggiungi la banana a fette."],
  },
  {
    id: "frittata-spinaci", name: "Frittata di albumi e spinaci", emoji: "🍳", hue: G,
    meals: ["colazione", "cena"], diets: ["vegetariana", "proteica", "lowcarb", "senzaglutine"], cuisine: "italiana", min: 12, difficulty: "facile", serves: 1,
    kcal: 210, cho: 5, pro: 28, fat: 8, fib: 3, sugar: 2,
    desc: "Tante proteine e pochissimi carboidrati, perfetta anche a cena.",
    ing: [["Albumi", 200, "g"], ["Uovo", 1, "pz"], ["Spinaci freschi", 100, "g"], ["Parmigiano grattugiato", 10, "g"], ["Olio extravergine d'oliva", 1, "cucchiaino"], ["Sale e pepe", 0, "qb"]],
    steps: ["Fai appassire gli spinaci in padella con l'olio per 2 minuti.", "Sbatti albumi, uovo, parmigiano, sale e pepe.", "Versa sugli spinaci, copri e cuoci a fuoco basso 6 minuti, poi gira la frittata."],
  },
  {
    id: "smoothie-verde", name: "Smoothie verde", emoji: "🥤", hue: G,
    meals: ["colazione", "spuntino"], diets: ["vegana", "senzaglutine"], cuisine: "internazionale", min: 5, difficulty: "facile", serves: 1, portable: true,
    kcal: 230, cho: 40, pro: 5, fat: 6, fib: 7, sugar: 26,
    desc: "Spinaci, banana e mela: fresco e veloce.",
    ing: [["Spinaci freschi", 40, "g"], ["Banana", 1, "pz"], ["Mela verde", 0.5, "pz"], ["Bevanda di mandorla", 200, "ml"], ["Zenzero fresco", 5, "g"]],
    steps: ["Metti tutti gli ingredienti nel frullatore.", "Frulla per un minuto fino a renderlo liscio.", "Servi subito, eventualmente con ghiaccio."],
  },

  // ───────────── primi ─────────────
  {
    id: "pasta-pomodoro-basilico", name: "Pasta al pomodoro e basilico", emoji: "🍝", hue: R,
    meals: ["pranzo", "cena"], diets: ["vegana"], cuisine: "italiana", min: 20, difficulty: "facile", serves: 2,
    kcal: 430, cho: 76, pro: 13, fat: 8, fib: 5, sugar: 8,
    desc: "Il classico che non stanca mai, con passata e basilico fresco.",
    ing: [["Spaghetti", 160, "g"], ["Passata di pomodoro", 300, "g"], ["Spicchio d'aglio", 1, "spicchio"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Basilico fresco", 10, "g"], ["Sale", 0, "qb"]],
    steps: ["Porta a bollore l'acqua salata per la pasta.", "Rosola l'aglio nell'olio, aggiungi la passata e un pizzico di sale: cuoci 12 minuti.", "Scola la pasta al dente e saltala nel sugo con il basilico spezzettato."],
  },
  {
    id: "pasta-zucchine-menta", name: "Pasta zucchine, menta e limone", emoji: "🍋", hue: G,
    meals: ["pranzo", "cena"], diets: ["vegetariana"], cuisine: "italiana", min: 20, difficulty: "facile", serves: 2,
    kcal: 450, cho: 70, pro: 16, fat: 12, fib: 5, sugar: 5,
    desc: "Zucchine saltate, scorza di limone e menta fresca: estiva e leggera.",
    ing: [["Penne integrali", 160, "g"], ["Zucchine", 300, "g"], ["Scorza di limone", 1, "pz"], ["Menta fresca", 5, "g"], ["Parmigiano grattugiato", 20, "g"], ["Olio extravergine d'oliva", 1, "cucchiaio"]],
    steps: ["Taglia le zucchine a rondelle e saltale in padella con l'olio per 8 minuti.", "Cuoci la pasta e scolala tenendo un mestolo d'acqua.", "Unisci pasta, zucchine, acqua di cottura, scorza di limone, menta e parmigiano."],
  },
  {
    id: "pasta-ceci", name: "Pasta e ceci", emoji: "🫘", hue: Y,
    meals: ["pranzo", "cena"], diets: ["vegana", "proteica"], cuisine: "italiana", min: 30, difficulty: "facile", serves: 2,
    kcal: 480, cho: 74, pro: 20, fat: 11, fib: 11, sugar: 4,
    desc: "Piatto unico della tradizione: legumi e cereali insieme danno proteine complete.",
    ing: [["Ditalini", 120, "g"], ["Ceci cotti", 240, "g"], ["Passata di pomodoro", 100, "g"], ["Spicchio d'aglio", 1, "spicchio"], ["Rosmarino", 1, "pz"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Brodo vegetale", 600, "ml"]],
    steps: ["Rosola aglio e rosmarino nell'olio, poi aggiungi ceci e passata.", "Versa il brodo e cuoci 10 minuti, poi frulla metà dei ceci.", "Aggiungi la pasta e cuocila direttamente nella minestra, mescolando spesso."],
  },
  {
    id: "risotto-funghi", name: "Risotto ai funghi", emoji: "🍄", hue: T,
    meals: ["pranzo", "cena"], diets: ["vegetariana", "senzaglutine"], cuisine: "italiana", min: 35, difficulty: "media", serves: 2,
    kcal: 460, cho: 72, pro: 12, fat: 12, fib: 3, sugar: 2,
    desc: "Cremoso e profumato, con champignon freschi e un filo di parmigiano.",
    ing: [["Riso Carnaroli", 160, "g"], ["Funghi champignon", 250, "g"], ["Cipolla", 0.5, "pz"], ["Brodo vegetale", 800, "ml"], ["Parmigiano grattugiato", 20, "g"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Prezzemolo", 0, "qb"]],
    steps: ["Trita la cipolla e falla appassire nell'olio.", "Aggiungi i funghi a fette e cuoci 5 minuti.", "Tosta il riso, poi aggiungi il brodo caldo un mestolo alla volta per 17 minuti.", "Manteca a fuoco spento con parmigiano e prezzemolo."],
  },
  {
    id: "orzo-insalata", name: "Insalata d'orzo con verdure", emoji: "🥗", hue: G,
    meals: ["pranzo"], diets: ["vegetariana"], cuisine: "mediterranea", min: 25, difficulty: "facile", serves: 2, portable: true,
    kcal: 420, cho: 60, pro: 13, fat: 14, fib: 10, sugar: 5,
    desc: "Fresca, si prepara in anticipo e si porta in ufficio.",
    ing: [["Orzo perlato", 140, "g"], ["Pomodorini", 200, "g"], ["Cetriolo", 1, "pz"], ["Feta", 60, "g"], ["Olive nere", 30, "g"], ["Olio extravergine d'oliva", 1, "cucchiaio"]],
    steps: ["Cuoci l'orzo in acqua salata per 20 minuti, scolalo e raffreddalo.", "Taglia pomodorini e cetriolo, sbriciola la feta.", "Unisci tutto con olive e olio."],
  },
  {
    id: "minestrone", name: "Minestrone di verdure", emoji: "🍲", hue: G,
    meals: ["pranzo", "cena"], diets: ["vegana", "senzaglutine"], cuisine: "italiana", min: 45, difficulty: "facile", serves: 4,
    kcal: 190, cho: 28, pro: 8, fat: 5, fib: 9, sugar: 8,
    desc: "Tante verdure, legumi e un filo d'olio a crudo: leggero e saziante.",
    ing: [["Patate", 300, "g"], ["Carote", 200, "g"], ["Zucchine", 200, "g"], ["Sedano", 100, "g"], ["Fagioli borlotti cotti", 240, "g"], ["Passata di pomodoro", 100, "g"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Brodo vegetale", 1500, "ml"]],
    steps: ["Taglia tutte le verdure a cubetti.", "Mettile in pentola con brodo e passata e cuoci 30 minuti.", "Aggiungi i fagioli e cuoci altri 10 minuti.", "Servi con un filo d'olio a crudo."],
  },
  {
    id: "vellutata-zucca", name: "Vellutata di zucca", emoji: "🎃", hue: Y,
    meals: ["pranzo", "cena"], diets: ["vegana", "senzaglutine"], cuisine: "italiana", min: 35, difficulty: "facile", serves: 2,
    kcal: 180, cho: 26, pro: 4, fat: 7, fib: 5, sugar: 10,
    desc: "Dolce e cremosa, perfetta in autunno.",
    ing: [["Zucca", 600, "g"], ["Patata", 1, "pz"], ["Cipolla", 0.5, "pz"], ["Brodo vegetale", 500, "ml"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Noce moscata", 0, "qb"]],
    steps: ["Pulisci la zucca e tagliala a cubetti insieme alla patata.", "Fai appassire la cipolla nell'olio, aggiungi le verdure e il brodo.", "Cuoci 25 minuti e frulla, aggiustando con sale e noce moscata."],
  },
  {
    id: "minestra-stracciatella", name: "Stracciatella in brodo", emoji: "🥚", hue: Y,
    meals: ["cena"], diets: ["vegetariana", "proteica", "senzaglutine"], cuisine: "italiana", min: 15, difficulty: "facile", serves: 2,
    kcal: 170, cho: 3, pro: 15, fat: 11, fib: 0, sugar: 1,
    desc: "Uova e parmigiano sbattuti nel brodo bollente: confortante.",
    ing: [["Brodo vegetale", 700, "ml"], ["Uova", 3, "pz"], ["Parmigiano grattugiato", 25, "g"], ["Noce moscata", 0, "qb"], ["Prezzemolo", 0, "qb"]],
    steps: ["Porta a bollore il brodo.", "Sbatti uova, parmigiano e noce moscata.", "Versa il composto nel brodo mescolando con una frusta per un minuto e servi."],
  },

  // ───────────── secondi di carne ─────────────
  {
    id: "pollo-limone", name: "Petto di pollo al limone", emoji: "🍗", hue: Y,
    meals: ["pranzo", "cena"], diets: ["proteica", "lowcarb", "senzaglutine"], cuisine: "italiana", min: 20, difficulty: "facile", serves: 2,
    kcal: 260, cho: 3, pro: 40, fat: 9, fib: 0, sugar: 1,
    desc: "Fettine tenere e profumate, pronte in venti minuti.",
    ing: [["Petto di pollo", 350, "g"], ["Succo di limone", 1, "pz"], ["Farina di riso", 15, "g"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Prezzemolo", 0, "qb"]],
    steps: ["Batti le fettine e infarinale leggermente.", "Rosolale nell'olio 3 minuti per lato.", "Aggiungi il succo di limone e un goccio d'acqua, cuoci 2 minuti fino a velare e completa con il prezzemolo."],
  },
  {
    id: "pollo-forno-pomodorini", name: "Pollo al forno con pomodorini e mozzarella", emoji: "🧀", hue: R,
    meals: ["pranzo", "cena"], diets: ["proteica", "lowcarb", "senzaglutine"], cuisine: "italiana", min: 35, difficulty: "facile", serves: 2, oven: true,
    kcal: 380, cho: 6, pro: 48, fat: 18, fib: 2, sugar: 4,
    desc: "Petto di pollo gratinato con pomodorini e basilico.",
    ing: [["Petto di pollo", 350, "g"], ["Pomodorini", 250, "g"], ["Mozzarella", 125, "g"], ["Basilico fresco", 5, "g"], ["Olio extravergine d'oliva", 1, "cucchiaio"]],
    steps: ["Preriscalda il forno a 200 °C.", "Disponi il pollo in teglia con i pomodorini tagliati, olio e sale.", "Cuoci 20 minuti, aggiungi la mozzarella a fette e gratina altri 5 minuti.", "Completa con basilico fresco."],
  },
  {
    id: "polpette-sugo", name: "Polpette al sugo", emoji: "🍖", hue: R,
    meals: ["pranzo", "cena"], diets: ["proteica"], cuisine: "italiana", min: 40, difficulty: "media", serves: 3,
    kcal: 410, cho: 16, pro: 32, fat: 23, fib: 2, sugar: 6,
    desc: "Morbide polpette di manzo cotte direttamente nella salsa.",
    ing: [["Macinato di manzo magro", 400, "g"], ["Uovo", 1, "pz"], ["Pangrattato", 40, "g"], ["Parmigiano grattugiato", 30, "g"], ["Passata di pomodoro", 500, "g"], ["Olio extravergine d'oliva", 1, "cucchiaio"]],
    steps: ["Impasta carne, uovo, pangrattato, parmigiano e un pizzico di sale.", "Forma le polpette.", "Scalda la passata con l'olio, aggiungi le polpette e cuoci coperto 25 minuti girandole a metà."],
  },
  {
    id: "wrap-tacchino", name: "Wrap di tacchino e spinacini", emoji: "🌯", hue: G,
    meals: ["pranzo", "spuntino"], diets: ["proteica"], cuisine: "internazionale", min: 5, difficulty: "facile", serves: 1, portable: true,
    kcal: 340, cho: 30, pro: 26, fat: 12, fib: 4, sugar: 3,
    desc: "Da arrotolare al volo e portare in ufficio.",
    ing: [["Piadina integrale", 1, "pz"], ["Fesa di tacchino", 80, "g"], ["Formaggio spalmabile light", 30, "g"], ["Spinacini", 20, "g"], ["Mirtilli rossi secchi", 10, "g"]],
    steps: ["Spalma il formaggio sulla piadina.", "Aggiungi tacchino, spinacini e mirtilli rossi.", "Arrotola stretta e taglia a rondelle o a metà."],
  },
  {
    id: "straccetti-rucola", name: "Straccetti di manzo, rucola e grana", emoji: "🥩", hue: T,
    meals: ["pranzo", "cena"], diets: ["proteica", "lowcarb", "senzaglutine"], cuisine: "italiana", min: 15, difficulty: "facile", serves: 2,
    kcal: 330, cho: 2, pro: 38, fat: 19, fib: 1, sugar: 1,
    desc: "Cottura velocissima, pochi ingredienti e tanto gusto.",
    ing: [["Straccetti di manzo", 300, "g"], ["Rucola", 60, "g"], ["Grana a scaglie", 30, "g"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Aceto balsamico", 1, "cucchiaino"]],
    steps: ["Scalda bene una padella con l'olio.", "Cuoci gli straccetti 2-3 minuti a fuoco vivo, salali a fine cottura.", "Servili su un letto di rucola con grana e qualche goccia di balsamico."],
  },
  {
    id: "chili-con-carne", name: "Chili con carne", emoji: "🌶️", hue: R,
    meals: ["pranzo", "cena"], diets: ["proteica", "senzaglutine"], cuisine: "messicana", min: 40, difficulty: "facile", serves: 3,
    kcal: 420, cho: 30, pro: 33, fat: 17, fib: 10, sugar: 8,
    desc: "Manzo, fagioli rossi e spezie: saporito e saziante.",
    ing: [["Macinato di manzo magro", 400, "g"], ["Fagioli rossi cotti", 240, "g"], ["Pomodori pelati", 400, "g"], ["Cipolla", 1, "pz"], ["Peperone rosso", 1, "pz"], ["Paprika e cumino", 2, "cucchiaino"], ["Olio extravergine d'oliva", 1, "cucchiaio"]],
    steps: ["Trita cipolla e peperone e falli appassire nell'olio.", "Aggiungi la carne e rosolala, poi le spezie.", "Unisci pelati e fagioli e cuoci 25 minuti a fuoco basso."],
  },
  {
    id: "tacos-pollo", name: "Tacos di pollo e avocado", emoji: "🌮", hue: Y,
    meals: ["cena"], diets: ["proteica"], cuisine: "messicana", min: 25, difficulty: "facile", serves: 2,
    kcal: 480, cho: 38, pro: 34, fat: 20, fib: 8, sugar: 4,
    desc: "Tortillas morbide con pollo speziato, avocado e lime.",
    ing: [["Tortillas di mais", 6, "pz"], ["Petto di pollo", 300, "g"], ["Avocado", 1, "pz"], ["Lime", 1, "pz"], ["Pomodorini", 150, "g"], ["Paprika e cumino", 1, "cucchiaino"], ["Coriandolo", 0, "qb"]],
    steps: ["Taglia il pollo a striscioline e cuocilo in padella con le spezie.", "Schiaccia l'avocado con lime e sale; taglia i pomodorini.", "Scalda le tortillas e farciscile con pollo, avocado, pomodorini e coriandolo."],
  },

  // ───────────── pesce ─────────────
  {
    id: "salmone-forno", name: "Salmone al forno con patate", emoji: "🐟", hue: R,
    meals: ["pranzo", "cena"], diets: ["pescetariana", "proteica", "senzaglutine"], cuisine: "mediterranea", min: 35, difficulty: "facile", serves: 2, oven: true,
    kcal: 480, cho: 28, pro: 34, fat: 24, fib: 3, sugar: 2,
    desc: "Filetto morbido e patate croccanti, tutto in un'unica teglia.",
    ing: [["Filetto di salmone", 300, "g"], ["Patate", 350, "g"], ["Succo di limone", 1, "pz"], ["Rosmarino", 1, "pz"], ["Olio extravergine d'oliva", 1, "cucchiaio"]],
    steps: ["Preriscalda il forno a 200 °C.", "Taglia le patate a spicchi, condiscile con olio e rosmarino e infornale per 15 minuti.", "Aggiungi il salmone, irrora di limone e cuoci altri 12 minuti."],
  },
  {
    id: "insalata-tonno-toscana", name: "Insalata tiepida di tonno e olive", emoji: "🫒", hue: G,
    meals: ["pranzo", "cena"], diets: ["pescetariana", "proteica", "lowcarb", "senzaglutine"], cuisine: "italiana", min: 20, difficulty: "facile", serves: 2,
    kcal: 330, cho: 8, pro: 30, fat: 19, fib: 3, sugar: 5,
    desc: "Pomodorini scottati, tonno, olive e timo.",
    ing: [["Tonno al naturale", 240, "g"], ["Pomodorini", 300, "g"], ["Olive verdi", 50, "g"], ["Timo fresco", 0, "qb"], ["Olio extravergine d'oliva", 1, "cucchiaio"]],
    steps: ["Scotta i pomodorini in padella con l'olio per 4 minuti.", "Aggiungi olive e tonno sgocciolato e scalda un minuto.", "Completa con il timo e servi tiepida."],
  },
  {
    id: "insalata-greca", name: "Insalata greca", emoji: "🥒", hue: B,
    meals: ["pranzo", "cena"], diets: ["vegetariana", "lowcarb", "senzaglutine"], cuisine: "mediterranea", min: 7, difficulty: "facile", serves: 2, portable: true,
    kcal: 230, cho: 9, pro: 9, fat: 18, fib: 3, sugar: 6,
    desc: "Cetrioli, pomodori, feta e origano: un classico estivo.",
    ing: [["Cetriolo", 1, "pz"], ["Pomodori", 250, "g"], ["Feta", 100, "g"], ["Cipolla rossa", 0.5, "pz"], ["Olive nere", 30, "g"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Origano", 0, "qb"]],
    steps: ["Taglia cetriolo e pomodori a pezzi, la cipolla a fettine sottili.", "Unisci olive e feta a cubetti.", "Condisci con olio, origano e un pizzico di sale."],
  },
  {
    id: "orata-cartoccio", name: "Orata al cartoccio", emoji: "🐠", hue: B,
    meals: ["cena"], diets: ["pescetariana", "proteica", "lowcarb", "senzaglutine"], cuisine: "italiana", min: 30, difficulty: "media", serves: 2, oven: true,
    kcal: 290, cho: 4, pro: 38, fat: 13, fib: 1, sugar: 2,
    desc: "Cottura delicata che mantiene il pesce morbido e profumato.",
    ing: [["Filetti di orata", 350, "g"], ["Pomodorini", 150, "g"], ["Olive taggiasche", 20, "g"], ["Capperi", 1, "cucchiaio"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Prezzemolo", 0, "qb"]],
    steps: ["Preriscalda il forno a 190 °C.", "Disponi i filetti su carta forno con pomodorini, olive, capperi e olio.", "Chiudi il cartoccio e cuoci 18 minuti."],
  },
  {
    id: "couscous-gamberi", name: "Cous cous con gamberi e verdure", emoji: "🦐", hue: Y,
    meals: ["pranzo", "cena"], diets: ["pescetariana", "proteica"], cuisine: "mediorientale", min: 20, difficulty: "facile", serves: 2, portable: true,
    kcal: 430, cho: 58, pro: 28, fat: 10, fib: 5, sugar: 5,
    desc: "Pronto in venti minuti, buono anche freddo.",
    ing: [["Cous cous", 140, "g"], ["Gamberi sgusciati", 250, "g"], ["Zucchine", 150, "g"], ["Peperone giallo", 0.5, "pz"], ["Succo di limone", 1, "pz"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Menta fresca", 0, "qb"]],
    steps: ["Copri il cous cous con pari peso d'acqua bollente salata e lascialo riposare 5 minuti.", "Salta le verdure a cubetti nell'olio, poi aggiungi i gamberi per 3 minuti.", "Sgrana il cous cous e unisci tutto con limone e menta."],
  },
  {
    id: "poke-salmone", name: "Poke bowl al salmone", emoji: "🍣", hue: R,
    meals: ["pranzo", "cena"], diets: ["pescetariana", "proteica"], cuisine: "asiatica", min: 25, difficulty: "facile", serves: 2,
    kcal: 540, cho: 58, pro: 28, fat: 21, fib: 6, sugar: 5,
    desc: "Riso, salmone abbattuto, avocado ed edamame con salsa di soia.",
    ing: [["Riso a chicco tondo", 140, "g"], ["Salmone crudo abbattuto", 200, "g"], ["Avocado", 1, "pz"], ["Edamame sgusciati", 80, "g"], ["Carote", 1, "pz"], ["Salsa di soia", 2, "cucchiaio"], ["Semi di sesamo", 1, "cucchiaino"]],
    steps: ["Cuoci il riso e lascialo intiepidire.", "Taglia il salmone a cubetti e marinalo 10 minuti nella soia.", "Componi le ciotole con riso, salmone, avocado, edamame e carota a julienne, poi il sesamo."],
  },
  {
    id: "tonno-sesamo", name: "Tagliata di tonno al sesamo", emoji: "🐟", hue: P,
    meals: ["cena"], diets: ["pescetariana", "proteica", "lowcarb"], cuisine: "asiatica", min: 15, difficulty: "media", serves: 2,
    kcal: 320, cho: 4, pro: 42, fat: 15, fib: 2, sugar: 2,
    desc: "Crosta croccante fuori, rosato dentro.",
    ing: [["Trancio di tonno fresco", 320, "g"], ["Semi di sesamo", 30, "g"], ["Salsa di soia", 1, "cucchiaio"], ["Olio di semi", 1, "cucchiaino"], ["Insalata mista", 100, "g"]],
    steps: ["Spennella il tonno di soia e passalo nel sesamo.", "Scottalo in padella rovente 1 minuto per lato.", "Taglialo a fette e servilo sull'insalata."],
  },

  // ───────────── vegetariani e vegani ─────────────
  {
    id: "sformato-zucchine-feta", name: "Sformato di zucchine e feta", emoji: "🍅", hue: R,
    meals: ["pranzo", "cena"], diets: ["vegetariana", "senzaglutine"], cuisine: "mediterranea", min: 70, difficulty: "facile", serves: 4, oven: true,
    kcal: 390, cho: 23, pro: 22, fat: 22, fib: 4, sugar: 7,
    desc: "Strati di zucchine, patate e pomodori con un ripieno cremoso di formaggi e menta.",
    ing: [["Zucchine", 500, "g"], ["Patate", 400, "g"], ["Pomodori", 200, "g"], ["Spicchio d'aglio", 2, "spicchio"], ["Mozzarella", 125, "g"], ["Feta", 150, "g"], ["Fiocchi di latte", 200, "g"], ["Menta fresca", 10, "g"], ["Olio extravergine d'oliva", 2, "cucchiaino"]],
    steps: ["Preriscalda il forno a 200 °C.", "Taglia zucchine, patate e pomodori a fettine sottili.", "Trita aglio e mozzarella e mescolali con feta, fiocchi di latte e menta.", "Alterna in teglia patate, zucchine e ripieno, chiudi con i pomodori e un filo d'olio.", "Cuoci 50 minuti finché le patate sono tenere."],
  },
  {
    id: "carote-feta", name: "Carote arrostite con feta", emoji: "🥕", hue: Y,
    meals: ["pranzo", "cena"], diets: ["vegetariana", "senzaglutine"], cuisine: "mediterranea", min: 30, difficulty: "facile", serves: 2, oven: true,
    kcal: 300, cho: 22, pro: 10, fat: 19, fib: 7, sugar: 14,
    desc: "Carote caramellate al forno con feta sbriciolata e prezzemolo.",
    ing: [["Carote", 500, "g"], ["Feta", 80, "g"], ["Miele", 1, "cucchiaino"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Prezzemolo", 0, "qb"]],
    steps: ["Preriscalda il forno a 210 °C.", "Taglia le carote per il lungo, condiscile con olio, miele e sale.", "Arrostiscile 25 minuti e completa con feta e prezzemolo."],
  },
  {
    id: "caprese", name: "Insalata caprese", emoji: "🍅", hue: R,
    meals: ["pranzo", "cena"], diets: ["vegetariana", "lowcarb", "senzaglutine"], cuisine: "italiana", min: 5, difficulty: "facile", serves: 2,
    kcal: 320, cho: 6, pro: 17, fat: 25, fib: 2, sugar: 5,
    desc: "Pomodoro, mozzarella e basilico: cinque minuti e via.",
    ing: [["Pomodori cuore di bue", 300, "g"], ["Mozzarella", 250, "g"], ["Basilico fresco", 5, "g"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Origano", 0, "qb"]],
    steps: ["Taglia pomodori e mozzarella a fette.", "Alternale nel piatto con le foglie di basilico.", "Condisci con olio, sale e origano."],
  },
  {
    id: "quinoa-ceci-avocado", name: "Bowl di quinoa, ceci e avocado", emoji: "🥙", hue: G,
    meals: ["pranzo"], diets: ["vegana", "senzaglutine", "proteica"], cuisine: "mediterranea", min: 25, difficulty: "facile", serves: 2, portable: true,
    kcal: 520, cho: 56, pro: 18, fat: 24, fib: 14, sugar: 4,
    desc: "Completa e colorata, con tahina e limone.",
    ing: [["Quinoa", 120, "g"], ["Ceci cotti", 240, "g"], ["Avocado", 1, "pz"], ["Pomodorini", 150, "g"], ["Tahina", 1, "cucchiaio"], ["Succo di limone", 1, "pz"], ["Coriandolo", 0, "qb"]],
    steps: ["Sciacqua la quinoa e cuocila 15 minuti in acqua salata.", "Prepara la salsa con tahina, limone e un goccio d'acqua.", "Componi le ciotole con quinoa, ceci, avocado e pomodorini e condisci."],
  },
  {
    id: "insalata-quinoa-pollo", name: "Insalata di quinoa e pollo", emoji: "🥗", hue: G,
    meals: ["pranzo"], diets: ["proteica", "senzaglutine"], cuisine: "mediterranea", min: 25, difficulty: "facile", serves: 2, portable: true,
    kcal: 520, cho: 45, pro: 40, fat: 18, fib: 6, sugar: 4,
    desc: "Pollo alla piastra, quinoa, cetriolo e prezzemolo.",
    ing: [["Quinoa", 120, "g"], ["Petto di pollo", 280, "g"], ["Cetriolo", 1, "pz"], ["Pomodorini", 150, "g"], ["Prezzemolo", 0, "qb"], ["Olio extravergine d'oliva", 1, "cucchiaio"], ["Succo di limone", 1, "pz"]],
    steps: ["Cuoci la quinoa e lasciala raffreddare.", "Cuoci il pollo alla piastra e taglialo a fette.", "Unisci quinoa, verdure, pollo e condisci con olio e limone."],
  },
  {
    id: "curry-lenticchie", name: "Curry di lenticchie rosse", emoji: "🍛", hue: Y,
    meals: ["pranzo", "cena"], diets: ["vegana", "senzaglutine", "proteica"], cuisine: "asiatica", min: 30, difficulty: "facile", serves: 3,
    kcal: 390, cho: 46, pro: 18, fat: 13, fib: 11, sugar: 7,
    desc: "Lenticchie rosse, latte di cocco e spezie: si fa in una pentola sola.",
    ing: [["Lenticchie rosse decorticate", 200, "g"], ["Latte di cocco light", 200, "ml"], ["Pomodori pelati", 400, "g"], ["Cipolla", 1, "pz"], ["Curry in polvere", 2, "cucchiaino"], ["Zenzero fresco", 10, "g"], ["Spinaci freschi", 100, "g"]],
    steps: ["Fai appassire cipolla e zenzero tritati con un goccio d'acqua o d'olio.", "Aggiungi curry, lenticchie, pelati e latte di cocco.", "Cuoci 20 minuti, poi unisci gli spinaci fino a farli appassire."],
  },
  {
    id: "polpette-lenticchie", name: "Polpette di lenticchie al forno", emoji: "🧆", hue: T,
    meals: ["pranzo", "cena"], diets: ["vegana", "proteica"], cuisine: "mediorientale", min: 40, difficulty: "media", serves: 3, oven: true, portable: true,
    kcal: 330, cho: 44, pro: 16, fat: 9, fib: 10, sugar: 3,
    desc: "Croccanti fuori e morbide dentro, ottime con salsa allo yogurt vegetale.",
    ing: [["Lenticchie cotte", 400, "g"], ["Pangrattato", 60, "g"], ["Carote", 1, "pz"], ["Cipolla", 0.5, "pz"], ["Paprika e cumino", 1, "cucchiaino"], ["Olio extravergine d'oliva", 1, "cucchiaio"]],
    steps: ["Preriscalda il forno a 200 °C.", "Frulla lenticchie, carota e cipolla, poi unisci pangrattato e spezie.", "Forma le polpette, ungile leggermente e cuocile 25 minuti girandole a metà."],
  },
  {
    id: "tofu-saltato", name: "Tofu saltato con verdure e soia", emoji: "🥢", hue: P,
    meals: ["cena"], diets: ["vegana", "proteica", "lowcarb"], cuisine: "asiatica", min: 20, difficulty: "facile", serves: 2,
    kcal: 300, cho: 14, pro: 22, fat: 17, fib: 5, sugar: 7,
    desc: "Tofu dorato, broccoli e peperoni in padella con salsa di soia.",
    ing: [["Tofu compatto", 300, "g"], ["Broccoli", 200, "g"], ["Peperone rosso", 1, "pz"], ["Salsa di soia", 2, "cucchiaio"], ["Zenzero fresco", 5, "g"], ["Olio di semi", 1, "cucchiaio"]],
    steps: ["Taglia il tofu a cubetti e rosolalo nell'olio fino a dorarlo.", "Aggiungi broccoli e peperone e salta 6 minuti.", "Unisci soia e zenzero grattugiato, mescola un minuto e servi."],
  },
  {
    id: "riso-verdure-asiatico", name: "Riso saltato con verdure e uovo", emoji: "🍚", hue: Y,
    meals: ["pranzo", "cena"], diets: ["vegetariana"], cuisine: "asiatica", min: 20, difficulty: "facile", serves: 2,
    kcal: 450, cho: 66, pro: 15, fat: 13, fib: 4, sugar: 4,
    desc: "Il modo migliore per usare il riso avanzato.",
    ing: [["Riso basmati cotto", 400, "g"], ["Uova", 2, "pz"], ["Piselli", 100, "g"], ["Carote", 1, "pz"], ["Cipollotto", 1, "pz"], ["Salsa di soia", 2, "cucchiaio"], ["Olio di semi", 1, "cucchiaio"]],
    steps: ["Salta carota a cubetti e piselli nell'olio per 5 minuti.", "Sposta le verdure di lato, strapazza le uova e mescola.", "Aggiungi riso e soia, salta 3 minuti a fuoco vivo e completa col cipollotto."],
  },
  {
    id: "polpette-riso-onigiri", name: "Onigiri con salmone", emoji: "🍙", hue: B,
    meals: ["pranzo", "spuntino"], diets: ["pescetariana"], cuisine: "asiatica", min: 30, difficulty: "media", serves: 2, portable: true,
    kcal: 380, cho: 62, pro: 16, fat: 6, fib: 2, sugar: 1,
    desc: "Polpette di riso giapponesi da portare in giro.",
    ing: [["Riso a chicco tondo", 160, "g"], ["Salmone cotto", 100, "g"], ["Alga nori", 2, "pz"], ["Semi di sesamo", 1, "cucchiaino"], ["Salsa di soia", 1, "cucchiaio"]],
    steps: ["Cuoci il riso e lascialo intiepidire.", "Con le mani bagnate forma dei triangoli mettendo al centro il salmone sbriciolato.", "Avvolgi la base con una striscia di alga e cospargi di sesamo."],
  },
  {
    id: "hummus-verdure", name: "Hummus con verdure croccanti", emoji: "🥕", hue: Y,
    meals: ["spuntino"], diets: ["vegana", "senzaglutine"], cuisine: "mediorientale", min: 10, difficulty: "facile", serves: 4, portable: true,
    kcal: 190, cho: 18, pro: 7, fat: 10, fib: 7, sugar: 4,
    desc: "Crema di ceci e tahina con bastoncini di carota e sedano.",
    ing: [["Ceci cotti", 240, "g"], ["Tahina", 2, "cucchiaio"], ["Succo di limone", 1, "pz"], ["Spicchio d'aglio", 1, "spicchio"], ["Carote", 2, "pz"], ["Sedano", 2, "pz"]],
    steps: ["Frulla ceci, tahina, limone, aglio, sale e qualche cucchiaio d'acqua.", "Taglia carote e sedano a bastoncini.", "Servi l'hummus con un filo d'olio e le verdure."],
  },
  {
    id: "shakshuka", name: "Shakshuka", emoji: "🍳", hue: R,
    meals: ["colazione", "cena"], diets: ["vegetariana", "senzaglutine", "proteica"], cuisine: "mediorientale", min: 25, difficulty: "facile", serves: 2,
    kcal: 280, cho: 15, pro: 17, fat: 17, fib: 4, sugar: 10,
    desc: "Uova cotte in un sugo speziato di pomodoro e peperoni.",
    ing: [["Uova", 4, "pz"], ["Pomodori pelati", 400, "g"], ["Peperone rosso", 1, "pz"], ["Cipolla", 0.5, "pz"], ["Paprika e cumino", 1, "cucchiaino"], ["Olio extravergine d'oliva", 1, "cucchiaio"]],
    steps: ["Fai appassire cipolla e peperone nell'olio con le spezie.", "Aggiungi i pelati e cuoci 10 minuti.", "Crea quattro incavi, rompi le uova, copri e cuoci 6 minuti."],
  },
  {
    id: "quesadilla-fagioli", name: "Quesadilla di fagioli e spinaci", emoji: "🫓", hue: Y,
    meals: ["pranzo", "cena"], diets: ["vegetariana"], cuisine: "messicana", min: 15, difficulty: "facile", serves: 2,
    kcal: 470, cho: 52, pro: 22, fat: 18, fib: 11, sugar: 3,
    desc: "Croccante e filante, pronta in un quarto d'ora.",
    ing: [["Tortillas di frumento", 4, "pz"], ["Fagioli neri cotti", 200, "g"], ["Spinaci freschi", 80, "g"], ["Formaggio cheddar grattugiato", 80, "g"], ["Paprika e cumino", 1, "cucchiaino"]],
    steps: ["Schiaccia grossolanamente i fagioli con le spezie.", "Spalmali su due tortillas, aggiungi spinaci e formaggio e copri con le altre.", "Cuoci in padella 3 minuti per lato e taglia a spicchi."],
  },
  {
    id: "burrito-bowl", name: "Burrito bowl", emoji: "🌯", hue: R,
    meals: ["pranzo"], diets: ["vegana", "senzaglutine"], cuisine: "messicana", min: 25, difficulty: "facile", serves: 2, portable: true,
    kcal: 510, cho: 74, pro: 17, fat: 15, fib: 15, sugar: 6,
    desc: "Riso, fagioli neri, mais, avocado e salsa di pomodoro al lime.",
    ing: [["Riso basmati", 120, "g"], ["Fagioli neri cotti", 240, "g"], ["Mais", 100, "g"], ["Avocado", 1, "pz"], ["Pomodori", 150, "g"], ["Lime", 1, "pz"], ["Coriandolo", 0, "qb"]],
    steps: ["Cuoci il riso.", "Prepara la salsa con pomodori a cubetti, lime, sale e coriandolo.", "Componi le ciotole con riso, fagioli, mais, avocado e salsa."],
  },
  {
    id: "melanzane-parmigiana-light", name: "Parmigiana light", emoji: "🍆", hue: P,
    meals: ["pranzo", "cena"], diets: ["vegetariana", "senzaglutine"], cuisine: "italiana", min: 60, difficulty: "media", serves: 4, oven: true,
    kcal: 340, cho: 16, pro: 19, fat: 22, fib: 7, sugar: 10,
    desc: "Melanzane grigliate invece che fritte: tutto il gusto con meno grassi.",
    ing: [["Melanzane", 800, "g"], ["Passata di pomodoro", 500, "g"], ["Mozzarella", 250, "g"], ["Parmigiano grattugiato", 50, "g"], ["Basilico fresco", 10, "g"], ["Olio extravergine d'oliva", 1, "cucchiaio"]],
    steps: ["Preriscalda il forno a 190 °C.", "Taglia le melanzane a fette e grigliale.", "Alterna in teglia sugo, melanzane, mozzarella, parmigiano e basilico.", "Cuoci 30 minuti e lascia riposare 10 minuti prima di servire."],
  },
  {
    id: "frittata-forno-verdure", name: "Frittata al forno con verdure", emoji: "🥚", hue: G,
    meals: ["pranzo", "cena"], diets: ["vegetariana", "proteica", "lowcarb", "senzaglutine"], cuisine: "italiana", min: 30, difficulty: "facile", serves: 3, oven: true, portable: true,
    kcal: 250, cho: 6, pro: 18, fat: 17, fib: 2, sugar: 4,
    desc: "Si taglia a quadrotti e si porta in ufficio.",
    ing: [["Uova", 6, "pz"], ["Zucchine", 200, "g"], ["Peperone rosso", 1, "pz"], ["Parmigiano grattugiato", 30, "g"], ["Latte parzialmente scremato", 50, "ml"]],
    steps: ["Preriscalda il forno a 180 °C.", "Taglia le verdure a cubetti piccoli.", "Sbatti uova, latte, parmigiano e sale, unisci le verdure e versa in teglia.", "Cuoci 22 minuti."],
  },

  // ───────────── spuntini e dolci ─────────────
  {
    id: "energy-balls", name: "Energy balls datteri e cacao", emoji: "🟤", hue: T,
    meals: ["spuntino"], diets: ["vegana", "senzaglutine"], cuisine: "internazionale", min: 15, difficulty: "facile", serves: 6, portable: true,
    kcal: 150, cho: 18, pro: 4, fat: 7, fib: 3, sugar: 14,
    desc: "Nessuna cottura: si frulla e si formano le palline.",
    ing: [["Datteri denocciolati", 150, "g"], ["Mandorle", 80, "g"], ["Cacao amaro", 2, "cucchiaio"], ["Cocco rapè", 20, "g"]],
    steps: ["Frulla mandorle e datteri finché si compattano.", "Aggiungi il cacao e frulla ancora.", "Forma 12 palline e passale nel cocco. Si conservano 5 giorni in frigo."],
  },
  {
    id: "mele-cannella-forno", name: "Mele cotte alla cannella", emoji: "🍎", hue: R,
    meals: ["spuntino", "colazione"], diets: ["vegana", "senzaglutine"], cuisine: "italiana", min: 30, difficulty: "facile", serves: 2, oven: true,
    kcal: 140, cho: 30, pro: 1, fat: 3, fib: 5, sugar: 24,
    desc: "Dolce semplice della nonna, senza zucchero aggiunto.",
    ing: [["Mele", 2, "pz"], ["Cannella", 1, "cucchiaino"], ["Noci", 10, "g"], ["Succo di limone", 1, "cucchiaino"]],
    steps: ["Preriscalda il forno a 180 °C.", "Togli il torsolo alle mele, irrorale di limone e cospargile di cannella.", "Cuoci 25 minuti e completa con le noci."],
  },
  {
    id: "budino-chia", name: "Budino di chia al cocco", emoji: "🥥", hue: B,
    meals: ["colazione", "spuntino"], diets: ["vegana", "senzaglutine"], cuisine: "internazionale", min: 5, difficulty: "facile", serves: 1, portable: true,
    kcal: 240, cho: 20, pro: 6, fat: 15, fib: 10, sugar: 9,
    desc: "Da preparare la sera prima, con mango o frutti di bosco.",
    ing: [["Semi di chia", 25, "g"], ["Bevanda al cocco", 180, "ml"], ["Mango", 80, "g"], ["Sciroppo d'acero", 1, "cucchiaino"]],
    steps: ["Mescola semi di chia, bevanda e sciroppo.", "Dopo 5 minuti mescola ancora per evitare grumi e lascia in frigo almeno 4 ore.", "Servi con il mango a cubetti."],
  },
  {
    id: "toast-ricotta-pere", name: "Toast ricotta, pere e noci", emoji: "🍐", hue: Y,
    meals: ["colazione", "spuntino"], diets: ["vegetariana"], cuisine: "italiana", min: 5, difficulty: "facile", serves: 1,
    kcal: 300, cho: 38, pro: 13, fat: 11, fib: 6, sugar: 13,
    desc: "Dolce e croccante, ottimo anche a merenda.",
    ing: [["Pane integrale", 50, "g"], ["Ricotta", 60, "g"], ["Pera", 0.5, "pz"], ["Noci", 10, "g"], ["Miele", 1, "cucchiaino"]],
    steps: ["Tosta il pane.", "Spalma la ricotta e aggiungi la pera a fettine.", "Completa con noci e miele."],
  },
];

// ───────────── raccolte e filtri ─────────────

export const MEAL_LABEL: Record<MealKind, { label: string; emoji: string }> = {
  colazione: { label: "Colazione", emoji: "☕" },
  pranzo: { label: "Pranzo", emoji: "🥗" },
  cena: { label: "Cena", emoji: "🌙" },
  spuntino: { label: "Spuntino", emoji: "🍎" },
};

export const DIET_LABEL: Record<Diet, { label: string; emoji: string }> = {
  vegetariana: { label: "Vegetariana", emoji: "🧀" },
  vegana: { label: "Vegana", emoji: "🌱" },
  pescetariana: { label: "Pescetariana", emoji: "🐟" },
  proteica: { label: "Molte proteine", emoji: "🍳" },
  lowcarb: { label: "Low carb", emoji: "🥜" },
  senzaglutine: { label: "Senza glutine", emoji: "🌾" },
};

export const CUISINE_LABEL: Record<Cuisine, { label: string; emoji: string }> = {
  italiana: { label: "Italiana", emoji: "🇮🇹" },
  mediterranea: { label: "Mediterranea", emoji: "🫒" },
  asiatica: { label: "Sapori asiatici", emoji: "🥢" },
  messicana: { label: "Messicana", emoji: "🌮" },
  mediorientale: { label: "Medio Oriente", emoji: "🧆" },
  internazionale: { label: "Dal mondo", emoji: "🌍" },
};

export interface Collection {
  id: string;
  label: string;
  emoji: string;
  test: (r: Recipe) => boolean;
}

/** Raccolte trasversali, come "Preparazione rapida" o "Pochi ingredienti". */
export const COLLECTIONS: Collection[] = [
  { id: "veloci", label: "Preparazione rapida", emoji: "⏱️", test: (r) => r.min <= 15 },
  { id: "pochi", label: "Pochi ingredienti", emoji: "🧺", test: (r) => r.ing.filter((i) => i[2] !== "qb").length <= 5 },
  { id: "leggere", label: "Poche calorie", emoji: "🍏", test: (r) => r.kcal <= 300 },
  { id: "ingiro", label: "Da portare in giro", emoji: "🎒", test: (r) => !!r.portable },
  { id: "forno", label: "Al forno", emoji: "🔥", test: (r) => !!r.oven },
  { id: "facili", label: "Facili", emoji: "👌", test: (r) => r.difficulty === "facile" },
];

export const recipeById = (id: string) => RECIPES.find((r) => r.id === id);

/** Ricetta del giorno: cambia ogni giorno ma è la stessa per tutto il giorno. */
export function recipeOfTheDay(pool: Recipe[] = RECIPES, d = new Date()): Recipe {
  const seed = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
  return pool[seed % pool.length];
}

/** Pasto più adatto all'ora corrente. */
export function mealForNow(d = new Date()): MealKind {
  const h = d.getHours();
  if (h < 11) return "colazione";
  if (h < 15) return "pranzo";
  if (h < 18) return "spuntino";
  return "cena";
}

// ───────────── quantità ─────────────

const UNIT_LABEL: Record<Unit, [string, string]> = {
  g: ["g", "g"],
  ml: ["ml", "ml"],
  pz: ["", ""],
  cucchiaio: ["cucchiaio", "cucchiai"],
  cucchiaino: ["cucchiaino", "cucchiaini"],
  spicchio: ["spicchio", "spicchi"],
  qb: ["", ""],
};

function niceNumber(n: number, unit: Unit): string {
  if (unit === "g" || unit === "ml") {
    const r = n >= 100 ? Math.round(n / 5) * 5 : Math.round(n);
    return String(r);
  }
  // Mezzi e quarti si leggono meglio come frazioni.
  const whole = Math.floor(n);
  const frac = n - whole;
  const f = frac < 0.13 ? "" : frac < 0.38 ? "¼" : frac < 0.63 ? "½" : frac < 0.88 ? "¾" : "";
  const w = frac >= 0.88 ? whole + 1 : whole;
  if (w === 0 && f) return f;
  return `${w}${f ? " " + f : ""}`;
}

/** Quantità leggibile per un ingrediente scalato a `factor`. */
export function formatQty(ing: Ingredient, factor = 1): string {
  const [, qty, unit] = ing;
  if (unit === "qb" || qty === 0) return "q.b.";
  const n = qty * factor;
  const num = niceNumber(n, unit);
  const [one, many] = UNIT_LABEL[unit];
  if (!one) return num;
  if (unit === "g" || unit === "ml") return `${num} ${one}`;
  return `${num} ${n > 1 ? many : one}`;
}

// ───────────── reparti della spesa ─────────────

export const AISLES = [
  "Frutta e verdura",
  "Carne e pesce",
  "Latticini e uova",
  "Pane, pasta e cereali",
  "Legumi e conserve",
  "Condimenti e spezie",
  "Altro",
] as const;
export type Aisle = (typeof AISLES)[number];

const AISLE_RULES: [Aisle, RegExp][] = [
  ["Condimenti e spezie", /olio|aceto|sale|pepe|spezi|paprika|cumino|curry|cannella|noce moscata|origano|timo|rosmarino|soia|miele|sciroppo|tahina|lievito|cacao|capperi|sesamo/i],
  ["Carne e pesce", /pollo|tacchino|manzo|macinato|straccetti|salmone|tonno|orata|gamberi|pesce/i],
  ["Latticini e uova", /latte(?! di cocco)|yogurt|mozzarella|feta|ricotta|parmigiano|grana|formaggio|cheddar|fiocchi di latte|uov|albumi/i],
  ["Pane, pasta e cereali", /pane|pasta|spaghetti|penne|ditalini|riso|orzo|cous|quinoa|avena|granola|piadina|tortillas|pangrattato|farina/i],
  ["Legumi e conserve", /ceci|fagioli|lenticchie|edamame|pelati|passata|mais|olive|tonno al naturale|latte di cocco|brodo|datteri|cocco|alga|bevanda/i],
  ["Frutta e verdura", /zucchin|patat|pomodor|carot|spinac|rucola|insalata|cetriolo|cipoll|aglio|sedano|zucca|funghi|peperon|broccoli|melanzan|avocado|limone|lime|mela|pera|banana|mango|frutti|menta|basilico|prezzemolo|coriandolo|zenzero|mirtilli|piselli|noci|mandorle|semi di chia/i],
];

export function aisleOf(name: string): Aisle {
  for (const [aisle, re] of AISLE_RULES) if (re.test(name)) return aisle;
  return "Altro";
}
