<script setup lang="ts">
import type { Translation } from '../i18n';
import type { ThemeMode } from '../theme';

defineProps<{
  modelValue: ThemeMode;
  copy: Translation['theme'];
}>();

const emit = defineEmits<{
  'update:modelValue': [mode: ThemeMode];
}>();
</script>

<template>
  <div class="theme-toggle" :aria-label="copy.label">
    <button
      type="button"
      :class="{ active: modelValue === 'day' }"
      @click="emit('update:modelValue', 'day')"
    >
      {{ copy.day }}
    </button>
    <button
      type="button"
      :class="{ active: modelValue === 'night' }"
      @click="emit('update:modelValue', 'night')"
    >
      {{ copy.night }}
    </button>
  </div>
</template>
