<template>
  <div class="bg-surface text-ink" style="min-height: 100vh">
    <div class="mx-auto" style="max-width: 520px; padding-bottom: 96px">
      <AppHeader v-if="showChrome" />
      <main class="px-5 pt-2 space-y-4">
        <slot />
      </main>
    </div>
    <BottomNav v-if="showChrome" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const showChrome = computed(() => route.path !== "/login");
</script>
