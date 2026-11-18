<template>
  <NuxtLink :to="`/ricetta?id=${recipe.id}`" class="tap block rounded-4xl overflow-hidden"
    :class="wide ? 'w-full' : 'shrink-0'"
    :style="{ width: wide ? undefined : '13.5rem', background: 'var(--card)', border: '1px solid var(--line)', boxShadow: 'var(--tile-shadow)' }">
    <div class="relative flex items-center justify-center"
      :style="{ height: wide ? '9.5rem' : '7.5rem', background: `linear-gradient(135deg, ${recipe.hue[0]}, ${recipe.hue[1]})` }">
      <span aria-hidden="true" :style="{ fontSize: wide ? '4.25rem' : '3.5rem', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.25))' }">{{ recipe.emoji }}</span>
      <button class="tap absolute rounded-full flex items-center justify-center"
        style="top: 8px; right: 8px; width: 36px; height: 36px; background: rgba(255,255,255,.92)"
        :aria-label="fav ? 'Togli dalle preferite' : 'Aggiungi alle preferite'" :aria-pressed="fav"
        @click.prevent.stop="settings.toggleRecipeFavorite(recipe.id)">
        <Star :size="18" color="#1d1d1f" :fill="fav ? '#f6c85f' : 'none'" />
      </button>
      <span v-if="warn" class="absolute rounded-full flex items-center gap-1"
        style="left: 8px; top: 8px; padding: 3px 8px; background: rgba(255,255,255,.92); color: #b3261e; font-size: 0.6875rem; font-weight: 700">
        <AlertTriangle :size="12" /> gravidanza
      </span>
    </div>
    <div style="padding: 10px 12px 12px">
      <div class="text-ink truncate" style="font-size: 0.9375rem; font-weight: 700">{{ recipe.name }}</div>
      <div class="text-dim tabular flex gap-2.5" style="font-size: 0.7812rem; margin-top: 2px">
        <span>{{ recipe.kcal }} kcal</span><span>{{ recipe.min }} min</span>
        <span v-if="showCarbs" class="text-water">{{ recipe.cho }} g CHO</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { Star, AlertTriangle } from "lucide-vue-next";
import type { Recipe } from "~/utils/recipes";
import { useSettingsStore } from "~/stores/settings";
import { checkFoods } from "~/utils/pregnancy";

const props = defineProps<{ recipe: Recipe; wide?: boolean }>();
const settings = useSettingsStore();
const access = useAccess();
const fav = computed(() => settings.isRecipeFavorite(props.recipe.id));
const showCarbs = computed(() => access.diabetes);
const warn = computed(
  () => access.pregnancy && checkFoods(props.recipe.ing.map((i) => i[0])).some((r) => r.severity === "evitare"),
);
</script>
