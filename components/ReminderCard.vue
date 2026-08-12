<template>
  <div class="tap rounded-4xl flex items-center gap-2.5" style="padding: 12px"
    :style="{ background: 'var(--card)', border: '1px solid var(--line)', boxShadow: 'var(--tile-shadow)' }"
    @click="$emit('open')">
    <div class="rounded-full flex items-center justify-center shrink-0"
      :style="{
        width: '38px', height: '38px', background: `var(--${tone}-soft)`,
        boxShadow: on ? `inset 0 0 0 1.5px var(--${tone}), 0 0 14px -4px var(--${tone}-glow)` : 'none',
      }">
      <component :is="icon" :size="18" :color="`var(--${tone})`" />
    </div>

    <div class="flex-1 min-w-0">
      <div class="text-ink truncate" style="font-size: 14px; font-weight: 600">{{ label }}</div>
      <div class="truncate" :style="{ color: `var(--${tone})`, fontSize: '12px', fontWeight: 500 }">{{ detail }}</div>
    </div>

    <!-- .stop: toccando l'interruttore non si apre anche il dettaglio -->
    <Toggle :on="on" :tone="tone" @click.stop="$emit('toggle')" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: any;
  tone: "water" | "move" | "food" | "alcohol";
  label: string;
  detail: string;
  on: boolean;
}>();
defineEmits<{ toggle: []; open: [] }>();
</script>
