<template>
  <nav class="bottom-nav fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none" style="z-index: 45">
    <div class="pointer-events-auto w-full" style="max-width: 560px; padding: 0 12px 12px">
      <!-- Con le sezioni salute attive le voci possono superare lo spazio
           disponibile: la barra scorre invece di comprimere le etichette
           fino a renderle illeggibili. -->
      <div class="flex rounded-4xl px-1.5 py-1.5"
        :class="scrollable ? 'overflow-x-auto' : ''"
        :style="{
          background: 'var(--card)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--nav-shadow)',
          scrollbarWidth: 'none',
        }">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to"
          class="tap rounded-3xl flex flex-col items-center relative shrink-0"
          :style="{
            padding: '8px 0 7px',
            flex: scrollable ? '0 0 auto' : '1 1 0',
            minWidth: scrollable ? '62px' : '0',
            ...(active(item.to) ? { background: `var(--${item.tone}-soft)` } : {}),
          }">
          <component :is="item.icon" :size="20"
            :color="active(item.to) ? `var(--${item.tone})` : 'var(--faint)'" />
          <span :style="{
            fontSize: '9.5px', fontWeight: 600, marginTop: '3px', whiteSpace: 'nowrap',
            color: active(item.to) ? `var(--${item.tone})` : 'var(--faint)',
          }">{{ item.label }}</span>
          <span v-if="active(item.to)" class="absolute rounded-full"
            :style="{ bottom: '3px', width: '5px', height: '5px', background: `var(--${item.tone})` }" />
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { items, isActive } = useNavItems();

/** Oltre sei voci le etichette non ci stanno più: si passa allo scorrimento. */
const scrollable = computed(() => items.value.length > 6);
const active = isActive;
</script>

<style scoped>
nav div::-webkit-scrollbar {
  display: none;
}

/* Sul desktop la navigazione passa al menù laterale. */
@media (min-width: 1024px) {
  .bottom-nav {
    display: none;
  }
}
</style>
