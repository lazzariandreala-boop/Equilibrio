import { jsPDF } from "jspdf";
import { todayKey, keyToDate } from "~/utils/date";
import {
  classify, rangeStats, fmtGlucose, RANGE_LABEL, TREND_OPTIONS, type DiabetesParams, type GlucoseUnit,
} from "~/utils/diabetes";
import { pregnancyInfo, TRIMESTER_LABEL } from "~/utils/pregnancyDates";

/**
 * Rapporto in PDF dei dati di Equilibrio.
 *
 * Pensato per essere stampato o mostrato al medico: fondo bianco, colori
 * dell'app usati come accenti, tabelle leggibili e un avviso in fondo a
 * ogni pagina sul fatto che non sostituisce una valutazione clinica.
 */

export type ReportSection = "tutto" | "pasti" | "movimento" | "acqua" | "glicemia" | "ciclo" | "gravidanza";

export const SECTION_LABEL: Record<ReportSection, string> = {
  tutto: "Rapporto completo",
  pasti: "Alimentazione",
  movimento: "Movimento",
  acqua: "Acqua e alcol",
  glicemia: "Glicemia e insulina",
  ciclo: "Ciclo mestruale",
  gravidanza: "Gravidanza",
};

export interface ReportData {
  userName: string;
  days: Record<string, any>;
  goals: { water: number; moveMin: number; kcal: number };
  diabetes: DiabetesParams;
  readings: { at: number; value: number; tag: string; trend?: string; notes?: string }[];
  boluses: { at: number; units: number; kind: string; carbs?: number; glucose?: number }[];
  cycles: { start: string; end?: string; flow?: string; pain?: number; symptoms?: string[]; notes?: string }[];
  cycleAverage: number;
  pregnancy: { reference: string; appointments: { date: string; time?: string; title: string; place?: string; done?: boolean }[] };
  enabled: { diabetes: boolean; cycle: boolean; pregnant: boolean };
  logo?: string; // data URL
}

// ── Palette per la stampa: le tinte dell'app, scurite per il bianco ──
const C = {
  navy: [13, 15, 20] as const,
  ink: [26, 29, 38] as const,
  dim: [107, 114, 128] as const,
  faint: [156, 163, 175] as const,
  line: [229, 231, 235] as const,
  zebra: [248, 249, 251] as const,
  water: [30, 136, 200] as const,
  move: [31, 169, 104] as const,
  food: [226, 110, 34] as const,
  alcohol: [124, 77, 230] as const,
};
type RGB = readonly [number, number, number];
const TONE: Record<ReportSection, RGB> = {
  tutto: C.water, pasti: C.food, movimento: C.move, acqua: C.water,
  glicemia: C.water, ciclo: C.alcohol, gravidanza: C.alcohol,
};

const W = 210;
const MARGIN = 14;
const CONTENT = W - MARGIN * 2;
const BOTTOM = 297 - 22;

/** Tinta chiara di un colore, per gli sfondi dei riquadri. */
const tint = (c: RGB, k = 0.9): RGB => [
  Math.round(c[0] + (255 - c[0]) * k),
  Math.round(c[1] + (255 - c[1]) * k),
  Math.round(c[2] + (255 - c[2]) * k),
];

