<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { init: initTheme } = useTheme();
const { init: initAuth } = useAuth();
const { start: startSync } = useCloudSync();

onMounted(() => {
  initTheme();
  initAuth();
  startSync();
});
</script>
