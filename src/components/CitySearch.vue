<script setup lang="ts">
import { computed } from 'vue';
import type { CitySuggestion } from '../types/weather';
import { formatCity } from '../utils/formatCity';

const props = defineProps<{
  modelValue: string;
  suggestions: CitySuggestion[];
  isSearching: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  select: [city: CitySuggestion];
  submit: [];
}>();

const canSearch = computed(() => props.modelValue.trim().length > 1);

function handleInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
}
</script>

<template>
  <form class="search-form" @submit.prevent="emit('submit')">
    <label for="city">Город</label>
    <div class="search-row">
      <input
        id="city"
        :value="modelValue"
        name="city"
        type="search"
        autocomplete="address-level2"
        placeholder="Например, Kyiv"
        @input="handleInput"
      />
      <button type="submit" :disabled="!canSearch">Найти</button>
    </div>
    <div v-if="isSearching" class="status-text">Шукаємо міста...</div>
    <ul v-else-if="suggestions.length" class="suggestions">
      <li v-for="suggestion in suggestions" :key="`${suggestion.lat}-${suggestion.lon}`">
        <button type="button" @click="emit('select', suggestion)">
          {{ formatCity(suggestion) }}
        </button>
      </li>
    </ul>
  </form>
</template>
