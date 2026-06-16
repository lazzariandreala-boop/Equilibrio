export const todayKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fmtIT = (d: Date = new Date()) =>
  d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });

// Chiave "YYYY-MM-DD" -> Date locale (mezzanotte locale).
export const keyToDate = (key: string) => new Date(`${key}T00:00:00`);

// Etichetta compatta, es. "lun 16 giu".
export const fmtShort = (key: string) =>
  keyToDate(key).toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });

// Ultimi n giorni (più recente per primo), incluso oggi.
export const lastNDays = (n: number, from: Date = new Date()): string[] => {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    out.push(todayKey(d));
  }
  return out;
};

// Giorni del mese di `ref`, dal più recente al più vecchio. Se è il mese corrente si ferma a oggi.
export const monthDays = (ref: Date = new Date()): string[] => {
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const today = new Date();
  const isCurrent = year === today.getFullYear() && month === today.getMonth();
  const lastDay = isCurrent ? today.getDate() : new Date(year, month + 1, 0).getDate();
  const out: string[] = [];
  for (let d = lastDay; d >= 1; d--) out.push(todayKey(new Date(year, month, d)));
  return out;
};
