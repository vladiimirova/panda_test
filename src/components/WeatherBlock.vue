<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import CitySearch from './CitySearch.vue';
import ForecastToggle from './ForecastToggle.vue';
import WeatherChart from './WeatherChart.vue';
import WeatherCard from './WeatherCard.vue';
import type { Language, Translation } from '../i18n';
import { getCurrentWeather, getForecast, searchCities } from '../services/openWeather';
import { buildTodayPoints, buildWeekPoints } from '../utils/forecast';
import { formatCity } from '../utils/formatCity';
import type { CitySuggestion, CurrentWeather, ForecastMode, ForecastResponse } from '../types/weather';

const props = defineProps<{
  title: string;
  canRemove: boolean;
  language: Language;
  copy: Translation;
}>();

const emit = defineEmits<{
  remove: [];
}>();

const city = ref('');
const selectedCity = ref<CitySuggestion | null>(null);
const suggestions = ref<CitySuggestion[]>([]);
const weather = ref<CurrentWeather | null>(null);
const forecast = ref<ForecastResponse | null>(null);
const forecastMode = ref<ForecastMode>('day');
const isSearching = ref(false);
const isLoadingWeather = ref(false);
const isLoadingForecast = ref(false);
const error = ref('');
let searchTimer: number | undefined;
let skipNextSearch = false;

const chartPoints = computed(() => {
  if (!forecast.value) return [];

  return forecastMode.value === 'day'
    ? buildTodayPoints(forecast.value.list, props.language)
    : buildWeekPoints(forecast.value.list, props.language);
});

watch(city, (value) => {
  window.clearTimeout(searchTimer);
  if (skipNextSearch) {
    skipNextSearch = false;
    return;
  }

  suggestions.value = [];
  if (value.trim().length < 2) return;

  searchTimer = window.setTimeout(async () => {
    isSearching.value = true;
    try {
      suggestions.value = await searchCities(value);
    } catch {
      error.value = props.copy.errors.citySearch;
    } finally {
      isSearching.value = false;
    }
  }, 350);
});

function updateCity(value: string) {
  city.value = value;
  selectedCity.value = null;
  weather.value = null;
  forecast.value = null;
  error.value = '';
}

async function selectCity(suggestion: CitySuggestion) {
  window.clearTimeout(searchTimer);
  skipNextSearch = true;
  selectedCity.value = suggestion;
  city.value = formatCity(suggestion);
  suggestions.value = [];
  await loadWeather(suggestion);
}

async function submitSearch() {
  if (city.value.trim().length < 2) return;

  if (selectedCity.value) {
    await loadWeather(selectedCity.value);
    return;
  }

  const [firstSuggestion] = suggestions.value.length
    ? suggestions.value
    : await searchCities(city.value);

  if (!firstSuggestion) {
    error.value = props.copy.errors.cityNotFound;
    return;
  }

  await selectCity(firstSuggestion);
}

async function loadWeather(cityToLoad: CitySuggestion) {
  isLoadingWeather.value = true;
  isLoadingForecast.value = true;
  error.value = '';
  try {
    const [currentWeather, cityForecast] = await Promise.all([
      getCurrentWeather(cityToLoad, props.language),
      getForecast(cityToLoad, props.language),
    ]);
    weather.value = currentWeather;
    forecast.value = cityForecast;
  } catch {
    error.value = props.copy.errors.weatherLoad;
  } finally {
    isLoadingWeather.value = false;
    isLoadingForecast.value = false;
  }
}

watch(
  () => props.language,
  async () => {
    if (!selectedCity.value) return;
    await loadWeather(selectedCity.value);
  },
);
</script>

<template>
  <article class="weather-block">
    <header class="weather-block-header">
      <h2>{{ title }}</h2>
      <button
        v-if="canRemove"
        class="remove-block-button"
        type="button"
        :aria-label="copy.actions.removeBlock"
        @click="emit('remove')"
      >
        ×
      </button>
    </header>

    <CitySearch
      :model-value="city"
      :suggestions="suggestions"
      :is-searching="isSearching"
      :copy="copy.search"
      @update:model-value="updateCity"
      @select="selectCity"
      @submit="submitSearch"
    />

    <p v-if="error" class="error-message">{{ error }}</p>

    <ForecastToggle v-model="forecastMode" :copy="copy.forecast" />
    <WeatherCard :weather="weather" :is-loading="isLoadingWeather" :copy="copy.card" />
    <WeatherChart
      :points="chartPoints"
      :mode="forecastMode"
      :is-loading="isLoadingForecast"
      :copy="copy.chart"
    />
  </article>
</template>
