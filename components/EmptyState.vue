<template>
  <div class="rise rounded-5xl text-center relative overflow-hidden"
    style="background: var(--card); border: 1px solid var(--line); padding: 16px 18px 18px;
           box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 10px 26px rgba(0,0,0,.22)">
    <EmptyIllustration :variant="tone" :size="88" class="mx-auto" />

    <div class="display text-ink" style="font-size: 18.5px; font-weight: 700; margin-top: 10px">{{ title }}</div>
    <p class="text-dim" style="font-size: 13px; line-height: 1.45; margin-top: 4px">{{ subtitle }}</p>

    <div v-if="actions?.length" class="flex flex-wrap justify-center gap-2" style="margin-top: 13px">
      <button v-for="a in actions" :key="a.label" class="tap rounded-full flex items-center gap-1.5"
        style="padding: 8px 14px; font-size: 13px; font-weight: 600;
               background: var(--raised); border: 1px solid var(--line);
               box-shadow: inset 0 1px 0 rgba(255,255,255,.06)"
        @click="$emit('action', a.id)">
        <component :is="a.icon" :size="14" :color="`var(--${tone})`" />
        <span class="text-ink">{{ a.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tone: "water" | "alcohol" | "move" | "food";
    title: string;
    subtitle: string;
    actions?: { id: string; label: string; icon: any }[];
  }>(),
  { actions: () => [] },
);
defineEmits<{ action: [string] }>();
</script>
