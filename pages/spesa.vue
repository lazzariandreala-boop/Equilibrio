<template>
  <div class="space-y-4">
    <MealsTabs />

    <div class="flex items-center justify-between">
      <h1 class="display text-ink" style="font-size: 1.5rem; font-weight: 800">Lista della spesa</h1>
      <button v-if="settings.shopping.length" class="tap rounded-full flex items-center justify-center"
        style="width: 42px; height: 42px; background: var(--raised); border: 1px solid var(--line)"
        aria-label="Condividi la lista" @click="share"><Share2 :size="18" class="text-ink" /></button>
    </div>

    <form class="flex gap-2" @submit.prevent="add">
      <input v-model="newName" type="text" placeholder="Aggiungi un articolo, es. latte"
        class="flex-1 bg-card border border-line text-ink rounded-full" style="padding: 11px 16px; font-size: 0.9375rem"
        aria-label="Nuovo articolo" />
      <button type="submit" class="tap rounded-full flex items-center justify-center grad-food"
        style="width: 46px; height: 46px" :disabled="!newName.trim()" :style="!newName.trim() ? { opacity: 0.5 } : {}"
        aria-label="Aggiungi alla lista"><Plus :size="21" color="#fff" /></button>
    </form>

    <template v-if="settings.shopping.length">
      <div class="text-dim" style="font-size: 0.875rem">
        {{ toBuy }} da comprare<span v-if="bought"> · {{ bought }} nel carrello</span>
      </div>

      <section v-for="g in groups" :key="g.aisle">
        <h2 class="text-faint uppercase" style="font-size: 0.75rem; font-weight: 700; letter-spacing: .06em; margin: 0 4px 6px">{{ g.aisle }}</h2>
        <div class="rounded-4xl overflow-hidden" style="background: var(--card); border: 1px solid var(--line)">
          <div v-for="(it, n) in g.items" :key="it.id" class="flex items-center gap-3"
            style="padding: 4px 6px 4px 12px" :style="n ? { borderTop: '1px solid var(--line)' } : {}">
            <button class="tap flex-1 flex items-center gap-3 text-left min-w-0" style="padding: 8px 0"
              role="checkbox" :aria-checked="it.done" @click="settings.toggleShopping(it.id)">
              <span class="rounded-full flex items-center justify-center shrink-0"
                style="width: 26px; height: 26px"
                :style="it.done ? { background: 'var(--move)' } : { border: '2px solid var(--line)' }">
                <Check v-if="it.done" :size="16" color="#fff" />
              </span>
              <span class="min-w-0">
                <span class="block truncate" :class="it.done ? 'text-faint line-through' : 'text-ink'" style="font-size: 0.9375rem">{{ it.name }}</span>
                <span v-if="it.qty || it.from" class="block truncate text-faint" style="font-size: 0.75rem">
                  {{ [it.qty, it.from].filter(Boolean).join(" · ") }}
                </span>
              </span>
            </button>
            <button class="tap rounded-full flex items-center justify-center text-faint shrink-0" style="width: 40px; height: 40px"
              :aria-label="`Elimina ${it.name}`" @click="settings.removeShopping(it.id)"><Trash2 :size="16" /></button>
          </div>
        </div>
      </section>

      <button v-if="bought" class="tap w-full rounded-3xl text-dim" style="padding: 12px; border: 1px solid var(--line); font-weight: 600"
        @click="settings.clearShoppingDone()">
        Togli dalla lista i {{ bought }} già presi
      </button>
    </template>

    <template v-else>
      <EmptyState tone="food" title="La lista è vuota"
        subtitle="Scrivi qui sopra cosa ti serve, oppure apri una ricetta e aggiungi i suoi ingredienti con un tocco." />
      <NuxtLink to="/ricette" class="tap w-full rounded-3xl flex items-center justify-center gap-2 grad-food"
        style="padding: 14px; color: #fff; font-weight: 700">
        <ChefHat :size="18" /> Sfoglia le ricette
      </NuxtLink>
    </template>

    <div v-if="flash" role="status" class="fixed left-1/2 rounded-full text-ink"
      style="transform: translateX(-50%); bottom: 110px; padding: 10px 16px; background: var(--card); border: 1px solid var(--line); box-shadow: var(--tile-shadow); z-index: 40; font-size: 0.875rem; font-weight: 600">
      {{ flash }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Check, Trash2, Share2, ChefHat } from "lucide-vue-next";
import { AISLES, aisleOf } from "~/utils/recipes";
import { useSettingsStore } from "~/stores/settings";

const settings = useSettingsStore();
const newName = ref("");

const toBuy = computed(() => settings.shopping.filter((s) => !s.done).length);
const bought = computed(() => settings.shopping.filter((s) => s.done).length);

// Raggruppata per reparto, come si gira al supermercato; i già presi scendono in fondo.
const groups = computed(() =>
  [...AISLES]
    .map((aisle) => ({
      aisle,
      items: settings.shopping
        .filter((s) => (AISLES as readonly string[]).includes(s.aisle) ? s.aisle === aisle : aisle === "Altro")
        .sort((a, b) => Number(a.done) - Number(b.done)),
    }))
    .filter((g) => g.items.length),
);

function add() {
  // "2 l latte" o "latte 2 l": si separa la quantità dal nome quando c'è.
  const raw = newName.value.trim();
  if (!raw) return;
  const m = raw.match(/^(\d+[.,]?\d*\s*(?:g|kg|ml|l|pz|x)?)\s+(.+)$/i) || raw.match(/^(.+?)\s+(\d+[.,]?\d*\s*(?:g|kg|ml|l|pz)?)$/i);
  let name = raw;
  let qty = "";
  if (m) {
    const first = /^\d/.test(m[1]);
    name = first ? m[2] : m[1];
    qty = first ? m[1] : m[2];
  }
  name = name.charAt(0).toUpperCase() + name.slice(1);
  settings.addShopping([{ name, qty, aisle: aisleOf(name) }]);
  newName.value = "";
}

const flash = ref("");
async function share() {
  const lines = groups.value.flatMap((g) => [
    `${g.aisle}:`,
    ...g.items.filter((i) => !i.done).map((i) => `• ${i.name}${i.qty ? ` (${i.qty})` : ""}`),
    "",
  ]);
  const text = ["Lista della spesa", "", ...lines].join("\n").trim();
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title: "Lista della spesa", text, dialogTitle: "Condividi la lista" });
      return;
    }
    if (navigator.share) return void (await navigator.share({ title: "Lista della spesa", text }));
    await navigator.clipboard.writeText(text);
    flash.value = "Lista copiata negli appunti";
    setTimeout(() => (flash.value = ""), 2000);
  } catch {
    /* annullato */
  }
}
</script>
