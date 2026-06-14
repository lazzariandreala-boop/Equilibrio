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

  function readDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  // Ridimensiona e ricomprime in JPEG (max ~1568px, la dimensione consigliata da
  // Anthropic) per stare sotto il limite di payload e velocizzare il caricamento.
  // Se il browser non riesce a decodificare l'immagine (es. HEIC), usa il file originale.
  async function fileToBase64(file: File): Promise<{ data: string; media: string }> {
    const dataUrl = await readDataUrl(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = dataUrl;
      });
      const maxDim = 1568;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no 2d context");
      ctx.drawImage(img, 0, 0, w, h);
      const out = canvas.toDataURL("image/jpeg", 0.8);
      return { data: out.split(",")[1], media: "image/jpeg" };
    } catch {
      // fallback: invia il file così com'è
      return { data: dataUrl.split(",")[1], media: file.type || "image/jpeg" };
    }
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
