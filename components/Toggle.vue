<template>
  <button
    class="relative shrink-0"
    role="switch"
    :aria-checked="on"
    :style="{
      width: '46px',
      height: '27px',
      borderRadius: '99px',
      background: on ? `linear-gradient(135deg, var(--${tone}-2), var(--${tone}))` : 'var(--line)',
      transition: 'background 240ms ease',
    }"
    @click="$emit('click')">
    <span
      class="absolute"
      :style="{
        top: '3px',
        left: on ? '22px' : '3px',
        width: '21px',
        height: '21px',
        borderRadius: '99px',
        background: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,.2)',
        transition: 'left 240ms cubic-bezier(.22,1,.36,1)',
      }" />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ on: boolean; tone?: string }>(), { tone: "water" });
defineEmits<{ click: [] }>();
</script>
