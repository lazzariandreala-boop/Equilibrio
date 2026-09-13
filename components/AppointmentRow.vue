<template>
  <div class="rounded-3xl flex items-center gap-3" style="padding: 12px 13px"
    :style="{ background: 'var(--card)', border: '1px solid var(--line)', opacity: appointment.done ? 0.6 : 1 }">
    <button class="tap rounded-full flex items-center justify-center shrink-0" style="width: 38px; height: 38px"
      :style="{ background: appointment.done ? 'var(--move-soft)' : 'var(--alcohol-soft)' }"
      :aria-label="appointment.done ? 'Segna come da fare' : 'Segna come fatta'"
      @click="$emit('toggle')">
      <Check v-if="appointment.done" :size="18" color="var(--move)" />
      <Stethoscope v-else :size="18" color="var(--alcohol)" />
    </button>

    <button class="tap flex-1 min-w-0 text-left" @click="$emit('open')">
      <div class="text-ink truncate" style="font-size: 14.5px; font-weight: 600"
        :style="appointment.done ? { textDecoration: 'line-through' } : {}">
        {{ appointment.title }}
      </div>
      <div class="text-dim truncate" style="font-size: 12.5px; margin-top: 1px">
        {{ fmtDate(appointment.date) }}<span v-if="appointment.time"> · {{ appointment.time }}</span>
        <span v-if="appointment.place"> · {{ appointment.place }}</span>
      </div>
      <p v-if="appointment.notes" class="text-faint" style="font-size: 12px; margin-top: 4px; line-height: 1.4">
        {{ appointment.notes }}
      </p>
    </button>

    <ChevronRight :size="17" class="text-faint shrink-0" />
  </div>
</template>

<script setup lang="ts">
import { Check, Stethoscope, ChevronRight } from "lucide-vue-next";
import type { Appointment } from "~/stores/pregnancy";
import { keyToDate } from "~/utils/date";

defineProps<{ appointment: Appointment }>();
defineEmits<{ open: []; toggle: [] }>();

const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
function fmtDate(key: string) {
  const d = keyToDate(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
</script>
