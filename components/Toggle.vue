<template>
  <button
    class="relative shrink-0"
    role="switch"
    :aria-checked="on"
    :style="{
      width: '50px',
      height: '30px',
      borderRadius: '99px',
      background: on ? 'linear-gradient(135deg, var(--move-2), var(--move))' : 'var(--line)',
      transition: 'background 240ms ease',
    }"
    @click="$emit('click')">
    <span
      class="absolute"
      :style="{
        top: '3px',
        left: on ? '23px' : '3px',
        width: '24px',
        height: '24px',
        borderRadius: '99px',
        background: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,.2)',
        transition: 'left 240ms cubic-bezier(.22,1,.36,1)',
      }" />
  </button>
</template>

<script setup lang="ts">
defineProps<{ on: boolean }>();
defineEmits<{ click: [] }>();
</script>
