import { adminDb } from "./firebaseAdmin";
import { verifySubscription } from "./play";
import { PRODUCTS, ALL_FEATURES, DAILY_AI_LIMIT, type Feature } from "./plans";

/**
 * Permessi dell'utente, ricavati dagli abbonamenti salvati sul server.
 *
 * Gli abbonamenti si trovano in entitlements/{uid}: le regole di Firestore
 * permettono all'utente di leggerli ma non di scriverli, così nessuno può
 * attivarsi un piano modificando i propri dati.
 */
interface Sub {
  productId: string;
  purchaseToken: string;
  active: boolean;
  expiresAt: number | null;
  checkedAt: number;
}

/** Ogni quante ore ricontrollare un abbonamento presso Google. */
const RECHECK_MS = 12 * 3600000;

/** Indirizzi con tutto sbloccato, per chi sviluppa e collauda. */
function isTester(email: string | null) {
  if (!email) return false;
  return (process.env.PREMIUM_TEST_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

export async function getEntitlements(uid: string, email: string | null) {
  if (isTester(email)) {
    return { features: [...ALL_FEATURES], subscriptions: [], tester: true };
  }

  const db = adminDb()!;
  const ref = db.collection("entitlements").doc(uid);
  const snap = await ref.get();
  const subs: Sub[] = (snap.data()?.subscriptions ?? []) as Sub[];

  // Rinnovi e disdette si scoprono richiedendo di nuovo lo stato a Google.
  let changed = false;
  for (const s of subs) {
    if (Date.now() - (s.checkedAt || 0) < RECHECK_MS) continue;
    try {
      const st = await verifySubscription(s.purchaseToken);
      s.active = st.active;
      s.expiresAt = st.expiresAt;
      s.checkedAt = Date.now();
      changed = true;
    } catch {
      // Google non raggiungibile: si tiene l'ultimo stato noto.
    }
  }
  if (changed) await ref.set({ subscriptions: subs }, { merge: true });

  const features = new Set<Feature>();
  for (const s of subs) {
    const valid = s.active && (!s.expiresAt || s.expiresAt > Date.now());
    if (valid) (PRODUCTS[s.productId] ?? []).forEach((f) => features.add(f));
  }

  return {
    features: [...features],
    subscriptions: subs.map((s) => ({ productId: s.productId, active: s.active, expiresAt: s.expiresAt })),
    tester: false,
  };
}

/** Registra un acquisto verificato, sostituendo un eventuale token precedente. */
export async function saveSubscription(uid: string, productId: string, purchaseToken: string) {
  const st = await verifySubscription(purchaseToken);
  const db = adminDb()!;
  const ref = db.collection("entitlements").doc(uid);
  const snap = await ref.get();
  const subs: Sub[] = ((snap.data()?.subscriptions ?? []) as Sub[]).filter(
    (s) => s.purchaseToken !== purchaseToken && s.productId !== productId,
  );
  subs.push({ productId, purchaseToken, active: st.active, expiresAt: st.expiresAt, checkedAt: Date.now() });
  await ref.set({ subscriptions: subs }, { merge: true });
  return st;
}

/**
 * Conta le richieste all'IA della giornata. Anche gli abbonati hanno un
 * tetto: protegge da usi automatizzati che farebbero esplodere i costi.
 */
export async function consumeAiQuota(uid: string) {
  const db = adminDb()!;
  const day = new Date().toISOString().slice(0, 10);
  const ref = db.collection("usage").doc(`${uid}_${day}`);

  // La transazione dice in modo esplicito se la richiesta è ammessa:
  // dedurlo dal contatore porterebbe a sbagliare proprio sul confine.
  const { allowed, used } = await db.runTransaction(async (tx) => {
    const n = ((await tx.get(ref)).data()?.ai as number) || 0;
    if (n >= DAILY_AI_LIMIT) return { allowed: false, used: n };
    tx.set(ref, { ai: n + 1, uid, day }, { merge: true });
    return { allowed: true, used: n + 1 };
  });

  if (!allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: `Hai raggiunto il limite di ${DAILY_AI_LIMIT} analisi per oggi. Domani si riparte.`,
    });
  }
  return DAILY_AI_LIMIT - used;
}
