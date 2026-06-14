// GET /api/withings/status -> { connected: boolean }
// Usato dalla UI per mostrare "Collegato" invece di "Collega".
export default defineEventHandler((event) => {
  return { connected: isWithingsConnected(event) };
});
