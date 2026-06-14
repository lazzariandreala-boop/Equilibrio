// GET /api/withings/measures -> ultime misure della bilancia (peso, massa grassa, ecc.)
// Doc: https://developer.withings.com/api-reference/#tag/measure
//
// Tipi misura Withings: 1=peso(kg) 5=massa magra(kg) 6=% grasso 8=massa grassa(kg)
// 76=massa muscolare(kg) 77=idratazione(kg) 88=massa ossea(kg)
export default defineEventHandler(async (event) => {
  const token = await getWithingsToken(event);
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Withings non collegato." });
  }

  const form = new URLSearchParams({
    action: "getmeas",
    meastypes: "1,5,6,8,76,77,88",
    category: "1", // misurazioni reali (non obiettivi)
  });

  const res: any = await $fetch("https://wbsapi.withings.net/measure", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  }).catch(() => null);

  if (res?.status !== 0) {
    throw createError({ statusCode: 502, statusMessage: `Withings error ${res?.status ?? "?"}` });
  }

  const grps: any[] = (res.body?.measuregrps || []).slice().sort((a, b) => b.date - a.date);

  // Per ogni tipo prendiamo il valore più recente disponibile.
  const latest: Record<number, number> = {};
  for (const g of grps) {
    for (const m of g.measures || []) {
      if (latest[m.type] === undefined) latest[m.type] = m.value * Math.pow(10, m.unit);
    }
  }

  const round = (v: number | undefined) => (v === undefined ? null : Math.round(v * 10) / 10);

  return {
    measuredAt: grps[0]?.date ?? null, // epoch (secondi)
    weight: round(latest[1]), // kg
    leanMass: round(latest[5]), // kg
    fatRatio: round(latest[6]), // %
    fatMass: round(latest[8]), // kg
    muscleMass: round(latest[76]), // kg
    hydration: round(latest[77]), // kg
    boneMass: round(latest[88]), // kg
  };
});
