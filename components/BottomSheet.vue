<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end justify-center"
        style="background: rgba(0, 0, 0, 0.5)"
        @click.self="$emit('update:modelValue', false)">
        <div
          class="bg-surface border-t border-line w-full overflow-y-auto"
          style="border-radius: 28px 28px 0 0; max-width: 520px; max-height: 88vh">
          <div class="sticky top-0 bg-surface border-b border-line flex items-center justify-between px-5 py-4">
            <h3 class="text-ink" style="font-size: 18px; font-weight: 600">{{ title }}</h3>
            <button class="text-dim p-1" @click="$emit('update:modelValue', false)">
              <X :size="22" />
            </button>
          </div>
          <div class="p-5"><slot /></div>
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
  transition: opacity 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
</style>
