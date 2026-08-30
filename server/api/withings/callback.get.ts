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

  // Se il consenso è partito dall'app, quasi sempre si conclude nel browser di
  // sistema: i cookie appena creati restano lì e l'app non li vedrebbe mai.
  // Si torna quindi all'app con un collegamento diretto che porta i token,
  // così può registrarli nella propria sessione.
  if (fromApp === "1") {
    const deep = new URL("equilibrio://withings");
    deep.searchParams.set("a", token.access_token || "");
    deep.searchParams.set("r", token.refresh_token || "");
    deep.searchParams.set("e", String(Date.now() + Number(token.expires_in || 0) * 1000));
    return sendRedirect(event, deep.toString());
  }
  return sendRedirect(event, "/profilo?withings=ok");
});
