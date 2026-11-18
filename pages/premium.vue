<template>
  <div class="space-y-4" style="padding-bottom: 8px">
    <div class="flex items-center gap-2">
      <button class="tap rounded-full flex items-center justify-center" style="width: 42px; height: 42px; background: var(--raised); border: 1px solid var(--line)"
        aria-label="Indietro" @click="back"><ChevronLeft :size="21" class="text-ink" /></button>
      <h1 class="display text-ink" style="font-size: 1.5rem; font-weight: 800">Piani</h1>
    </div>

    <!-- Perché si è arrivati qui -->
    <div v-if="reason" class="rounded-4xl" style="padding: 16px; background: var(--food-soft)">
      <div class="display text-ink" style="font-size: 1.125rem; font-weight: 800">{{ reason.title }}</div>
      <p class="text-dim" style="font-size: 0.875rem; line-height: 1.45; margin-top: 4px">{{ reason.text }}</p>
    </div>

    <div v-if="!ent.active.value" class="rounded-3xl text-dim" style="padding: 12px 14px; background: var(--raised); border: 1px solid var(--line); font-size: 0.8125rem; line-height: 1.45">
      Gli abbonamenti non sono ancora attivi: per ora ogni funzione è sbloccata per tutti.
    </div>

    <!-- Piani -->
    <div v-for="p in PLANS" :key="p.id" class="rounded-5xl overflow-hidden"
      :style="{ background: 'var(--card)', border: selected === p.id ? `2px solid var(--${p.tone})` : '1px solid var(--line)', boxShadow: 'var(--tile-shadow)' }">
      <button class="tap w-full text-left flex items-center gap-3" style="padding: 16px" :aria-expanded="selected === p.id" @click="selected = p.id">
        <span class="rounded-2xl flex items-center justify-center shrink-0" :style="{ width: '48px', height: '48px', background: `var(--${p.tone}-soft)`, fontSize: '1.5rem' }">{{ p.emoji }}</span>
        <span class="min-w-0 flex-1">
          <span class="flex items-center gap-2">
            <span class="display text-ink" style="font-size: 1.125rem; font-weight: 800">{{ p.name }}</span>
            <span v-if="owned(p)" class="rounded-full" style="padding: 2px 8px; background: var(--move); color: #fff; font-size: 0.6875rem; font-weight: 700">ATTIVO</span>
            <span v-else-if="p.id === 'plus'" class="rounded-full" style="padding: 2px 8px; background: var(--move-soft); color: var(--move); font-size: 0.6875rem; font-weight: 700">CONVIENE</span>
          </span>
          <span class="block text-dim" style="font-size: 0.8125rem; line-height: 1.35">{{ p.tagline }}</span>
        </span>
        <span class="text-right shrink-0">
          <span class="block display tabular text-ink" style="font-size: 1.125rem; font-weight: 800">{{ ent.priceOf(p) }}</span>
          <span class="block text-faint" style="font-size: 0.6875rem">al mese</span>
        </span>
      </button>

      <div v-if="selected === p.id" style="padding: 0 16px 16px">
        <div class="text-faint" style="font-size: 0.75rem; font-weight: 700; letter-spacing: .05em; margin-bottom: 6px">COSA COMPRENDE</div>
        <ul class="space-y-2">
          <li v-for="i in p.includes" :key="i" class="flex items-start gap-2.5">
            <Check :size="16" :color="`var(--${p.tone})`" class="shrink-0" style="margin-top: 2px" />
            <span class="text-ink" style="font-size: 0.875rem; line-height: 1.4">{{ i }}</span>
          </li>
        </ul>
        <button v-if="!owned(p)" class="tap w-full rounded-3xl" :class="`grad-${p.tone}`"
          style="margin-top: 14px; padding: 14px; color: #fff; font-weight: 700; font-size: 0.9688rem"
          :disabled="ent.busy.value" :style="ent.busy.value ? { opacity: 0.6 } : {}" @click="buy(p)">
          {{ ent.busy.value ? "Attendi…" : `Abbonati a ${p.name} · ${ent.priceOf(p)}/mese` }}
        </button>
        <div v-else class="text-move text-center" style="margin-top: 12px; font-weight: 700; font-size: 0.875rem">Già compreso nel tuo abbonamento</div>
      </div>
    </div>

    <div class="rounded-4xl" style="padding: 14px 16px; background: var(--raised); border: 1px solid var(--line)">
      <div class="text-ink" style="font-weight: 700; font-size: 0.9375rem">Sempre gratis</div>
      <p class="text-dim" style="font-size: 0.8125rem; line-height: 1.45; margin-top: 4px">
        Diario dei pasti con la banca dati degli alimenti, ricette e lista della spesa, acqua, alcol, movimento,
        peso, ciclo mestruale, sincronizzazione tra dispositivi.
      </p>
    </div>

    <div v-if="message" role="status" class="rounded-3xl text-ink text-center" style="padding: 12px; background: var(--move-soft); font-weight: 600; font-size: 0.875rem">{{ message }}</div>

    <button class="tap w-full text-dim" style="padding: 10px; font-size: 0.875rem; font-weight: 600" @click="restore">Ripristina gli acquisti</button>
    <p class="text-faint text-center" style="font-size: 0.75rem; line-height: 1.5">
      Rinnovo mensile automatico tramite Google Play, disdici quando vuoi da Play Store › Pagamenti e abbonamenti.
      L'abbonamento è legato al tuo account Equilibrio.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, Check } from "lucide-vue-next";
import { PLANS, planById, type Plan } from "~/utils/plans";

const route = useRoute();
const router = useRouter();
const ent = useEntitlements();

const selected = ref<string>(planById(String(route.query.piano))?.id ?? "plus");
const message = ref("");

const REASONS: Record<string, { title: string; text: string }> = {
  foto: { title: "Il riconoscimento con l'IA è in Premium", text: "Con il piano gratuito puoi cercare gli alimenti nella banca dati o scriverli: i valori si calcolano da soli. Con Premium basta una foto del piatto." },
  descrizione: { title: "La stima con l'IA è in Premium", text: "Senza abbonamento la descrizione viene confrontata con la banca dati locale, che conosce i cibi più comuni." },
  pdf: { title: "I rapporti PDF sono in Premium", text: "Scegli periodo e sezioni e ottieni un documento curato da salvare o portare al medico." },
  gravidanza: { title: "Il modulo Gravidanza richiede il piano Gravidanza", text: "Settimane, alimenti da evitare in ogni pasto e ricetta, esami e appuntamenti." },
  diabete: { title: "Il modulo Diabete richiede il piano Diabete", text: "Glicemie, calcolatore del bolo e carboidrati delle ricette." },
};
const reason = computed(() => REASONS[String(route.query.da ?? "")]);

const owned = (p: Plan) => ent.active.value && p.features.every((f) => ent.status.value.features.includes(f));

onMounted(() => {
  ent.loadPrices();
  ent.refresh();
});

async function buy(p: Plan) {
  message.value = "";
  const r = await ent.purchase(p);
  message.value = r.message;
  if (r.ok && route.query.da) setTimeout(back, 1200);
}

async function restore() {
  message.value = await ent.restore();
}

function back() {
  if (window.history.length > 1) router.back();
  else router.push("/");
}
</script>
