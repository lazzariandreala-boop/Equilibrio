/**
 * L'app installata è servita da un'origine locale (capacitor://localhost o
 * https://localhost) e chiama queste API su un altro dominio. Senza intestazioni
 * CORS con credenziali, il browser blocca la risposta e i cookie dei token
 * Withings non vengono né inviati né accettati: l'utente risulta scollegato
 * a ogni ricarica.
 *
 * Con credentials l'origine va indicata esplicitamente: "*" non è ammesso.
 */
const ALLOWED = [
  "capacitor://localhost",
  "http://localhost",
  "https://localhost",
  "ionic://localhost",
];

export default defineEventHandler((event) => {
  const origin = getRequestHeader(event, "origin");
  if (!origin) return;

  const isLocalDev = /^https?:\/\/localhost(:\d+)?$/.test(origin);
  if (!ALLOWED.includes(origin) && !isLocalDev) return;

  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    Vary: "Origin",
  });

  // Richiesta preliminare: si risponde subito, senza toccare l'endpoint.
  if (event.method === "OPTIONS") {
    setResponseStatus(event, 204);
    return "";
  }
});
