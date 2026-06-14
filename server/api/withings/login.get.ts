// GET /api/withings/login -> redirect al consenso Withings
// Doc: verifica endpoint/scope correnti su https://developer.withings.com
export default defineEventHandler((event) => {
  const cfg = useRuntimeConfig();
  const clientId = cfg.withingsClientId;
  const redirectUri = cfg.public.withingsRedirectUri;

  if (!clientId || !redirectUri) {
    throw createError({ statusCode: 503, statusMessage: "Withings non configurato." });
  }

  const state = Math.random().toString(36).slice(2);
  // TODO: salvare lo state (cookie/sessione) e verificarlo nel callback (anti-CSRF)
  setCookie(event, "withings_state", state, { httpOnly: true, sameSite: "lax", path: "/" });

  const url = new URL("https://account.withings.com/oauth2_user/authorize2");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "user.metrics,user.activity");
  url.searchParams.set("state", state);

  return sendRedirect(event, url.toString());
});
