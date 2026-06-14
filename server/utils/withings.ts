import type { H3Event } from "h3";

// Gestione token Withings lato server.
// I token stanno in cookie httpOnly (l'app è personale: niente DB richiesto).
// access_token dura ~3h, quindi teniamo anche refresh_token e scadenza per rinnovarlo.
const TOKEN_URL = "https://wbsapi.withings.net/v2/oauth2";

const cookieBase = () =>
  ({ httpOnly: true, sameSite: "lax", path: "/", secure: !import.meta.dev }) as const;

export function setWithingsTokens(event: H3Event, token: any) {
  setCookie(event, "withings_token", token.access_token, { ...cookieBase(), maxAge: 60 * 60 * 24 * 30 });
  if (token.refresh_token) {
    setCookie(event, "withings_refresh", token.refresh_token, { ...cookieBase(), maxAge: 60 * 60 * 24 * 365 });
  }
  const expMs = Date.now() + Number(token.expires_in || 0) * 1000;
  setCookie(event, "withings_exp", String(expMs), { ...cookieBase(), maxAge: 60 * 60 * 24 * 365 });
}

export function clearWithingsTokens(event: H3Event) {
  for (const n of ["withings_token", "withings_refresh", "withings_exp"]) deleteCookie(event, n, { path: "/" });
}

export function isWithingsConnected(event: H3Event) {
  return !!getCookie(event, "withings_token") || !!getCookie(event, "withings_refresh");
}

async function refreshToken(event: H3Event): Promise<string | null> {
  const cfg = useRuntimeConfig();
  const refresh = getCookie(event, "withings_refresh");
  if (!refresh || !cfg.withingsClientId || !cfg.withingsClientSecret) return null;

  const form = new URLSearchParams({
    action: "requesttoken",
    grant_type: "refresh_token",
    client_id: cfg.withingsClientId,
    client_secret: cfg.withingsClientSecret,
    refresh_token: refresh,
  });

  const res: any = await $fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  }).catch(() => null);

  if (res?.status !== 0 || !res.body?.access_token) return null;
  setWithingsTokens(event, res.body);
  return res.body.access_token as string;
}

// Ritorna un access_token valido (rinnovandolo se scaduto) oppure null.
export async function getWithingsToken(event: H3Event): Promise<string | null> {
  const token = getCookie(event, "withings_token");
  const exp = Number(getCookie(event, "withings_exp") || 0);
  // rinnova se manca o è prossimo alla scadenza (margine 60s)
  if (!token || (exp && Date.now() > exp - 60_000)) {
    return await refreshToken(event);
  }
  return token;
}
