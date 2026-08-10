/**
 * Dentro l'app nativa un Service Worker non serve e fa danni: cachea la shell
 * e impedisce il caricamento. Se ne trova uno registrato (per esempio da una
 * versione precedente dell'app) lo rimuove e svuota le cache.
 */
export default defineNuxtPlugin(async () => {
  const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
  if (!isNative || !("serviceWorker" in navigator)) return;

  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) await r.unregister();
    if (window.caches) {
      for (const key of await caches.keys()) await caches.delete(key);
    }
  } catch {
    // se fallisce non deve comunque bloccare l'avvio
  }
});
