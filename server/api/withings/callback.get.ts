// GET /api/withings/callback?code=...&state=...
// Scambia il code con l'access token. Doc: https://developer.withings.com
import { signState } from "./login.get";

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig();
  const query = getQuery(event);
  const code = query.code as string;
  const state = String(query.state || "");

  // Verifica della firma: non serve alcun cookie, quindi il consenso può
  // avvenire anche in un browser diverso da quello che ha avviato il flusso.
  const parts = state.split(".");
  const signature = parts.pop();
  const payload = parts.join(".");
  const [ts, , fromApp] = parts;

  const valid =
    !!code &&
    !!signature &&
    parts.length === 3 &&
    signature === signState(payload, cfg.withingsClientSecret) &&
    Date.now() - Number(ts) < 15 * 60 * 1000; // il consenso vale 15 minuti

  if (!valid) {
    throw createError({
      statusCode: 400,
      statusMessage: !code
        ? "Autorizzazione annullata o negata su Withings."
        : "La richiesta è scaduta. Riprova a collegare Withings dal Profilo.",
    });
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

  // Dall'app installata l'interfaccia vive su un'origine locale: tornare a
  // "/profilo" mostrerebbe la copia sul sito invece dell'app.
  const back = fromApp === "1" ? "https://localhost/profilo?withings=ok" : "/profilo?withings=ok";
  return sendRedirect(event, back);
});
