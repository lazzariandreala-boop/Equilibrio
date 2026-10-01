// GET /api/billing/status -> permessi dell'utente che chiama
//
// Se il server non ha ancora le credenziali, lo dice esplicitamente:
// l'app in quel caso non blocca nulla, perché il sistema non è attivo.
import { adminApp } from "../../utils/firebaseAdmin";
import { requireUser } from "../../utils/requireUser";
import { getEntitlements } from "../../utils/entitlements";

export default defineEventHandler(async (event) => {
  if (!adminApp()) return { configured: false, features: [], subscriptions: [], tester: false };
  const user = await requireUser(event);
  return { configured: true, ...(await getEntitlements(user.uid, user.email)) };
});
