// GET /api/withings/history?days=90 -> serie storiche delle misure corporee
// Doc: https://developer.withings.com/api-reference/#tag/measure
//
// Tipi misura: 1=peso(kg) 5=massa magra(kg) 6=%grasso 8=massa grassa(kg)
// 11=battito(bpm) 76=massa muscolare(kg) 77=idratazione(kg) 88=massa ossea(kg)
// 170=grasso viscerale (indice)
const TYPES: Record<string, number> = {
  weight: 1,
  leanMass: 5,
  fatRatio: 6,
  fatMass: 8,
  pulse: 11,
  muscleMass: 76,
  hydration: 77,
  boneMass: 88,
  visceralFat: 170,
};

export default defineEventHandler(async (event) => {
  const token = await getWithingsToken(event);
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Withings non collegato." });
  }

  const days = Math.min(365, Math.max(7, Number(getQuery(event).days) || 90));
  const startdate = Math.floor(Date.now() / 1000) - days * 86400;

  const form = new URLSearchParams({
    action: "getmeas",
    meastypes: Object.values(TYPES).join(","),
    category: "1", // misurazioni reali, non obiettivi
    startdate: String(startdate),
    enddate: String(Math.floor(Date.now() / 1000)),
  });

  const res: any = await $fetch("https://wbsapi.withings.net/measure", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  }).catch(() => null);

  if (res?.status !== 0) {
    throw createError({ statusCode: 502, statusMessage: `Withings error ${res?.status ?? "?"}` });
  }

  // Dal più vecchio al più recente: è l'ordine in cui va disegnato il grafico.
  const grps: any[] = (res.body?.measuregrps || []).slice().sort((a: any, b: any) => a.date - b.date);

  const series: Record<string, { t: number; v: number }[]> = {};
  for (const key of Object.keys(TYPES)) series[key] = [];

  for (const g of grps) {
    for (const m of g.measures || []) {
      const key = Object.keys(TYPES).find((k) => TYPES[k] === m.type);
      if (!key) continue;
      const value = m.value * Math.pow(10, m.unit);
      series[key].push({ t: g.date, v: Math.round(value * 10) / 10 });
    }
  }

  // Ultimo valore e variazione rispetto alla prima misura del periodo:
  // è il confronto che dice se si sta andando nella direzione voluta.
  const summary: Record<string, { last: number | null; first: number | null; delta: number | null }> = {};
  for (const [key, points] of Object.entries(series)) {
    const last = points.length ? points[points.length - 1].v : null;
    const first = points.length ? points[0].v : null;
    summary[key] = {
      last,
      first,
      delta: last !== null && first !== null ? Math.round((last - first) * 10) / 10 : null,
    };
  }

  return { days, measuredAt: grps.length ? grps[grps.length - 1].date : null, series, summary };
});
