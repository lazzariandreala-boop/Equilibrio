<template>
  <div class="space-y-3 desk-grid">
    <!-- Nessuna data: si chiede subito, perché senza non si calcola nulla -->
    <div v-if="!preg.configured" class="rise">
      <EmptyState class="desk-span" tone="alcohol" title="Quando è iniziata?"
        subtitle="Serve una data per calcolare a che settimana sei e la data presunta del parto." />
      <button class="tap w-full rounded-full py-3.5 font-semibold grad-alcohol cta-glow-alcohol"
        style="color: #fff; font-size: 15.5px; margin-top: 12px" @click="openDate()">
        Imposta la data
      </button>
    </div>

    <template v-else>
      <!-- Settimana corrente -->
      <div class="rise rounded-5xl relative overflow-hidden grad-alcohol"
        style="box-shadow: 0 14px 34px -10px var(--alcohol-glow)">
        <div class="absolute rounded-full pointer-events-none"
          style="width: 180px; height: 180px; right: -60px; top: -70px; background: rgba(255,255,255,.14)" />

        <div class="relative" style="padding: 18px">
          <div class="flex items-center gap-2">
            <Baby :size="18" color="#fff" />
            <span style="color: #fff; font-size: 14px; font-weight: 700">{{ TRIMESTER_LABEL[info.trimester] }}</span>
          </div>

          <div class="text-center" style="margin-top: 12px">
            <div class="display" style="color: #fff; font-size: 46px; font-weight: 800; line-height: 1">
              {{ info.weeks }}<span style="font-size: 22px">ª</span>
              <span style="font-size: 20px; font-weight: 700; opacity: .9"> settimana</span>
            </div>
            <div style="color: rgba(255,255,255,.85); font-size: 13.5px; margin-top: 4px">
              {{ info.weeks }} settimane e {{ info.dayOfWeek }} {{ info.dayOfWeek === 1 ? "giorno" : "giorni" }}
            </div>
          </div>

          <div class="rounded-full overflow-hidden" style="height: 8px; background: rgba(255,255,255,.28); margin-top: 14px">
            <div class="fill" style="background: #fff" :style="{ width: `${info.progress}%` }" />
          </div>

          <div class="flex" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.22)">
            <div class="flex-1">
              <div class="display tabular" style="color: #fff; font-size: 17px; font-weight: 700">{{ info.daysToDue }}</div>
              <div style="color: rgba(255,255,255,.78); font-size: 10.5px">giorni al termine</div>
            </div>
            <div class="flex-1" style="border-left: 1px solid rgba(255,255,255,.2); padding-left: 10px">
              <div class="display" style="color: #fff; font-size: 15px; font-weight: 700; text-transform: capitalize">
                {{ fmtShort(info.dueDate) }}
              </div>
              <div style="color: rgba(255,255,255,.78); font-size: 10.5px">data presunta</div>
            </div>
            <div class="flex-1" style="border-left: 1px solid rgba(255,255,255,.2); padding-left: 10px">
              <div class="display tabular" style="color: #fff; font-size: 17px; font-weight: 700">{{ preg.upcoming.length }}</div>
              <div style="color: rgba(255,255,255,.78); font-size: 10.5px">visite in programma</div>
            </div>
          </div>
        </div>
      </div>

      <p v-if="info.invalid" class="text-food rounded-2xl" style="padding: 11px 13px; background: var(--food-soft); font-size: 12.5px; line-height: 1.45">
        La data inserita non sembra plausibile. Controllala toccando "Modifica la data".
      </p>

      <div class="flex gap-2.5 rise" style="animation-delay: 70ms">
        <button class="tap flex-1 rounded-full py-3.5 font-semibold flex items-center justify-center gap-2 grad-alcohol cta-glow-alcohol"
          style="color: #fff; font-size: 15px" @click="openAppointment()">
          <Plus :size="18" /> Visita
        </button>
        <button class="tap flex-1 rounded-full py-3.5 font-semibold flex items-center justify-center gap-2 bg-raised text-ink"
          style="font-size: 15px; border: 1px solid var(--line)" @click="openDate()">
          <CalendarDays :size="18" color="var(--alcohol)" /> Modifica la data
        </button>
      </div>

      <!-- Prossime visite -->
      <div v-if="preg.upcoming.length" class="rise" style="animation-delay: 110ms">
        <div class="display px-1 mb-2.5" style="font-weight: 700; font-size: 17px">Prossime visite</div>
        <div class="space-y-2">
          <AppointmentRow v-for="a in preg.upcoming" :key="a.id" :appointment="a"
            @open="openAppointment(a)" @toggle="preg.toggleDone(a.id)" />
        </div>
      </div>

      <!-- Scaletta dei controlli -->
      <div class="rise" style="animation-delay: 150ms">
        <Expandable class="desk-span" title="Controlli consigliati" :icon="Stethoscope" tone="water"
          :subtitle="`prossimo intorno alla ${nextCheck?.week ?? '—'}ª settimana`">
          <div class="space-y-2">
            <div v-for="c in PRENATAL_SCHEDULE" :key="c.week" class="rounded-3xl" style="padding: 11px 13px"
              :style="{ background: c.week <= info.weeks ? 'var(--raised)' : 'var(--water-soft)' }">
              <div class="flex items-center justify-between gap-2">
                <span class="text-ink" style="font-size: 14px; font-weight: 600">{{ c.title }}</span>
                <span class="shrink-0 rounded-full" :style="{
                  padding: '3px 9px', fontSize: '11px', fontWeight: 600,
                  background: c.week <= info.weeks ? 'var(--line)' : 'var(--water)',
                  color: c.week <= info.weeks ? 'var(--dim)' : '#fff',
                }">{{ c.week }}ª sett.</span>
              </div>
              <p class="text-dim" style="font-size: 12.5px; line-height: 1.4; margin-top: 4px">{{ c.detail }}</p>
              <button class="tap text-alcohol" style="font-size: 12.5px; font-weight: 600; margin-top: 6px"
                @click="openAppointment(null, c.title, c.week)">
                Metti in agenda
              </button>
            </div>
          </div>
          <p class="text-faint" style="font-size: 12px; margin-top: 10px; line-height: 1.5">
            Scaletta indicativa: le tempistiche esatte le stabilisce chi segue la gravidanza.
          </p>
        </Expandable>
      </div>

      <!-- Storico visite -->
      <div v-if="preg.past.length" class="rise" style="animation-delay: 190ms">
        <Expandable class="desk-span" title="Visite passate" :icon="History" tone="alcohol" :subtitle="`${preg.past.length} registrate`">
          <div class="space-y-2">
            <AppointmentRow v-for="a in preg.past" :key="a.id" :appointment="a"
              @open="openAppointment(a)" @toggle="preg.toggleDone(a.id)" />
          </div>
        </Expandable>
      </div>
    </template>

    <!-- Scheda della data -->
    <BottomSheet v-model="dateOpen" title="Data di riferimento">
      <div class="space-y-3.5">
        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Che data conosci?</div>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="b in bases" :key="b.key" class="tap rounded-2xl py-2.5 font-semibold" style="font-size: 13.5px"
              :class="form.basis === b.key ? 'grad-alcohol' : 'bg-raised text-dim'"
              :style="form.basis === b.key ? { color: '#fff' } : {}" @click="form.basis = b.key">
              {{ b.label }}
            </button>
          </div>
        </div>

        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">
            {{ form.basis === "mestruazione" ? "Primo giorno dell'ultima mestruazione" : "Giorno del concepimento" }}
          </div>
          <input v-model="form.date" type="date" class="bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full" />
        </div>

        <p class="text-dim rounded-2xl" style="padding: 11px 13px; background: var(--water-soft); font-size: 12.5px; line-height: 1.45">
          Le settimane di gravidanza si contano dall'ultima mestruazione, non dal concepimento: quando
          avviene il concepimento si è già a due settimane. Se indichi quella data, l'app fa la conversione.
        </p>

        <div v-if="preview" class="rounded-2xl" style="padding: 11px 13px; background: var(--alcohol-soft)">
          <div class="text-ink" style="font-size: 13.5px; font-weight: 600">
            Saresti alla {{ preview.weeks }}ª settimana e {{ preview.dayOfWeek }} giorni
          </div>
          <div class="text-dim" style="font-size: 12.5px; margin-top: 2px; text-transform: capitalize">
            Data presunta del parto: {{ fmtLong(preview.dueDate) }}
          </div>
        </div>

        <button class="tap w-full py-3.5 rounded-3xl font-semibold grad-alcohol" style="color: #fff; font-size: 15px"
          :disabled="!form.date" :style="!form.date ? { opacity: 0.5 } : {}" @click="saveDate">
          Salva
        </button>
      </div>
    </BottomSheet>

    <!-- Scheda della visita -->
    <BottomSheet v-model="apptOpen" :title="editingId ? 'Modifica la visita' : 'Nuova visita'">
      <div class="space-y-3.5">
        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Tipo di visita</div>
          <input v-model="appt.title" class="bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full"
            placeholder="Es. ecografia morfologica" />
        </div>

        <div class="flex gap-2.5">
          <div style="flex: 1.3">
            <div class="text-faint mb-1.5" style="font-size: 12px">Data</div>
            <input v-model="appt.date" type="date" class="bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full" />
          </div>
          <div style="flex: 1">
            <div class="text-faint mb-1.5" style="font-size: 12px">Ora</div>
            <input v-model="appt.time" type="time" class="bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full" />
          </div>
        </div>

        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Dove</div>
          <input v-model="appt.place" class="bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full"
            placeholder="Ambulatorio, ospedale…" />
        </div>

        <div>
          <div class="text-faint mb-1.5" style="font-size: 12px">Note</div>
          <textarea v-model="appt.notes" rows="3" style="resize: none"
            class="bg-card border border-line text-ink rounded-2xl px-3 py-2.5 w-full"
            placeholder="Cosa chiedere, esiti, esami da portare…" />
        </div>

        <div v-if="apptWeek !== null" class="text-dim rounded-2xl" style="padding: 10px 13px; background: var(--water-soft); font-size: 12.5px">
          In quella data sarai alla {{ apptWeek }}ª settimana.
        </div>

        <button class="tap w-full py-3.5 rounded-3xl font-semibold grad-alcohol" style="color: #fff; font-size: 15px"
          :disabled="!appt.date || !appt.title" :style="!appt.date || !appt.title ? { opacity: 0.5 } : {}"
          @click="saveAppointment">
          {{ editingId ? "Salva le modifiche" : "Aggiungi" }}
        </button>

        <button v-if="editingId" class="tap w-full py-2.5 rounded-2xl text-faint" style="font-size: 13px" @click="removeAppointment">
          Elimina questa visita
        </button>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { Baby, Plus, CalendarDays, Stethoscope, History } from "lucide-vue-next";
