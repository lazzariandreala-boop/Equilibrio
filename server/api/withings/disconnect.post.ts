// POST /api/withings/disconnect -> rimuove i token salvati
export default defineEventHandler((event) => {
  clearWithingsTokens(event);
  return { ok: true };
});
