<template>
  <div class="rise rounded-4xl overflow-hidden"
    :style="{
      background: `linear-gradient(155deg, var(--${tone}-soft), var(--card) 80%)`,
      border: `1px solid var(--${tone}-soft)`,
      boxShadow: 'var(--tile-shadow)',
      padding: compact ? '12px' : '14px',
    }">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <div class="rounded-full flex items-center justify-center shrink-0"
            :style="{ width: compact ? '28px' : '32px', height: compact ? '28px' : '32px', background: `var(--${tone}-soft)` }">
            <component :is="icon" :size="compact ? 15 : 17" :color="`var(--${tone})`" />
          </div>
          <span class="text-dim truncate" style="font-size: 13.5px; font-weight: 600">{{ label }}</span>
        </div>

        <div class="display tabular flex items-baseline gap-1.5" style="margin-top: 8px">
          <span :style="{ color: `var(--${tone})`, fontSize: compact ? '26px' : '32px', fontWeight: 800, lineHeight: 1 }">
            {{ value }}
          </span>
          <span class="text-dim" style="font-size: 13px; font-weight: 600">{{ unit }}</span>
        </div>

        <div v-if="delta !== null" class="flex items-center gap-1.5" style="margin-top: 3px">
          <component :is="delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus" :size="14" :color="color" />
          <span class="tabular" :style="{ color, fontSize: '12.5px', fontWeight: 600 }">
            {{ delta > 0 ? "+" : "" }}{{ delta.toFixed(decimals) }} {{ unit }}
          </span>
        </div>
      </div>

      <div v-if="points.length > 1" style="width: 44%; min-width: 110px">
        <TrendChart :points="points" :tone="tone" :height="compact ? 54 : 68" :decimals="decimals" />
      </div>
    </div>

    <p v-if="note" class="text-faint" style="font-size: 12px; line-height: 1.45; margin-top: 10px">{{ note }}</p>
  </div>
</template>

<script setup lang="ts">
import { TrendingUp, TrendingDown, Minus } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    tone: "water" | "alcohol" | "move" | "food";
    icon: any;
    label: string;
    value: string;
    unit: string;
    delta?: number | null;
    better?: "lower" | "higher" | "neutral";
    points?: { t: number; v: number }[];
    note?: string;
    decimals?: number;
    compact?: boolean;
  }>(),
  { delta: null, better: "neutral", points: () => [], note: "", decimals: 1, compact: false },
);

/** Verde se il valore si muove nella direzione desiderata. */
const color = computed(() => {
  if (props.delta === null || props.delta === 0 || props.better === "neutral") return "var(--dim)";
  const good = props.better === "lower" ? props.delta < 0 : props.delta > 0;
  return good ? "var(--move)" : "var(--food)";
});
</script>
