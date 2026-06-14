export interface RecognizedItem {
  name: string;
  qty: string;
  kcal: number;
  cho: number;
  pro: number;
  fat: number;
  alc: number;
}

export function useRecognition() {
  const base = useRuntimeConfig().public.apiBase || "";

  function fileToBase64(file: File): Promise<{ data: string; media: string }> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve({ data: String(r.result).split(",")[1], media: file.type || "image/jpeg" });
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function recognize(file: File): Promise<RecognizedItem[]> {
    const { data, media } = await fileToBase64(file);
    const res = await $fetch<{ alimenti: RecognizedItem[] }>(`${base}/api/recognize`, {
      method: "POST",
      body: { image: data, media },
    });
    return (res.alimenti || []).map((a) => ({
      name: a.name || "Alimento",
      qty: a.qty || "",
      kcal: +a.kcal || 0,
      cho: +a.cho || 0,
      pro: +a.pro || 0,
      fat: +a.fat || 0,
      alc: +a.alc || 0,
    }));
  }

  return { recognize };
}
