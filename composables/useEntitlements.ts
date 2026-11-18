import type { Feature, Plan } from "~/utils/plans";
import { PLANS } from "~/utils/plans";

interface Status {
  configured: boolean;
  features: Feature[];
  subscriptions: { productId: string; expiry?: number }[];
  tester: boolean;
}

const CACHE = "equilibrio:entitlements";
const PENDING = "equilibrio:pending-purchases";

function readCache(): Status {
  // Senza risposta dal server il sistema si considera non attivo: non si blocca nulla.
  const empty: Status = { configured: false, features: [], subscriptions: [], tester: false };
  if (!import.meta.client) return empty;
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(CACHE) || "null") };
  } catch {
    return empty;
  }
}

// Stato a livello di modulo e non useState: con le pagine pregenerate,
// useState verrebbe sovrascritto dal valore del server (tutto spento) al
// momento dell'idratazione, ignorando la copia salvata sul dispositivo.
const status = ref<Status>(readCache());
const prices = ref<Record<string, string>>({});
const busy = ref(false);
let cacheRead = import.meta.client;

/**
 * Abbonamenti dell'utente. Lo stato viene dal server, che lo verifica con
 * Google Play; qui c'è solo una copia per lavorare anche offline.
 */
export function useEntitlements() {
  if (import.meta.client && !cacheRead) {
    cacheRead = true;
    status.value = readCache();
  }
  const base = useRuntimeConfig().public.apiBase || "";

  /** Vero se la funzione è compresa in un piano attivo, o se gli abbonamenti non sono attivi. */
  const has = (f: Feature) => !status.value.configured || status.value.features.includes(f);
  const active = computed(() => status.value.configured);

  async function authHeader(): Promise<Record<string, string>> {
    const { $firebase } = useNuxtApp() as any;
    const token = await $firebase?.auth?.currentUser?.getIdToken?.().catch(() => null);
    return token ? { authorization: `Bearer ${token}` } : {};
  }

  function save(s: Status) {
    status.value = s;
    try {
      localStorage.setItem(CACHE, JSON.stringify(s));
    } catch {
      /* spazio esaurito: resta in memoria */
    }
  }

  async function refresh() {
    try {
      const headers = await authHeader();
      const s = await $fetch<Status>(`${base}/api/billing/status`, { headers });
      save(s);
      await retryPending();
    } catch {
      /* offline o non autenticato: si tiene l'ultimo stato noto */
    }
  }

  async function isNative() {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  }

  async function loadPrices() {
    if (!(await isNative())) return;
    try {
      const { NativePurchases, PURCHASE_TYPE } = await import("@capgo/native-purchases");
      const { products } = await NativePurchases.getProducts({
        productIdentifiers: PLANS.map((p) => p.productId),
        productType: PURCHASE_TYPE.SUBS,
      });
      const map: Record<string, string> = {};
      for (const p of products) map[p.identifier] = p.priceString;
      prices.value = map;
    } catch {
      /* si usano i prezzi di riserva */
    }
  }

  const priceOf = (plan: Plan) => prices.value[plan.productId] || plan.fallbackPrice;

  function pending(): { productId: string; token: string }[] {
    try {
      return JSON.parse(localStorage.getItem(PENDING) || "[]");
    } catch {
      return [];
    }
  }
  function setPending(list: { productId: string; token: string }[]) {
    localStorage.setItem(PENDING, JSON.stringify(list));
  }

  async function verify(productId: string, token: string) {
    const headers = await authHeader();
    const s = await $fetch<Status>(`${base}/api/billing/verify`, {
      method: "POST",
      headers,
      body: { productId, purchaseToken: token },
    });
    save(s);
  }

  /** Acquisti pagati ma non ancora confermati dal server (es. connessione caduta). */
  async function retryPending() {
    const list = pending();
    if (!list.length) return;
    const left = [];
    for (const p of list) {
      try {
        await verify(p.productId, p.token);
      } catch {
        left.push(p);
      }
    }
    setPending(left);
  }

  /** Avvia l'acquisto su Google Play. Restituisce un messaggio per l'utente. */
  async function purchase(plan: Plan): Promise<{ ok: boolean; message: string }> {
    if (!(await isNative())) {
      return { ok: false, message: "Gli abbonamenti si attivano dall'app Android scaricata da Google Play." };
    }
    busy.value = true;
    try {
      const { NativePurchases, PURCHASE_TYPE } = await import("@capgo/native-purchases");
      const tx = await NativePurchases.purchaseProduct({
        productIdentifier: plan.productId,
        planIdentifier: plan.basePlanId,
        productType: PURCHASE_TYPE.SUBS,
      });
      // Su Android transactionId è il purchaseToken di Google Play.
      const token = tx.transactionId;
      setPending([...pending(), { productId: plan.productId, token }]);
      try {
        await verify(plan.productId, token);
        setPending(pending().filter((p) => p.token !== token));
        return { ok: true, message: `${plan.name} attivo. Grazie!` };
      } catch {
        return { ok: true, message: "Pagamento ricevuto: lo confermiamo appena c'è connessione." };
      }
    } catch (e: any) {
      const msg = String(e?.message || e || "");
      if (/cancel/i.test(msg)) return { ok: false, message: "Acquisto annullato." };
      return { ok: false, message: "Google Play non ha completato l'acquisto. Riprova tra poco." };
    } finally {
      busy.value = false;
    }
  }

  /** Gli abbonamenti sono legati all'account: ripristinare vuol dire rileggerli dal server. */
  async function restore() {
    await refresh();
    return status.value.features.length
      ? "Abbonamenti ripristinati."
      : "Nessun abbonamento attivo per questo account. Hai usato lo stesso account Google dell'acquisto?";
  }

  return { status, has, active, busy, refresh, restore, purchase, loadPrices, priceOf, authHeader };
}
