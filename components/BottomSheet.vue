<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end justify-center"
        style="background: rgba(10, 6, 4, 0.55); backdrop-filter: blur(3px)"
        @click.self="$emit('update:modelValue', false)">
        <div class="sheet-panel w-full overflow-y-auto"
          style="background: var(--surface); border-radius: 32px 32px 0 0; max-width: 520px; max-height: 88vh">
          <!-- maniglia -->
          <div class="flex justify-center pt-3 pb-1">
            <span class="rounded-full" style="width: 40px; height: 4px; background: var(--line)" />
          </div>
          <div class="sticky flex items-center justify-between px-5 py-3" style="top: 0; background: var(--surface); z-index: 2">
            <h3 class="display text-ink" style="font-size: 19px; font-weight: 700">{{ title }}</h3>
            <button class="tap text-dim rounded-2xl p-2 bg-raised" aria-label="Chiudi" @click="$emit('update:modelValue', false)">
              <X :size="19" />
            </button>
          </div>
          <div class="px-5 pt-1" style="padding-bottom: 28px"><slot /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";
defineProps<{ modelValue: boolean; title: string }>();
defineEmits<{ "update:modelValue": [boolean] }>();
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.28s ease;
}
.sheet-enter-active .sheet-panel,
.sheet-leave-active .sheet-panel {
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet-panel,
.sheet-leave-to .sheet-panel {
  transform: translateY(100%);
}
</style>
