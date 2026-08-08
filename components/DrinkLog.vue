<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-2.5">
      <button v-for="p in presets" :key="p.name" class="tap rounded-3xl p-3.5 text-left"
        style="background: var(--alcohol-soft)" @click="emit('log', { name: p.name, alc: p.alc, kcal: p.kcal })">
        <div class="text-ink" style="font-weight: 600; font-size: 14px; line-height: 1.25">{{ p.name }}</div>
        <div class="text-dim tabular" style="font-size: 12px; margin-top: 3px">≈ {{ p.alc }} g · {{ p.kcal }} kcal</div>
      </button>
    </div>

    <div class="rounded-4xl p-4 space-y-2.5" style="background: var(--raised)">
      <div class="display" style="font-weight: 700; font-size: 15px">Personalizzato</div>
      <input v-model="custom.name" placeholder="Cosa hai bevuto" :class="inp" />
      <div class="flex gap-2.5">
        <div class="flex-1">
          <div class="text-faint mb-1" style="font-size: 11.5px">Alcol (g)</div>
          <input v-model.number="custom.alc" type="number" inputmode="numeric" class="tabular" :class="inp" />
        </div>
        <div class="flex-1">
          <div class="text-faint mb-1" style="font-size: 11.5px">kcal</div>
          <input v-model.number="custom.kcal" type="number" inputmode="numeric" class="tabular" :class="inp" />
        </div>
      </div>
      <button class="tap grad-alcohol w-full py-3 rounded-2xl font-semibold" style="color: #fff; font-size: 14px"
        @click="emit('log', { name: custom.name || 'Bevanda', alc: +custom.alc || 0, kcal: +custom.kcal || 0 })">
        Registra
      </button>
    </div>

    <p class="text-faint text-center" style="font-size: 12.5px; line-height: 1.5">
      Registrare una ricaduta senza giudizio è già un atto di cura. I valori sono stime.
    </p>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ log: [{ name: string; alc: number; kcal: number }] }>();
const inp = "bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full";
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
