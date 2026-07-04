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
      :aria-label="copy.day"
      :aria-pressed="modelValue === 'day'"
      @click="emit('update:modelValue', 'day')"
    >
      <svg
        class="theme-toggle-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2 12h2.2M19.8 12H22M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56" />
      </svg>
    </button>
    <button
      type="button"
      :class="{ active: modelValue === 'night' }"
      :aria-label="copy.night"
      :aria-pressed="modelValue === 'night'"
      @click="emit('update:modelValue', 'night')"
    >
      <svg
        class="theme-toggle-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M20.42 14.35A7.4 7.4 0 0 1 9.65 3.58 8.3 8.3 0 1 0 20.42 14.35Z" />
        <path d="M16.8 4.2l.35 1.05 1.05.35-1.05.35L16.8 7l-.35-1.05-1.05-.35 1.05-.35.35-1.05Z" />
      </svg>
    </button>
  </div>
</template>
