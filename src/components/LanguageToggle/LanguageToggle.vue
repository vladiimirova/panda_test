<script setup lang="ts">
import type { Language, Translation } from '../../i18n';

defineProps<{
  modelValue: Language;
  copy: Translation['language'];
}>();

const emit = defineEmits<{
  'update:modelValue': [language: Language];
}>();
</script>

<template>
  <div class="language-toggle" :aria-label="copy.label">
    <button
      type="button"
      :class="{ active: modelValue === 'uk' }"
      :aria-pressed="modelValue === 'uk'"
      @click="emit('update:modelValue', 'uk')"
    >
      {{ copy.uk }}
    </button>
    <button
      type="button"
      :class="{ active: modelValue === 'en' }"
      :aria-pressed="modelValue === 'en'"
      @click="emit('update:modelValue', 'en')"
    >
      {{ copy.en }}
    </button>
  </div>
</template>
