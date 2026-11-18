import type { H3Event } from "h3";
import { adminApp } from "./firebaseAdmin";
import { requireUser } from "./requireUser";
import { getEntitlements, consumeAiQuota } from "./entitlements";

/**
 * Lascia passare una richiesta all'IA solo a chi ha un piano che la
 * comprende, entro il limite giornaliero.
 *
 * Finché il server non ha le credenziali il sistema degli abbonamenti non
 * è attivo e la richiesta passa: è il comportamento attuale, da chiudere
 * configurando FIREBASE_SERVICE_ACCOUNT prima della pubblicazione.
 */
export async function requireAi(event: H3Event) {
  if (!adminApp()) return;
  // Chi usa la propria chiave paga lui le richieste: non serve il piano.
  const body = await readBody<{ key?: unknown }>(event).catch(() => null);
  if (typeof body?.key === "string" && body.key.trim().length > 20) return;
  const user = await requireUser(event);
  const ent = await getEntitlements(user.uid, user.email);
  if (!ent.features.includes("ai")) {
    throw createError({ statusCode: 402, statusMessage: "Il riconoscimento con l'IA fa parte di Premium." });
  }
  await consumeAiQuota(user.uid);
}
