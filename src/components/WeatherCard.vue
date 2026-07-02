<script setup lang="ts">
import { computed } from 'vue';
import type { CurrentWeather } from '../types/weather';

const props = defineProps<{
  weather: CurrentWeather | null;
  isLoading: boolean;
}>();

const displayCity = computed(() => {
  if (!props.weather) return 'Город пока не выбран';

  return `${props.weather.name}, ${props.weather.sys.country}`;
});
</script>

<template>
  <section class="weather-card" aria-live="polite">
    <div>
      <p class="card-label">Поточна погода</p>
      <h2>{{ displayCity }}</h2>
    </div>
    <p v-if="isLoading" class="status-text">Завантажуємо погоду...</p>
    <div v-else-if="weather" class="weather-details">
      <strong>{{ Math.round(weather.main.temp) }}°C</strong>
      <span>{{ weather.weather[0]?.description }}</span>
      <span>Вологість: {{ weather.main.humidity }}%</span>
      <span>Вітер: {{ weather.wind.speed }} м/с</span>
    </div>
    <p v-else>Тут з'явиться погода після вибору міста.</p>
  </section>
</template>
