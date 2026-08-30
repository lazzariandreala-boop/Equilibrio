// GET /api/withings/status -> { connected, valid, reason }
//
// Non basta constatare che i cookie esistono: se l'access token è scaduto e il
// refresh non va a buon fine, l'interfaccia mostrerebbe "Collegato" mentre
// ogni lettura fallisce. Qui si prova davvero a ottenere un token valido.
export default defineEventHandler(async (event) => {
  const hasCookies = isWithingsConnected(event);
  if (!hasCookies) return { connected: false, valid: false, reason: "mai collegato" };

  const token = await getWithingsToken(event);
  if (!token) {
    return {
      connected: false,
      valid: false,
      reason: "sessione scaduta: serve ricollegare Withings",
    };
  }
  return { connected: true, valid: true, reason: "" };
});
