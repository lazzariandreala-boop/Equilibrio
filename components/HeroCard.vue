<template>
  <div class="rise rounded-5xl overflow-hidden relative" :class="`grad-${tone}`"
    :style="{ boxShadow: `0 0 0 1px ${rgba(0.35)}, 0 14px 38px var(--${tone}-glow)` }">
    <!-- filigrana decorativa: dà profondità senza rubare leggibilità -->
    <svg class="absolute pointer-events-none" viewBox="0 0 200 200" aria-hidden="true"
      style="width: 210px; height: 210px; right: -34px; top: -18px; opacity: 0.16">
      <g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round">
        <path d="M150 30c-30 8-52 30-60 60M150 30c8 30-2 60-24 78M150 30c-24-6-48 4-62 26" />
        <ellipse cx="118" cy="66" rx="17" ry="9" transform="rotate(-35 118 66)" />
        <ellipse cx="146" cy="96" rx="17" ry="9" transform="rotate(20 146 96)" />
        <ellipse cx="96" cy="104" rx="16" ry="8" transform="rotate(-10 96 104)" />
      </g>
    </svg>
    <div class="absolute rounded-full pointer-events-none"
      :style="{ width: '190px', height: '190px', left: '-70px', bottom: '-96px', background: rgba(0.13) }" />

    <div class="relative" style="padding: 18px 18px 16px">
      <!-- intestazione -->
      <div class="flex items-center gap-2">
        <component :is="icon" :size="18" color="#fff" />
        <span style="color: #fff; font-size: 14.5px; font-weight: 700">{{ title }}</span>
      </div>

      <!-- valore dominante -->
      <div class="text-center" style="margin-top: 14px">
        <div class="display tabular flex items-baseline justify-center gap-1.5">
          <span style="color: #fff; font-size: 58px; font-weight: 800; line-height: 1">{{ value }}</span>
          <span style="color: #fff; font-size: 20px; font-weight: 700; opacity: 0.92">{{ unit }}</span>
        </div>
        <div v-if="caption" style="color: rgba(255,255,255,.8); font-size: 13.5px; margin-top: 4px">{{ caption }}</div>
      </div>

      <!-- avanzamento con badge della percentuale -->
      <div v-if="progress !== null" class="relative flex items-center" style="margin-top: 16px; height: 22px">
        <div class="w-full rounded-full overflow-hidden" :style="{ height: '9px', background: rgba(0.3) }">
          <div class="fill" style="background: #fff" :style="{ width: `${clamped}%` }" />
        </div>
        <span class="absolute tabular flex items-center justify-center rounded-full"
          :style="{
            left: `max(0px, min(calc(100% - 46px), calc(${clamped}% - 23px)))`,
            width: '46px', height: '22px',
            background: 'rgba(12,8,4,.82)', color: '#fff',
            fontSize: '11.5px', fontWeight: 700,
          }">
          {{ Math.round(clamped) }}%
        </span>
      </div>

      <!-- statistiche secondarie -->
      <div v-if="stats?.length" class="flex" style="margin-top: 16px">
        <div v-for="(s, i) in stats" :key="s.label" class="flex-1 flex items-center gap-2"
          :style="i < stats.length - 1 ? { borderRight: `1px solid ${rgba(0.22)}` } : {}">
          <div v-if="s.icon" class="rounded-full flex items-center justify-center shrink-0"
            :style="{ width: '30px', height: '30px', background: rgba(0.2), marginLeft: i ? '8px' : '0' }">
            <component :is="s.icon" :size="15" color="#fff" />
          </div>
          <div class="min-w-0">
            <div class="display tabular" style="color: #fff; font-size: 16px; font-weight: 700; line-height: 1.1">
              {{ s.value }}<span v-if="s.unit" style="font-size: 11px; font-weight: 600"> {{ s.unit }}</span>
            </div>
            <div class="truncate" style="color: rgba(255,255,255,.76); font-size: 10.5px">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tone: "water" | "alcohol" | "move" | "food";
    icon: any;
    title: string;
    value: number | string;
    unit?: string;
    caption?: string;
    progress?: number | null;
    stats?: { icon?: any; value: number | string; unit?: string; label: string }[];
  }>(),
  { unit: "", caption: "", progress: null, stats: () => [] },
);

const rgba = (a: number) => `rgba(255, 255, 255, ${a})`;
const clamped = computed(() => Math.min(100, Math.max(0, props.progress ?? 0)));
</script>
