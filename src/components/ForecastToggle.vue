<script setup lang="ts">
import type { ForecastMode } from '../types/weather';

defineProps<{
  modelValue: ForecastMode;
}>();

const emit = defineEmits<{
  'update:modelValue': [mode: ForecastMode];
}>();
</script>

<template>
  <div class="forecast-toggle" aria-label="Перемикання прогнозу">
    <button
      type="button"
      :class="{ active: modelValue === 'day' }"
      @click="emit('update:modelValue', 'day')"
    >
      День
    </button>
    <button
      type="button"
      :class="{ active: modelValue === 'week' }"
      @click="emit('update:modelValue', 'week')"
    >
      5 днів
    </button>
  </div>
</template>
