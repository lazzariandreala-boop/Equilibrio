// Helper lato client per Withings. Il grosso del flusso OAuth è server-side
// (server/api/withings/*). Qui solo gli avvii e i fetch verso quegli endpoint.
export interface WithingsMeasures {
  measuredAt: number | null;
  weight: number | null;
  leanMass: number | null;
  fatRatio: number | null;
  fatMass: number | null;
  muscleMass: number | null;
  hydration: number | null;
  boneMass: number | null;
}

export function useWithings() {
  const base = useRuntimeConfig().public.apiBase || "";

  function connect() {
    window.location.href = `${base}/api/withings/login`;
  }

  async function status(): Promise<{ connected: boolean }> {
    return $fetch(`${base}/api/withings/status`).catch(() => ({ connected: false }));
  }

  async function fetchMeasures(): Promise<WithingsMeasures | null> {
    return $fetch<WithingsMeasures>(`${base}/api/withings/measures`).catch(() => null);
  }

  async function disconnect(): Promise<void> {
    await $fetch(`${base}/api/withings/disconnect`, { method: "POST" }).catch(() => null);
  }

  return { connect, status, fetchMeasures, disconnect };
}
