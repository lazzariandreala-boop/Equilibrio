<template>
  <div>
    <div class="display tabular text-center mb-6" :style="{ fontSize: '54px', fontWeight: 800, color: `var(--${tone})`, lineHeight: 1 }">
      {{ local }}<span class="text-dim" style="font-size: 18px; font-weight: 600"> {{ unit }}</span>
    </div>

    <div class="flex items-center gap-3 mb-5">
      <button class="tap bg-raised text-ink rounded-2xl p-3.5" aria-label="Diminuisci" @click="local = Math.max(min, local - step)">
        <Minus :size="18" />
      </button>
      <input type="range" :min="min" :max="max" :step="step" v-model.number="local" class="flex-1"
        :style="{ accentColor: `var(--${tone})` }" />
      <button class="tap bg-raised text-ink rounded-2xl p-3.5" aria-label="Aumenta" @click="local = Math.min(max, local + step)">
        <Plus :size="18" />
      </button>
    </div>

    <div class="grid grid-cols-3 gap-2 mb-5">
      <button v-for="p in presets" :key="p" class="tap rounded-2xl py-3 font-semibold tabular" style="font-size: 15px"
        :class="local === p ? `grad-${tone}` : 'bg-raised text-dim'"
        :style="local === p ? { color: '#fff' } : {}"
        @click="local = p">
        {{ p }}
      </button>
    </div>

    <button class="tap w-full py-3.5 rounded-3xl font-semibold" :class="`grad-${tone}`" style="color: #fff; font-size: 15px"
      @click="$emit('save', local)">
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
watch(() => props.modelValue, (v) => (local.value = v));
</script>
