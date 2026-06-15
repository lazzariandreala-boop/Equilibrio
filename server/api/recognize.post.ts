// POST /api/recognize  { image: base64, media: "image/jpeg" }  ->  { alimenti: [...] }
// Riconoscimento foto del cibo con Google Gemini (tier gratuito).
export default defineEventHandler(async (event) => {
  const { geminiApiKey } = useRuntimeConfig();
  const body = await readBody<{ image?: string; media?: string }>(event);

  if (!geminiApiKey) {
    throw createError({ statusCode: 503, statusMessage: "Riconoscimento non configurato (manca NUXT_GEMINI_API_KEY)." });
  }
  if (!body?.image) {
    throw createError({ statusCode: 400, statusMessage: "Immagine mancante." });
  }

  const prompt =
    "Riconosci cibi e bevande nella foto. Stima per porzione visibile. " +
    'Rispondi SOLO con JSON valido, nessun testo extra, nessun markdown. Formato: ' +
    '{"alimenti":[{"nome":"","qty":"es. 1 piatto","kcal":0,"cho":0,"pro":0,"fat":0,"alc":0}]}. ' +
    "'alc' = grammi di alcol (0 se non alcolico). Tutti i numeri interi.";

  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

  let raw: any;
  try {
    raw = await $fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: {
        contents: [
          {
            parts: [
              { inline_data: { mime_type: body.media || "image/jpeg", data: body.image } },
              { text: prompt },
            ],
          },
        ],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      },
    });
  } catch (e: any) {
    // Propaga il messaggio reale di Gemini (es. quota, chiave non valida) così la UI può mostrarlo.
    const apiMsg = e?.data?.error?.message || e?.response?._data?.error?.message;
    throw createError({
      statusCode: 502,
      statusMessage: apiMsg ? `Riconoscimento non disponibile: ${apiMsg}` : "Errore dal servizio di riconoscimento.",
    });
  }

  const text: string = (raw?.candidates?.[0]?.content?.parts || [])
    .map((p: any) => p?.text || "")
    .join("\n");

  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    const alimenti = (parsed.alimenti || []).map((a: any) => ({
      name: a.nome || a.name || "Alimento",
      qty: a.qty || "",
      kcal: Math.round(+a.kcal || 0),
      cho: Math.round(+a.cho || 0),
      pro: Math.round(+a.pro || 0),
      fat: Math.round(+a.fat || 0),
      alc: Math.round(+a.alc || 0),
    }));
    return { alimenti };
  } catch {
    throw createError({ statusCode: 422, statusMessage: "Risposta non interpretabile." });
  }
});
