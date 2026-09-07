<template>
  <div class="space-y-3">
    <div class="relative">
      <Search :size="17" class="absolute text-faint" style="left: 13px; top: 50%; transform: translateY(-50%)" />
      <input v-model="q" placeholder="Cerca un alimento…"
        class="bg-card border border-line text-ink rounded-2xl w-full" style="padding: 11px 12px 11px 38px" />
    </div>

    <div class="flex gap-1.5 p-1.5 rounded-3xl" style="background: var(--raised)">
      <button v-for="f in filters" :key="f.key" class="tap flex-1 py-2 rounded-2xl font-semibold"
        style="font-size: 12.5px"
        :style="filter === f.key
          ? { background: 'var(--card)', color: 'var(--ink)', boxShadow: 'var(--shadow)' }
          : { color: 'var(--dim)' }"
        @click="filter = f.key">
        {{ f.label }}
      </button>
    </div>

    <div class="space-y-2" style="max-height: 58vh; overflow-y: auto">
      <div v-for="r in shown" :key="r.id" class="rounded-3xl" style="padding: 12px 13px"
        :style="{ background: `var(--${tone(r.severity)}-soft)` }">
        <div class="flex items-center gap-2">
          <span class="rounded-full" :style="{
            padding: '3px 9px', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase',
            background: `var(--${tone(r.severity)})`, color: '#fff', letterSpacing: '.4px',
          }">{{ r.severity }}</span>
          <span class="text-ink" style="font-weight: 600; font-size: 14.5px">{{ r.title }}</span>
        </div>
        <p class="text-dim" style="font-size: 12.5px; line-height: 1.45; margin-top: 6px">{{ r.reason }}</p>
        <p class="text-ink" style="font-size: 12.5px; line-height: 1.45; margin-top: 4px">{{ r.advice }}</p>
      </div>

      <p v-if="!shown.length" class="text-faint text-center" style="font-size: 13px; padding: 18px">
        Nessuna corrispondenza. Se un alimento non è in elenco non significa che sia da evitare:
        nel dubbio chiedi all'ostetrica.
      </p>
    </div>

    <p class="text-faint" style="font-size: 12px; line-height: 1.5">
      Indicazioni generali su listeriosi, toxoplasmosi, salmonella, mercurio e caffeina.
      Ogni gravidanza è diversa: il riferimento resta sempre il tuo medico o la tua ostetrica.
    </p>
  </div>
</template>

<script setup lang="ts">
import { Search } from "lucide-vue-next";
import { FOOD_RISKS, SEVERITY_TONE, type Severity } from "~/utils/pregnancy";

const q = ref("");
const filter = ref<"tutti" | Severity>("tutti");
const filters = [
  { key: "tutti" as const, label: "Tutti" },
  { key: "evitare" as const, label: "Evitare" },
  { key: "limitare" as const, label: "Limitare" },
  { key: "attenzione" as const, label: "Attenzione" },
];

const tone = (s: Severity) => SEVERITY_TONE[s];

const shown = computed(() => {
  const term = q.value.trim().toLowerCase();
  return FOOD_RISKS.filter((r) => {
    if (filter.value !== "tutti" && r.severity !== filter.value) return false;
    if (!term) return true;
    return (
      r.title.toLowerCase().includes(term) ||
      r.match.some((m) => m.includes(term) || term.includes(m))
    );
  });
});
</script>