const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const fmtDay = (key: string) => {
  const d = keyToDate(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
const fmtTime = (at: number) => {
  const d = new Date(at);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const num = (n: number) => Math.round(n).toLocaleString("it-IT");

class Report {
  doc: jsPDF;
  y = 0;
  tone: RGB = C.water;

  constructor(private data: ReportData, private title: string, private period: string) {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
  }

  // ── intestazione e piè di pagina ──
  header() {
    const d = this.doc;
    d.setFillColor(...C.navy);
    d.rect(0, 0, W, 40, "F");

    // Le quattro tinte dell'app in una striscia: richiamano le quattro voci.
    const band = [C.water, C.move, C.food, C.alcohol];
    band.forEach((c, i) => {
      d.setFillColor(...c);
      d.rect((W / 4) * i, 40, W / 4, 2.2, "F");
    });

    if (this.data.logo) {
      try {
        d.addImage(this.data.logo, "PNG", MARGIN, 9, 22, 22);
      } catch {
        /* logo non disponibile: l'intestazione resta valida anche senza */
      }
    }

    const tx = this.data.logo ? MARGIN + 27 : MARGIN;
    d.setTextColor(255, 255, 255);
    d.setFont("helvetica", "bold");
    d.setFontSize(21);
    d.text("Equilibrio", tx, 19);
    d.setFont("helvetica", "normal");
    d.setFontSize(10.5);
    d.setTextColor(190, 198, 214);
    d.text(this.title, tx, 26);
    d.setFontSize(9);
    d.text(this.period, tx, 31.5);

    d.setFontSize(9);
    d.setTextColor(190, 198, 214);
    d.text(this.data.userName || "", W - MARGIN, 19, { align: "right" });
    d.text(`Generato il ${fmtDay(todayKey())}`, W - MARGIN, 25, { align: "right" });

    this.y = 54;
  }

  footers() {
    const d = this.doc;
    const pages = d.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      d.setPage(i);
      d.setDrawColor(...C.line);
      d.line(MARGIN, 297 - 16, W - MARGIN, 297 - 16);
      d.setFontSize(7.5);
      d.setTextColor(...C.faint);
      d.setFont("helvetica", "normal");
      d.text(
        "Dati registrati dall'utente. Il rapporto non sostituisce una valutazione medica.",
        MARGIN, 297 - 10,
      );
      d.text(`Pagina ${i} di ${pages}`, W - MARGIN, 297 - 10, { align: "right" });
    }
  }

  /** Nuova pagina se lo spazio richiesto non c'è. */
  ensure(h: number) {
    if (this.y + h <= BOTTOM) return;
    this.doc.addPage();
    this.y = 18;
  }

  // ── blocchi ──
  sectionTitle(text: string, tone: RGB) {
    this.tone = tone;
    if (this.y > 60) this.y += 4; // respiro fra una sezione e la precedente
    this.ensure(62);
    const d = this.doc;
    d.setFillColor(...tone);
    d.roundedRect(MARGIN, this.y - 5, 3, 9, 1.5, 1.5, "F");
    d.setFont("helvetica", "bold");
    d.setFontSize(15);
    d.setTextColor(...C.ink);
    d.text(text, MARGIN + 7, this.y + 2);
    this.y += 11;
  }

  /** Riquadri con i numeri principali, fino a quattro per riga. */
  kpis(list: { label: string; value: string; unit?: string }[]) {
    if (!list.length) return;
    const per = Math.min(4, list.length);
    const gap = 4;
    const w = (CONTENT - gap * (per - 1)) / per;
    const h = 22;

    for (let r = 0; r < list.length; r += per) {
      this.ensure(h + 4);
      list.slice(r, r + per).forEach((k, i) => {
        const x = MARGIN + i * (w + gap);
        const d = this.doc;
        d.setFillColor(...tint(this.tone, 0.9));
        d.roundedRect(x, this.y, w, h, 3, 3, "F");
        d.setFont("helvetica", "bold");
        d.setFontSize(15);
        d.setTextColor(...this.tone);
        d.text(k.value, x + 4, this.y + 10);
        if (k.unit) {
          const vw = d.getTextWidth(k.value);
          d.setFontSize(8.5);
          d.setTextColor(...C.dim);
          d.text(k.unit, x + 5 + vw, this.y + 10);
        }
        d.setFont("helvetica", "normal");
        d.setFontSize(8);
        d.setTextColor(...C.dim);
        d.text(k.label, x + 4, this.y + 17);
      });
      this.y += h + 4;
    }
    this.y += 2;
  }

  paragraph(text: string) {
    const d = this.doc;
    d.setFont("helvetica", "normal");
    d.setFontSize(9.5);
    d.setTextColor(...C.dim);
    const lines = d.splitTextToSize(text, CONTENT);
    this.ensure(lines.length * 4.6 + 3);
    d.text(lines, MARGIN, this.y);
    this.y += lines.length * 4.6 + 3;
  }

  /** Tabella con intestazione colorata, righe alternate e salto pagina. */
  table(cols: { label: string; width: number; align?: "left" | "right" }[], rows: string[][]) {
    const d = this.doc;
    const rowH = 7;
    const drawHead = () => {
      d.setFillColor(...tint(this.tone, 0.82));
      d.roundedRect(MARGIN, this.y, CONTENT, rowH, 1.5, 1.5, "F");
      d.setFont("helvetica", "bold");
      d.setFontSize(8.5);
      d.setTextColor(...C.ink);
      let x = MARGIN;
      cols.forEach((c) => {
        const w = (c.width / 100) * CONTENT;
        d.text(c.label, c.align === "right" ? x + w - 3 : x + 3, this.y + 4.8, { align: c.align === "right" ? "right" : "left" });
        x += w;
      });
      this.y += rowH;
    };

    if (!rows.length) {
      this.paragraph("Nessun dato nel periodo selezionato.");
      return;
    }

    this.ensure(rowH * 2 + 2);
    drawHead();

    rows.forEach((row, ri) => {
      // Il testo lungo va a capo invece di uscire dalla colonna.
      d.setFont("helvetica", "normal");
      d.setFontSize(8.5);
      const wrapped = row.map((cell, ci) => d.splitTextToSize(cell ?? "", (cols[ci].width / 100) * CONTENT - 6));
      const h = Math.max(rowH, Math.max(...wrapped.map((w) => w.length)) * 3.8 + 3);

      if (this.y + h > BOTTOM) {
        d.addPage();
        this.y = 18;
        drawHead();
        // L'intestazione lascia attivo il grassetto: senza questo la prima
        // riga dopo il salto pagina uscirebbe in neretto.
        d.setFont("helvetica", "normal");
        d.setFontSize(8.5);
      }

      if (ri % 2 === 1) {
        d.setFillColor(...C.zebra);
        d.rect(MARGIN, this.y, CONTENT, h, "F");
      }

      d.setTextColor(...C.ink);
      let x = MARGIN;
      wrapped.forEach((lines, ci) => {
        const w = (cols[ci].width / 100) * CONTENT;
        const right = cols[ci].align === "right";
        d.text(lines, right ? x + w - 3 : x + 3, this.y + 4.8, { align: right ? "right" : "left" });
        x += w;
      });
      this.y += h;
    });
    this.y += 6;
  }

  // ── sezioni ──
  dayKeys(periodDays: number) {
    const out: string[] = [];
    const d = new Date();
    for (let i = 0; i < periodDays; i++) {
      out.push(todayKey(d));
      d.setDate(d.getDate() - 1);
    }
    return out;
  }

  meals(keys: string[]) {
    this.sectionTitle("Alimentazione", C.food);
    const rows: string[][] = [];
    let kcal = 0, cho = 0, pro = 0, fat = 0, logged = 0;

    for (const k of keys) {
      const meals = this.data.days[k]?.meals ?? [];
      if (meals.length) logged++;
      for (const m of meals) {
        kcal += m.kcal || 0; cho += m.cho || 0; pro += m.pro || 0; fat += m.fat || 0;
        rows.push([fmtDay(k), m.name || "Pasto", num(m.kcal || 0), `${num(m.cho || 0)} / ${num(m.pro || 0)} / ${num(m.fat || 0)}`]);
      }
    }
    const n = logged || 1;
    this.kpis([
      { label: "media al giorno", value: num(kcal / n), unit: "kcal" },
      { label: "carboidrati al giorno", value: num(cho / n), unit: "g" },
      { label: "proteine al giorno", value: num(pro / n), unit: "g" },
      { label: "giorni registrati", value: String(logged) },
    ]);
    this.paragraph(`Obiettivo giornaliero impostato: ${num(this.data.goals.kcal)} kcal. Le medie considerano solo i giorni con almeno un pasto registrato.`);
    this.table(
      [{ label: "Data", width: 20 }, { label: "Pasto", width: 46 }, { label: "kcal", width: 12, align: "right" }, { label: "C / P / G (g)", width: 22, align: "right" }],
      rows,
    );
  }

  movement(keys: string[]) {
    this.sectionTitle("Movimento", C.move);
    const rows: string[][] = [];
    let total = 0, active = 0, sessions = 0;
    for (const k of keys) {
      const moves = this.data.days[k]?.moves ?? [];
      const dayMin = moves.reduce((a: number, m: any) => a + (m.min || 0), 0);
      if (dayMin > 0) active++;
      total += dayMin;
      for (const m of moves) {
        sessions++;
        rows.push([fmtDay(k), m.type || "Attività", `${num(m.min || 0)} min`, m.kcal ? `${num(m.kcal)} kcal` : "—"]);
      }
    }
    const goalDays = keys.filter((k) =>
      (this.data.days[k]?.moves ?? []).reduce((a: number, m: any) => a + (m.min || 0), 0) >= this.data.goals.moveMin,
    ).length;
    this.kpis([
      { label: "minuti totali", value: num(total), unit: "min" },
      { label: "media nei giorni attivi", value: num(active ? total / active : 0), unit: "min" },
      { label: "giorni sull'obiettivo", value: `${goalDays}/${keys.length}` },
      { label: "attività registrate", value: String(sessions) },
    ]);
    this.table(
      [{ label: "Data", width: 22 }, { label: "Attività", width: 42 }, { label: "Durata", width: 18, align: "right" }, { label: "Calorie", width: 18, align: "right" }],
      rows,
    );
  }

  water(keys: string[]) {
    this.sectionTitle("Acqua e alcol", C.water);
    const rows: string[][] = [];
    let water = 0, alc = 0, sober = 0, logged = 0, goalDays = 0;
    for (const k of keys) {
      const day = this.data.days[k];
      if (!day) continue;
      const w = day.water || 0;
      const a = (day.drinks ?? []).reduce((s: number, x: any) => s + (x.alc || 0), 0);
      if (w || (day.drinks ?? []).length || (day.meals ?? []).length) logged++;
      water += w; alc += a;
      if (a === 0) sober++;
      if (w >= this.data.goals.water) goalDays++;
      rows.push([fmtDay(k), `${num(w)} ml`, a > 0 ? `${num(a)} g` : "nessuno", (day.drinks ?? []).map((x: any) => x.name).join(", ") || "—"]);
    }
    const n = logged || 1;
    this.kpis([
      { label: "acqua media al giorno", value: num(water / n), unit: "ml" },
      { label: "giorni sull'obiettivo", value: `${goalDays}/${keys.length}` },
      { label: "alcol totale", value: num(alc), unit: "g" },
      { label: "giorni senza alcol", value: `${sober}/${logged || keys.length}` },
    ]);
    this.table(
      [{ label: "Data", width: 20 }, { label: "Acqua", width: 16, align: "right" }, { label: "Alcol", width: 14, align: "right" }, { label: "Bevande", width: 50 }],
      rows.reverse(),
    );
  }

  glucose(periodDays: number) {
    this.sectionTitle("Glicemia e insulina", C.water);
    const p = this.data.diabetes;
    const unit: GlucoseUnit = p.unit || "mg/dL";
    const from = Date.now() - periodDays * 86400000;
    const readings = this.data.readings.filter((r) => r.at >= from).sort((a, b) => b.at - a.at);
    const boluses = this.data.boluses.filter((b) => b.at >= from).sort((a, b) => b.at - a.at);
    const stats = rangeStats(readings.map((r) => r.value), p);

    this.kpis([
      { label: "nell'obiettivo", value: `${stats.inRange}%` },
      { label: "sotto / sopra", value: `${stats.below}% / ${stats.above}%` },
      { label: `media (${unit})`, value: stats.count ? fmtGlucose(stats.average, unit) : "—" },
      { label: "glicata stimata (GMI)", value: stats.gmi ? `${String(stats.gmi).replace(".", ",")}%` : "—" },
    ]);
    const totalUnits = boluses.reduce((a, b) => a + b.units, 0);
    this.paragraph(
      `Obiettivo ${fmtGlucose(p.targetMin, unit)}–${fmtGlucose(p.targetMax, unit)} ${unit}. ` +
      `FSI ${fmtGlucose(p.isf, unit)} ${unit} per unità, rapporto insulina/carboidrati 1:${p.icr}. ` +
      `${stats.count} misurazioni e ${boluses.length} boli (${num(totalUnits)} unità) nel periodo.` +
      (p.rapidInsulin ? ` Insulina rapida: ${p.rapidInsulin}.` : "") +
      (p.basalInsulin ? ` Basale: ${p.basalInsulin}.` : ""),
    );

    const trendLabel = (t?: string) => TREND_OPTIONS.find((o) => o.key === t)?.label ?? "";
    this.table(
      [{ label: "Data e ora", width: 22 }, { label: `Valore (${unit})`, width: 16, align: "right" }, { label: "Fascia", width: 20 }, { label: "Contesto", width: 20 }, { label: "Andamento", width: 22 }],
      readings.map((r) => [fmtTime(r.at), fmtGlucose(r.value, unit), RANGE_LABEL[classify(r.value, p)], r.tag, trendLabel(r.trend)]),
    );

    if (boluses.length) {
      this.sectionTitle("Boli registrati", C.move);
      this.table(
        [{ label: "Data e ora", width: 24 }, { label: "Unità", width: 14, align: "right" }, { label: "Tipo", width: 20 }, { label: "Carboidrati", width: 18, align: "right" }, { label: `Glicemia (${unit})`, width: 24, align: "right" }],
        boluses.map((b) => [
          fmtTime(b.at), String(b.units).replace(".", ","), b.kind,
          b.carbs ? `${num(b.carbs)} g` : "—", b.glucose ? fmtGlucose(b.glucose, unit) : "—",
        ]),
      );
    }
  }

  cycle() {
    this.sectionTitle("Ciclo mestruale", C.alcohol);
    const list = [...this.data.cycles].sort((a, b) => (a.start < b.start ? 1 : -1));
    const durations = list.filter((e) => e.end).map((e) =>
      Math.round((keyToDate(e.end!).getTime() - keyToDate(e.start).getTime()) / 86400000) + 1);
    const painful = list.filter((e) => (e.pain ?? 0) >= 2).length;

    this.kpis([
      { label: "cicli registrati", value: String(list.length) },
      { label: "durata media del ciclo", value: list.length >= 2 ? String(this.data.cycleAverage) : "—", unit: list.length >= 2 ? "giorni" : undefined },
      { label: "giorni di flusso medi", value: durations.length ? num(durations.reduce((a, b) => a + b, 0) / durations.length) : "—" },
      { label: "con dolore medio o forte", value: String(painful) },
    ]);
    const PAIN = ["nessuno", "lieve", "medio", "forte"];
    this.table(
      [{ label: "Inizio", width: 17 }, { label: "Fine", width: 17 }, { label: "Flusso", width: 13 }, { label: "Dolore", width: 11 }, { label: "Sintomi e note", width: 42 }],
      list.map((e) => [
        fmtDay(e.start), e.end ? fmtDay(e.end) : "in corso", e.flow ?? "—", PAIN[e.pain ?? 0] ?? "—",
        [...(e.symptoms ?? []), e.notes].filter(Boolean).join(" · ") || "—",
      ]),
    );
  }

  pregnancy() {
    this.sectionTitle("Gravidanza", C.alcohol);
    const ref = this.data.pregnancy.reference;
    if (ref) {
      const i = pregnancyInfo(ref);
      this.kpis([
        { label: "settimana attuale", value: `${i.weeks}+${i.dayOfWeek}` },
        { label: "trimestre", value: TRIMESTER_LABEL[i.trimester].replace(" trimestre", "") },
        { label: "data presunta del parto", value: fmtDay(i.dueDate) },
        { label: "giorni al termine", value: String(Math.max(0, i.daysToDue)) },
      ]);
      this.paragraph(`Età gestazionale calcolata dal primo giorno dell'ultima mestruazione (${fmtDay(ref)}).`);
    } else {
      this.paragraph("La data di inizio della gravidanza non è stata impostata.");
    }
    const appts = [...this.data.pregnancy.appointments].sort((a, b) => (a.date < b.date ? -1 : 1));
    this.table(
      [{ label: "Data", width: 17 }, { label: "Ora", width: 9 }, { label: "Visita", width: 36 }, { label: "Luogo", width: 22 }, { label: "Stato", width: 16 }],
      appts.map((a) => [fmtDay(a.date), a.time ?? "—", a.title, a.place ?? "—", a.done ? "fatta" : "in programma"]),
    );
  }
}

/** Crea il PDF della sezione richiesta sul periodo indicato, in giorni. */
export function buildReport(data: ReportData, section: ReportSection, periodDays: number): jsPDF {
  const period = `Ultimi ${periodDays} giorni, dal ${fmtDay(todayKey(new Date(Date.now() - (periodDays - 1) * 86400000)))} al ${fmtDay(todayKey())}`;
  const r = new Report(data, SECTION_LABEL[section], period);
  r.tone = TONE[section];
  r.header();

  const keys = r.dayKeys(periodDays);
  const all = section === "tutto";

  if (all || section === "pasti") r.meals(keys);
  if (all || section === "movimento") r.movement(keys);
  if (all || section === "acqua") r.water(keys);
  if ((all && data.enabled.diabetes) || section === "glicemia") r.glucose(periodDays);
  if ((all && data.enabled.cycle) || section === "ciclo") r.cycle();
  if ((all && data.enabled.pregnant) || section === "gravidanza") r.pregnancy();

  r.footers();
  return r.doc;
}
