<template>
  <NuxtLink to="/ciclo" class="tap block rounded-4xl relative overflow-hidden h-full"
    :class="`grad-${tone}`" :style="{ boxShadow: `0 10px 24px -8px var(--${tone}-glow)` }">
    <div class="absolute rounded-full pointer-events-none"
      style="width: 110px; height: 110px; right: -40px; top: -40px; background: rgba(255,255,255,.16)" />

    <div class="relative flex flex-col h-full" style="padding: 13px">
      <div class="flex items-center justify-between">
        <div class="rounded-full flex items-center justify-center" style="width: 28px; height: 28px; background: rgba(255,255,255,.22)">
          <component :is="icon" :size="15" color="#fff" />
        </div>
        <ArrowUpRight :size="15" color="rgba(255,255,255,.75)" />
      </div>

      <div class="mt-auto" style="padding-top: 12px">
        <div class="display" style="color: #fff; font-size: 26px; font-weight: 800; line-height: 1.08">
          {{ headline }}
        </div>
        <div style="color: rgba(255,255,255,.85); font-size: 12.5px; margin-top: 2px; line-height: 1.3">
          {{ label }}
        </div>
      </div>

      <div v-if="predicted" style="color: rgba(255,255,255,.72); font-size: 11px; margin-top: 8px">
        previsto {{ predicted }}
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { ArrowUpRight, Baby, Droplet, Clock, AlertTriangle, CheckCircle2, CalendarHeart } from "lucide-vue-next";
import { useCycleStore } from "~/stores/cycle";
import { useSettingsStore } from "~/stores/settings";
import { keyToDate } from "~/utils/date";

const cycle = useCycleStore();
const settings = useSettingsStore();

const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

const view = computed(() => {
  if (settings.profile.pregnant) {
    return { tone: "alcohol", icon: Baby, headline: "In dolce attesa", label: "previsioni sospese", predicted: "" };
  }
  const s = cycle.status;
  const pred = s.predicted ? `${keyToDate(s.predicted).getDate()} ${MONTHS[keyToDate(s.predicted).getMonth()]}` : "";

  if (s.kind === "nessun-dato")
    return { tone: "alcohol", icon: CalendarHeart, headline: "Inizia", label: "registra il primo ciclo", predicted: "" };
  if (s.kind === "in-corso")
    return { tone: "alcohol", icon: Droplet, headline: `Giorno ${s.days}`, label: "ciclo in corso", predicted: "" };
  if (s.kind === "in-ritardo")
    return { tone: "food", icon: AlertTriangle, headline: `+${s.days}`, label: s.days === 1 ? "giorno di ritardo" : "giorni di ritardo", predicted: pred };
  if (s.kind === "in-arrivo")
    return {
      tone: "alcohol", icon: Clock,
      headline: s.days === 0 ? "Oggi" : `${s.days} gg`,
      label: s.days === 0 ? "previsto oggi" : "all'arrivo previsto", predicted: pred,
    };
  return { tone: "move", icon: CheckCircle2, headline: `${s.days} gg`, label: "al prossimo ciclo", predicted: pred };
});

const tone = computed(() => view.value.tone);
const icon = computed(() => view.value.icon);
const headline = computed(() => view.value.headline);
const label = computed(() => view.value.label);
const predicted = computed(() => view.value.predicted);
</script>