import { usePregnancyStore, type Appointment } from "~/stores/pregnancy";
import { useCycleStore } from "~/stores/cycle";
import {
  pregnancyInfo, toReferenceDate, PRENATAL_SCHEDULE, TRIMESTER_LABEL, type DateBasis,
} from "~/utils/pregnancyDates";
import { todayKey, keyToDate } from "~/utils/date";

const preg = usePregnancyStore();
const cycle = useCycleStore();

const info = computed(() => pregnancyInfo(preg.reference || todayKey()));

const nextCheck = computed(() => PRENATAL_SCHEDULE.find((c) => c.week > info.value.weeks));

// ── data di riferimento ──
const dateOpen = ref(false);
const bases = [
  { key: "mestruazione" as const, label: "Ultima mestruazione" },
  { key: "concepimento" as const, label: "Concepimento" },
];
const form = reactive({ date: "", basis: "mestruazione" as DateBasis });

const preview = computed(() => {
  if (!form.date) return null;
  const info = pregnancyInfo(toReferenceDate(form.date, form.basis));
  return info.invalid ? null : info;
});

function openDate() {
  // Se il ciclo è già tracciato, l'ultimo inizio è il candidato naturale.
  form.date = preg.entered || cycle.last?.start || "";
  form.basis = preg.basis;
  dateOpen.value = true;
}

