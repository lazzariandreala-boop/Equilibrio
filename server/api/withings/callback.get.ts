// GET /api/withings/callback?code=...&state=...
// Scambia il code con l'access token. Doc: https://developer.withings.com
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig();
  const query = getQuery(event);
  const code = query.code as string;
  const state = query.state as string;
  const saved = getCookie(event, "withings_state");

  if (!code || !state || state !== saved) {
    throw createError({ statusCode: 400, statusMessage: "Stato OAuth non valido." });
  }

  const form = new URLSearchParams({
    action: "requesttoken",
    grant_type: "authorization_code",
    client_id: cfg.withingsClientId,
    client_secret: cfg.withingsClientSecret,
    code,
    redirect_uri: cfg.public.withingsRedirectUri,
  });

  const res: any = await $fetch("https://wbsapi.withings.net/v2/oauth2", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (res?.status !== 0) {
    throw createError({ statusCode: 502, statusMessage: `Withings error ${res?.status}` });
  }

  const token = res.body; // { access_token, refresh_token, userid, expires_in, ... }
  // Salva access + refresh + scadenza (cookie httpOnly). Il refresh permette di
  // rinnovare l'access_token scaduto senza rifare il login.
  setWithingsTokens(event, token);
  return sendRedirect(event, "/profilo?withings=ok");
});
