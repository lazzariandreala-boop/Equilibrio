<template>
  <AppCard class="rise text-center" pad="p-6">
    <div class="rounded-full mx-auto flex items-center justify-center relative"
      :style="{ width: '96px', height: '96px', background: `var(--${tone}-soft)` }">
      <div class="absolute rounded-full" :style="{ inset: '-8px', background: `var(--${tone}-soft)`, opacity: 0.5 }" />
      <component :is="icon" :size="40" :color="`var(--${tone})`" style="position: relative" />
    </div>

    <div class="display text-ink" style="font-size: 19px; font-weight: 700; margin-top: 16px">{{ title }}</div>
    <p class="text-dim" style="font-size: 13.5px; line-height: 1.5; margin-top: 6px">{{ subtitle }}</p>

    <div v-if="actions?.length" class="flex flex-wrap justify-center gap-2" style="margin-top: 16px">
      <button v-for="a in actions" :key="a.label" class="tap rounded-full flex items-center gap-1.5"
        :style="{
          padding: '9px 15px', border: `1px solid var(--line)`,
          background: 'var(--raised)', fontSize: '13.5px', fontWeight: 600,
        }"
        @click="$emit('action', a.id)">
        <component :is="a.icon" :size="15" :color="`var(--${tone})`" />
        <span class="text-ink">{{ a.label }}</span>
      </button>
    </div>
  </AppCard>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tone: "water" | "alcohol" | "move" | "food";
    icon: any;
    title: string;
    subtitle: string;
    actions?: { id: string; label: string; icon: any }[];
  }>(),
  { actions: () => [] },
);
defineEmits<{ action: [string] }>();
</script>
