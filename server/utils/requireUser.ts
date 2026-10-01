import type { H3Event } from "h3";
import { adminAuth } from "./firebaseAdmin";

export interface RequestUser {
  uid: string;
  email: string | null;
}

/**
 * Identifica chi fa la richiesta dal token di accesso Firebase inviato
 * nell'intestazione Authorization. Il token è firmato da Google: non si può
 * falsificare, a differenza di un identificativo passato nel corpo.
 */
export async function requireUser(event: H3Event): Promise<RequestUser> {
  const auth = adminAuth();
  if (!auth) {
    throw createError({ statusCode: 503, statusMessage: "Abbonamenti non ancora configurati sul server." });
  }
  const header = getRequestHeader(event, "authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw createError({ statusCode: 401, statusMessage: "Accesso richiesto." });

  try {
    const decoded = await auth.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    throw createError({ statusCode: 401, statusMessage: "Sessione non valida: esci e accedi di nuovo." });
  }
}
