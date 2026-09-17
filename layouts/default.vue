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
  .app-shell {
    /* Lo spazio del menù laterale, poi una colonna di lettura comoda:
       stirare le card su tutta la larghezza le renderebbe vuote. */
    margin-left: 238px;
    max-width: 780px;
    padding-bottom: 32px;
  }
  .app-main {
    padding: 28px 32px 0;
  }
  .mobile-header {
    display: none;
  }
}

/* Su schermi molto ampi la colonna resta centrata nello spazio residuo. */
@media (min-width: 1400px) {
  .app-shell {
    margin-left: 238px;
    margin-right: auto;
    max-width: 880px;
  }
}
</style>
