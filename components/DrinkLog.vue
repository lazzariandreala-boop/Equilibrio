<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="p in presets"
        :key="p.name"
        class="bg-raised text-ink rounded-2xl p-3 text-left"
        @click="emit('log', { name: p.name, alc: p.alc, kcal: p.kcal })">
        <div style="font-weight: 600; font-size: 14px">{{ p.name }}</div>
        <div class="text-faint" style="font-size: 12px">≈ {{ p.alc }} g alcol · {{ p.kcal }} kcal</div>
      </button>
    </div>

    <div class="border border-line rounded-3xl p-3 space-y-2">
      <div style="font-weight: 600; font-size: 14px">Personalizzato</div>
      <input v-model="custom.name" placeholder="Cosa hai bevuto" :class="inp" />
      <div class="flex gap-2">
        <div class="flex-1">
          <div class="text-faint" style="font-size: 11px">Alcol (g)</div>
          <input v-model.number="custom.alc" type="number" inputmode="numeric" class="tabular" :class="inp" />
        </div>
        <div class="flex-1">
          <div class="text-faint" style="font-size: 11px">kcal</div>
          <input v-model.number="custom.kcal" type="number" inputmode="numeric" class="tabular" :class="inp" />
        </div>
      </div>
      <button
        class="bg-alcohol-soft text-alcohol w-full py-2.5 rounded-xl font-semibold"
        @click="emit('log', { name: custom.name || 'Bevanda', alc: +custom.alc || 0, kcal: +custom.kcal || 0 })">
        Registra
      </button>
    </div>

    <p class="text-faint" style="font-size: 12px; text-align: center">
      Registrare una ricaduta senza giudizio è già un atto di cura. I valori sono stime.
    </p>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ log: [{ name: string; alc: number; kcal: number }] }>();
const inp = "bg-raised border border-line text-ink rounded-xl px-2.5 py-2 w-full";
const custom = reactive({ name: "", alc: 0, kcal: 0 });
const presets = [
  { name: "Calice di vino", alc: 14, kcal: 125 },
  { name: "Birra media (0,5 L)", alc: 20, kcal: 210 },
  { name: "Birra piccola (0,33 L)", alc: 13, kcal: 140 },
  { name: "Spritz", alc: 11, kcal: 180 },
  { name: "Shot superalcolico", alc: 13, kcal: 100 },
  { name: "Cocktail", alc: 18, kcal: 250 },
];
</script>
