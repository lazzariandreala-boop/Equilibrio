<template>
  <div>
    <div class="tabular text-center mb-5" :style="{ fontSize: '44px', fontWeight: 700, color: `var(--${tone})` }">
      {{ local }}<span class="text-dim" style="font-size: 18px; font-weight: 600"> {{ unit }}</span>
    </div>

    <div class="flex items-center gap-3 mb-5">
      <button class="bg-raised text-ink rounded-2xl p-3.5" @click="local = Math.max(min, local - step)"><Minus :size="18" /></button>
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        v-model.number="local"
        class="flex-1"
        :style="{ accentColor: `var(--${tone})` }" />
      <button class="bg-raised text-ink rounded-2xl p-3.5" @click="local = Math.min(max, local + step)"><Plus :size="18" /></button>
    </div>

    <div class="grid grid-cols-3 gap-2 mb-5">
      <button
        v-for="p in presets"
        :key="p"
        class="rounded-xl py-2.5 font-semibold tabular"
        style="font-size: 14px"
        :class="local === p ? '' : 'bg-raised text-dim'"
        :style="local === p ? { background: `var(--${tone})`, color: '#fff' } : {}"
        @click="local = p">
        {{ p }}
      </button>
    </div>

    <button class="w-full py-3 rounded-xl font-semibold text-white" :style="{ background: `var(--${tone})` }" @click="$emit('save', local)">
      Salva obiettivo
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Minus, Plus } from "lucide-vue-next";

const props = defineProps<{
  tone: "water" | "move" | "food" | "alcohol";
  unit: string;
  modelValue: number;
  presets: number[];
  min: number;
  max: number;
  step: number;
}>();
defineEmits<{ save: [number] }>();

const local = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (local.value = v),
);
</script>
