<script setup lang="ts">
import type { ForecastMode } from '../types/weather';
import type { Translation } from '../i18n';

defineProps<{
  modelValue: ForecastMode;
  copy: Translation['forecast'];
}>();

const emit = defineEmits<{
  'update:modelValue': [mode: ForecastMode];
}>();
</script>

<template>
  <div class="forecast-toggle" :aria-label="copy.aria">
    <button
      type="button"
      :class="{ active: modelValue === 'day' }"
      :aria-pressed="modelValue === 'day'"
      @click="emit('update:modelValue', 'day')"
    >
      {{ copy.day }}
    </button>
    <button
      type="button"
      :class="{ active: modelValue === 'week' }"
      :aria-pressed="modelValue === 'week'"
      @click="emit('update:modelValue', 'week')"
    >
      {{ copy.week }}
    </button>
  </div>
</template>
