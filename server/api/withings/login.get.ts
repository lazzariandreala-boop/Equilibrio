// GET /api/withings/login[?app=1] -> redirect al consenso Withings
//
// Lo state è firmato, non salvato in un cookie: il consenso può avvenire in un
// browser diverso da quello che ha avviato il flusso (succede con l'app
// installata), e in quel caso il cookie non arriverebbe mai al callback.
import { createHmac } from "node:crypto";

export function signState(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url").slice(0, 24);
}

export default defineEventHandler((event) => {
  const cfg = useRuntimeConfig();
  const clientId = cfg.withingsClientId;
  const redirectUri = cfg.public.withingsRedirectUri;

  if (!clientId || !redirectUri || !cfg.withingsClientSecret) {
    throw createError({ statusCode: 503, statusMessage: "Withings non configurato." });
  }

  // ts serve a far scadere il flusso; app indica dove tornare alla fine.
  const fromApp = String(getQuery(event).app || "") === "1" ? "1" : "0";
  const payload = `${Date.now()}.${Math.random().toString(36).slice(2, 10)}.${fromApp}`;
  const state = `${payload}.${signState(payload, cfg.withingsClientSecret)}`;

  const url = new URL("https://account.withings.com/oauth2_user/authorize2");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "user.metrics,user.activity");
  url.searchParams.set("state", state);

  return sendRedirect(event, url.toString());
});
