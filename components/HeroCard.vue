<template>
  <div class="rise rounded-5xl overflow-hidden relative" :class="`grad-${tone}`"
    :style="{
      boxShadow: `0 18px 40px -8px var(--${tone}-glow), 0 2px 8px rgba(0,0,0,.28)`,
    }">
    <!-- Profondità: luce dall'alto a sinistra, ombra in basso a destra.
         È ciò che dà il senso di volume al blocco colorato. -->
    <div class="absolute inset-0 pointer-events-none"
      style="background: linear-gradient(150deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,.06) 38%, rgba(0,0,0,.10) 72%, rgba(0,0,0,.20) 100%)" />
    <!-- riflesso curvo -->
    <div class="absolute pointer-events-none"
      style="left: -30%; top: -55%; width: 160%; height: 120%; border-radius: 50%;
             background: radial-gradient(closest-side, rgba(255,255,255,.20), transparent 70%)" />
    <!-- bordo luminoso superiore -->
    <div class="absolute pointer-events-none"
      style="inset: 0; border-radius: 34px; box-shadow: inset 0 1.5px 0 rgba(255,255,255,.45), inset 0 -1px 0 rgba(0,0,0,.12)" />

    <!-- filigrana botanica -->
    <svg class="absolute pointer-events-none" viewBox="0 0 120 120" aria-hidden="true"
      style="width: 150px; height: 150px; right: 6px; top: 2px; opacity: 0.22">
      <g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M92 12C74 34 64 60 60 92" />
        <path d="M84 26c-12 2-20 9-24 20 12 2 21-6 24-20Z" />
        <path d="M96 30c-13-1-23 4-29 15 11 5 22 0 29-15Z" />
        <path d="M77 50c-12 2-20 9-23 20 12 2 20-6 23-20Z" />
        <path d="M95 55c-13-1-22 4-28 15 11 5 21 0 28-15Z" />
        <path d="M72 76c-11 2-18 9-21 19 11 2 19-6 21-19Z" />
      </g>
    </svg>

    <div class="relative" style="padding: 14px 16px 13px">
      <div class="flex items-center gap-2">
        <component :is="icon" :size="17" color="#fff" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,.28))" />
        <span style="color: #fff; font-size: 14px; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,.22)">
          {{ title }}
        </span>
      </div>

      <div class="text-center" style="margin-top: 10px">
        <div class="display tabular flex items-baseline justify-center gap-1">
          <span style="color: #fff; font-size: 52px; font-weight: 800; line-height: 1; text-shadow: 0 2px 6px rgba(0,0,0,.22)">
            {{ value }}
          </span>
          <span style="color: #fff; font-size: 19px; font-weight: 700; opacity: .95">{{ unit }}</span>
        </div>
        <div v-if="caption" style="color: rgba(255,255,255,.85); font-size: 13px; margin-top: 3px">{{ caption }}</div>
      </div>

      <div v-if="progress !== null" class="relative flex items-center" style="margin-top: 12px; height: 20px">
        <div class="w-full rounded-full overflow-hidden"
          style="height: 9px; background: rgba(0,0,0,.16); box-shadow: inset 0 1px 3px rgba(0,0,0,.22)">
          <div class="fill" :style="{ width: `${clamped}%`, background: 'rgba(255,255,255,.95)', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }" />
        </div>
        <span class="absolute tabular flex items-center justify-center rounded-full"
          :style="{
            left: `max(0px, min(calc(100% - 44px), calc(${clamped}% - 22px)))`,
            width: '44px', height: '20px',
            background: 'rgba(14,9,5,.85)', color: '#fff',
            fontSize: '11px', fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,.3)',
          }">
          {{ Math.round(clamped) }}%
        </span>
      </div>

      <div v-if="stats?.length" class="flex" style="margin-top: 12px; padding-top: 11px; border-top: 1px solid rgba(255,255,255,.22)">
        <div v-for="(s, i) in stats" :key="s.label" class="flex-1 flex items-center gap-2 min-w-0"
          :style="i < stats.length - 1 ? { borderRight: '1px solid rgba(255,255,255,.2)' } : {}">
          <div v-if="s.icon" class="rounded-full flex items-center justify-center shrink-0"
            :style="{
              width: '30px', height: '30px', marginLeft: i ? '7px' : '0',
              background: 'rgba(255,255,255,.16)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3), 0 1px 3px rgba(0,0,0,.15)',
            }">
            <component :is="s.icon" :size="15" color="#fff" />
          </div>
          <div class="min-w-0">
            <div class="display tabular" style="color: #fff; font-size: 16px; font-weight: 700; line-height: 1.1">
              {{ s.value }}<span v-if="s.unit" style="font-size: 11px; font-weight: 600"> {{ s.unit }}</span>
            </div>
            <div class="truncate" style="color: rgba(255,255,255,.8); font-size: 10px">{{ s.label }}</div>
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
const clamped = computed(() => Math.min(100, Math.max(0, props.progress ?? 0)));
</script>
