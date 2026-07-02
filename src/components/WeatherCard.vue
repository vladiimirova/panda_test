<script setup lang="ts">
import { computed } from 'vue';
import type { Translation } from '../i18n';
import type { CurrentWeather } from '../types/weather';

const props = defineProps<{
  weather: CurrentWeather | null;
  isLoading: boolean;
  copy: Translation['card'];
  isFavorite: boolean;
  canToggleFavorite: boolean;
}>();

const emit = defineEmits<{
  toggleFavorite: [];
}>();

const displayCity = computed(() => {
  if (!props.weather) return props.copy.emptyCity;

  return `${props.weather.name}, ${props.weather.sys.country}`;
});
</script>

<template>
  <section class="weather-card" :class="{ favorite: isFavorite }" aria-live="polite">
    <div class="weather-card-header">
      <div>
        <p class="card-label">{{ copy.title }}</p>
        <h2>{{ displayCity }}</h2>
      </div>
      <button
        v-if="weather && canToggleFavorite"
        class="favorite-button"
        type="button"
        :aria-label="isFavorite ? copy.removeFavorite : copy.addFavorite"
        :title="isFavorite ? copy.removeFavorite : copy.addFavorite"
        @click="emit('toggleFavorite')"
      >
        {{ isFavorite ? '★' : '☆' }}
      </button>
    </div>
    <p v-if="isLoading" class="status-text">{{ copy.loading }}</p>
    <div v-else-if="weather" class="weather-details">
      <strong>{{ Math.round(weather.main.temp) }}°C</strong>
      <span>{{ weather.weather[0]?.description }}</span>
      <span>{{ copy.humidity }}: {{ weather.main.humidity }}%</span>
      <span>{{ copy.wind }}: {{ weather.wind.speed }} {{ copy.windUnit }}</span>
    </div>
    <p v-else>{{ copy.empty }}</p>
  </section>
</template>
