// GET /api/withings/token -> token correnti (per salvarli nel cloud e sincronizzarli tra device).
// Li riceve solo il device che ha fatto l'OAuth (ha il cookie). Poi il client li scrive
// nel proprio documento Firestore così seguono l'utente.
export default defineEventHandler((event) => {
  const access = getCookie(event, "withings_token");
  const refresh = getCookie(event, "withings_refresh");
  const exp = getCookie(event, "withings_exp");
  if (!access && !refresh) {
    throw createError({ statusCode: 404, statusMessage: "Withings non collegato." });
  }
  return {
    access_token: access || null,
    refresh_token: refresh || null,
    exp: exp ? Number(exp) : null,
  };
});
