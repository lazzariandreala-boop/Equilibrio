// POST /api/billing/verify { productId, purchaseToken } -> permessi aggiornati
//
// Chiamato dall'app subito dopo un acquisto: il server chiede conferma a
// Google Play e solo allora registra l'abbonamento.
import { requireUser } from "../../utils/requireUser";
import { saveSubscription, getEntitlements } from "../../utils/entitlements";
import { PRODUCTS } from "../../utils/plans";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody<{ productId?: string; purchaseToken?: string }>(event);

  if (!body?.productId || !PRODUCTS[body.productId]) {
    throw createError({ statusCode: 400, statusMessage: "Prodotto sconosciuto." });
  }
  if (!body.purchaseToken) {
    throw createError({ statusCode: 400, statusMessage: "Token di acquisto mancante." });
  }

  const status = await saveSubscription(user.uid, body.productId, body.purchaseToken);
  if (!status.active) {
    throw createError({ statusCode: 402, statusMessage: "Google Play non risulta un abbonamento attivo." });
  }
  return { configured: true, ...(await getEntitlements(user.uid, user.email)) };
});