function saveDate() {
  if (!form.date) return;
  preg.setDate(form.date, form.basis);
  dateOpen.value = false;
}

// ── visite ──
const apptOpen = ref(false);
const editingId = ref<string | null>(null);
const appt = reactive({ title: "", date: "", time: "", place: "", notes: "" });

const apptWeek = computed(() => {
  if (!appt.date || !preg.reference) return null;
  const i = pregnancyInfo(preg.reference, appt.date);
  return i.invalid ? null : i.weeks;
});

/** Data indicativa in cui cade una certa settimana di gravidanza. */
function dateForWeek(week: number) {
  const d = keyToDate(preg.reference);
  d.setDate(d.getDate() + week * 7);
  return todayKey(d);
}

function openAppointment(a: Appointment | null = null, title = "", week?: number) {
  editingId.value = a?.id ?? null;
  Object.assign(appt, {
    title: a?.title ?? title,
    date: a?.date ?? (week !== undefined && preg.reference ? dateForWeek(week) : todayKey()),
    time: a?.time ?? "",
    place: a?.place ?? "",
    notes: a?.notes ?? "",
  });
  apptOpen.value = true;
}

function saveAppointment() {
  if (!appt.date || !appt.title) return;
  const data = {
    title: appt.title.trim(),
    date: appt.date,
    time: appt.time || undefined,
    place: appt.place.trim() || undefined,
    notes: appt.notes.trim() || undefined,
  };
  if (editingId.value) preg.updateAppointment(editingId.value, data);
  else preg.addAppointment(data);
  apptOpen.value = false;
}

function removeAppointment() {
  if (editingId.value) preg.removeAppointment(editingId.value);
  apptOpen.value = false;
}

// ── formattazione ──
const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
function fmtShort(key: string) {
  const d = keyToDate(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function fmtLong(key: string) {
  return keyToDate(key).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
</script>
