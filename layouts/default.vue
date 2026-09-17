<template>
  <div class="bg-surface text-ink" style="min-height: 100vh">
    <SideNav v-if="showChrome" />

    <div class="app-shell mx-auto">
      <!-- Sul desktop marchio, data e tema vivono nel menù laterale -->
      <AppHeader v-if="showChrome" class="mobile-header" />
      <main class="app-main">
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

<style>
.app-shell {
  max-width: 520px;
  padding-bottom: 92px;
}
.app-main {
  padding: 4px 16px 0;
}

@media (min-width: 1024px) {
  /* Il contenuto occupa lo spazio residuo e vi si centra dentro: con un
     margine sinistro fisso resterebbe incollato al menù. */
  .app-shell {
    margin-left: 238px;
    max-width: none;
    padding-bottom: 32px;
  }
  .app-main {
    max-width: 1180px;
    margin: 0 auto;
    padding: 28px 36px 0;
  }
  .mobile-header {
    display: none;
  }
}
</style>
