// Helper lato client per Withings. Il grosso del flusso OAuth è server-side
// (server/api/withings/*). Qui solo l'avvio e un fetch misure d'esempio.
export function useWithings() {
  const base = useRuntimeConfig().public.apiBase || "";

  function connect() {
    window.location.href = `${base}/api/withings/login`;
  }

  // TODO: implementare l'endpoint /api/withings/measures che usa il token salvato
  async function fetchMeasures() {
    return $fetch(`${base}/api/withings/measures`).catch(() => null);
  }

  return { connect, fetchMeasures };
}
