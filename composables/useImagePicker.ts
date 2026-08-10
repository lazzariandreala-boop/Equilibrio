/**
 * Acquisizione di un'immagine, con scelta esplicita fra fotocamera e galleria.
 *
 * Nell'app installata usa il plugin nativo: la fotocamera si apre davvero,
 * invece di lasciare la scelta al comportamento variabile della WebView.
 * Nel browser ricade sull'input file: con `capture` per lo scatto immediato,
 * senza per la galleria.
 */
export type PickSource = "camera" | "gallery";

export interface PickedImage {
  data: string; // base64 senza prefisso
  media: string; // es. "image/jpeg"
}

export function useImagePicker() {
  const isNative = () => !!(globalThis as any).Capacitor?.isNativePlatform?.();

  async function pickNative(source: PickSource): Promise<PickedImage | null> {
    const mod: any = await import("@capacitor/camera").catch(() => null);
    if (!mod?.Camera) return null;

    const photo = await mod.Camera.getPhoto({
      source: source === "camera" ? mod.CameraSource.Camera : mod.CameraSource.Photos,
      resultType: mod.CameraResultType.Base64,
      quality: 80,
      width: 1568, // la dimensione utile al riconoscimento, il resto è peso inutile
      correctOrientation: true,
      allowEditing: false,
      promptLabelHeader: "Foto del pasto",
      promptLabelPhoto: "Dalla galleria",
      promptLabelPicture: "Scatta una foto",
      promptLabelCancel: "Annulla",
    });

    if (!photo?.base64String) return null;
    return { data: photo.base64String, media: `image/${photo.format || "jpeg"}` };
  }

  /** Nel browser: apre il selettore file, con o senza fotocamera diretta. */
  function pickWeb(source: PickSource): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      if (source === "camera") input.setAttribute("capture", "environment");
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  return { isNative, pickNative, pickWeb };
}
