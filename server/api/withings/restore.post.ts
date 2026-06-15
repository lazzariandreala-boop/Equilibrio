// POST /api/withings/restore { access_token, refresh_token, exp }
// Ripristina i cookie Withings su un dispositivo che non ha fatto l'OAuth ma ha i token
// salvati nel cloud (sincronizzazione tra device). Se l'access è scaduto verrà rinnovato
// automaticamente da getWithingsToken al primo uso, grazie al refresh_token.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ access_token?: string; refresh_token?: string; exp?: number }>(event);
  if (!body?.refresh_token && !body?.access_token) {
    throw createError({ statusCode: 400, statusMessage: "Token mancante." });
  }
  setWithingsTokens(event, {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    // ricostruisce expires_in dai ms di scadenza salvati (0 se assente -> forza un refresh al primo uso)
    expires_in: body.exp ? Math.max(0, Math.round((body.exp - Date.now()) / 1000)) : 0,
  });
  return { ok: true };
});
