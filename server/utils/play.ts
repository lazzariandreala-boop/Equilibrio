import { GoogleAuth } from "google-auth-library";
import { serviceAccount } from "./firebaseAdmin";

/**
 * Verifica di un abbonamento presso Google Play.
 *
 * Un acquisto dichiarato dall'app non basta: il telefono potrebbe essere
 * manomesso. Si chiede a Google lo stato reale del token, con il service
 * account autorizzato nel Play Console.
 */
export interface PlayStatus {
  active: boolean;
  expiresAt: number | null;
  state: string;
  autoRenewing: boolean;
}

const PACKAGE = () => process.env.PLAY_PACKAGE_NAME || "it.equilibrio.app";

let client: GoogleAuth | null = null;
function auth() {
  const sa = serviceAccount();
  if (!sa) return null;
  client ??= new GoogleAuth({
    credentials: { client_email: sa.client_email, private_key: sa.private_key },
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });
  return client;
}

export async function verifySubscription(purchaseToken: string): Promise<PlayStatus> {
  const a = auth();
  if (!a) throw createError({ statusCode: 503, statusMessage: "Verifica degli acquisti non configurata." });

  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE()}` +
    `/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;

  const res: any = await (await a.getClient()).request({ url }).then((r) => r.data).catch((e: any) => {
    const status = e?.response?.status;
    throw createError({
      statusCode: 502,
      statusMessage: status === 401 || status === 403
        ? "Il service account non è autorizzato nel Play Console."
        : "Google Play non ha confermato l'acquisto.",
    });
  });

  // Si considera la scadenza più lontana fra le voci dell'abbonamento.
  const expiries = (res.lineItems || [])
    .map((li: any) => Date.parse(li.expiryTime))
    .filter((t: number) => Number.isFinite(t));
  const expiresAt = expiries.length ? Math.max(...expiries) : null;

  // Attivo o nel periodo di tolleranza dopo un pagamento non riuscito: in
  // entrambi i casi l'utente mantiene l'accesso, come indica Google.
  const state = String(res.subscriptionState || "");
  const active =
    ["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"].includes(state) ||
    (state === "SUBSCRIPTION_STATE_CANCELED" && !!expiresAt && expiresAt > Date.now());

  return {
    active,
    expiresAt,
    state,
    autoRenewing: !!res.lineItems?.[0]?.autoRenewingPlan?.autoRenewEnabled,
  };
}
