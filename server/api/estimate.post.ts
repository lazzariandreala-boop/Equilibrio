// POST /api/estimate  { text: "pasta al pomodoro, mezzo piatto" }  ->  { alimenti: [...] }
// Stima dei valori nutrizionali a partire da una descrizione scritta:
// serve quando non c'è una foto, così l'utente non deve digitare i grammi a mano.
export default defineEventHandler(async (event) => {
  const { geminiApiKey } = useRuntimeConfig();
  const body = await readBody<{ text?: string }>(event);

  if (!geminiApiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: "Stima non configurata sul server (manca NUXT_GEMINI_API_KEY).",
    });
  }
  const text = (body?.text || "").trim();
  if (!text) {
    throw createError({ statusCode: 400, statusMessage: "Descrizione mancante." });
  }

  const prompt =
    "Sei un nutrizionista. L'utente descrive cosa ha mangiato o bevuto. " +
    "Scomponi la descrizione nei singoli alimenti e stima i valori per la porzione indicata " +
    "(se la quantità non è specificata, assumi una porzione media italiana). " +
    "Usa i valori della tabella di composizione degli alimenti CREA quando possibile. " +
    'Rispondi SOLO con JSON valido, nessun testo extra, nessun markdown. Formato: ' +
    '{"alimenti":[{"nome":"","qty":"es. 100 g","kcal":0,"cho":0,"pro":0,"fat":0,"fib":0,"alc":0}]}. ' +
    "cho=carboidrati g, pro=proteine g, fat=grassi g, fib=fibre g, alc=grammi di alcol (0 se analcolico). " +
    "Tutti i numeri interi.\n\nDescrizione: " +
    text;

  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

  let raw: any;
  try {
    raw = await $fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      },
    });
  } catch (e: any) {
    const apiMsg = e?.data?.error?.message || e?.response?._data?.error?.message;
    throw createError({
      statusCode: 502,
      statusMessage: apiMsg ? `Stima non disponibile: ${apiMsg}` : "Errore dal servizio di stima.",
    });
  }

  const out: string = (raw?.candidates?.[0]?.content?.parts || [])
    .map((p: any) => p?.text || "")
    .join("\n");

  try {
    const parsed = JSON.parse(out.replace(/```json|```/g, "").trim());
    const alimenti = (parsed.alimenti || []).map((a: any) => ({
      name: a.nome || a.name || "Alimento",
      qty: a.qty || "",
      kcal: Math.round(+a.kcal || 0),
      cho: Math.round(+a.cho || 0),
      pro: Math.round(+a.pro || 0),
      fat: Math.round(+a.fat || 0),
      fib: Math.round(+a.fib || 0),
      alc: Math.round(+a.alc || 0),
    }));
    return { alimenti };
  } catch {
    throw createError({ statusCode: 422, statusMessage: "Risposta non interpretabile." });
  }
});
