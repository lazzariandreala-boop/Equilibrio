import { useSettingsStore } from "~/stores/settings";
import { toUnit, fromUnit, fmtGlucose, unitStep, type GlucoseUnit } from "~/utils/diabetes";

/** Unità della glicemia scelta dall'utente, con le conversioni pronte. */
export function useGlucoseUnit() {
  const settings = useSettingsStore();
  const unit = computed<GlucoseUnit>(() => settings.diabetes.unit || "mg/dL");

  return {
    unit,
    step: computed(() => unitStep(unit.value)),
    /** mg/dL → testo nell'unità scelta. */
    fmt: (mgdl: number) => fmtGlucose(mgdl, unit.value),
    /** mg/dL → numero nell'unità scelta. */
    show: (mgdl: number) => toUnit(mgdl, unit.value),
    /** Unità scelta → mg/dL. */
    store: (value: number) => fromUnit(value, unit.value),
  };
}
