<template>
  <NuxtLink :to="to" class="tap block rounded-4xl relative overflow-hidden h-full"
    :style="{
      background: `linear-gradient(160deg, var(--${tone}-soft), var(--card) 78%)`,
      border: `1px solid var(--${tone}-soft)`,
      boxShadow: 'var(--tile-shadow)',
    }">
    <div class="flex flex-col h-full" style="padding: 13px 13px 12px">
      <div class="flex items-start gap-2.5">
        <!-- pastiglia dell'icona: è ciò che rende riconoscibile la sezione -->
        <div class="rounded-full flex items-center justify-center shrink-0" :class="`grad-${tone}`"
          style="width: 42px; height: 42px;
                 box-shadow: inset 0 1.5px 0 rgba(255,255,255,.4), 0 5px 14px -3px rgba(0,0,0,.5)">
          <component :is="icon" :size="21" color="#fff" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-dim truncate" style="font-size: 13.5px">{{ label }}</div>
          <div class="display tabular flex items-baseline gap-1" style="margin-top: 1px">
            <span :style="{ color: `var(--${tone})`, fontSize: '25px', fontWeight: 800, lineHeight: 1.05 }">
              {{ value }}
            </span>
            <span class="text-dim" style="font-size: 12.5px; font-weight: 600">{{ unit }}</span>
          </div>
          <div class="text-faint tabular" style="font-size: 12px">{{ sub }}</div>
        </div>
      </div>

      <!-- avanzamento -->
      <template v-if="progress !== null">
        <div class="track" style="height: 7px; margin-top: 10px">
          <div class="fill" :style="{ width: `${clamped}%`, background: `var(--${tone})`, boxShadow: `0 0 8px var(--${tone}-glow)` }" />
        </div>
        <div v-if="!$slots.footer" class="tabular" :style="{ color: `var(--${tone})`, fontSize: '12px', fontWeight: 600, marginTop: '6px' }">
          {{ Math.round(clamped) }}% dell'obiettivo
        </div>
      </template>

      <div :class="progress !== null ? 'mt-1.5' : 'mt-auto pt-2'">
        <slot name="footer" />
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to: string;
    icon: any;
    tone: "water" | "alcohol" | "move" | "food";
    label: string;
    value: number | string;
    unit: string;
    sub?: string;
    progress?: number | null;
  }>(),
  { sub: "", progress: null },
);
const clamped = computed(() => Math.min(100, Math.max(0, props.progress ?? 0)));
</script>
