// POST /api/recognize  { image: base64, media: "image/jpeg" }  ->  { alimenti: [...] }
export default defineEventHandler(async (event) => {
  const { anthropicApiKey } = useRuntimeConfig();
  const body = await readBody<{ image?: string; media?: string }>(event);

  if (!anthropicApiKey) {
    throw createError({ statusCode: 503, statusMessage: "Riconoscimento non configurato (manca NUXT_ANTHROPIC_API_KEY)." });
  }
  if (!body?.image) {
    throw createError({ statusCode: 400, statusMessage: "Immagine mancante." });
  }

  const prompt =
    "Riconosci cibi e bevande nella foto. Stima per porzione visibile. " +
    'Rispondi SOLO con JSON valido, nessun testo extra, nessun markdown. Formato: ' +
    '{"alimenti":[{"nome":"","qty":"es. 1 piatto","kcal":0,"cho":0,"pro":0,"fat":0,"alc":0}]}. ' +
    "'alc' = grammi di alcol (0 se non alcolico). Tutti i numeri interi.";

  let raw: any;
  try {
    raw = await $fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: {
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: body.media || "image/jpeg", data: body.image } },
              { type: "text", text: prompt },
            ],
          },
        ],
      },
    });
  } catch (e: any) {
    // Propaga il messaggio reale di Anthropic (es. credito esaurito, immagine troppo grande)
    // così la UI può mostrarlo invece di un generico "non riconosce nulla".
    const apiMsg =
      e?.data?.error?.message || e?.response?._data?.error?.message || e?.data?.message;
    throw createError({
      statusCode: 502,
      statusMessage: apiMsg ? `Riconoscimento non disponibile: ${apiMsg}` : "Errore dal servizio di riconoscimento.",
    });
  }

  const text: string = (raw?.content || [])
    .filter((c: any) => c.type === "text")
    .map((c: any) => c.text)
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
