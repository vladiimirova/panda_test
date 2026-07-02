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
import { getCityKey } from '../utils/favorites';

const props = defineProps<{
  title: string;
  canRemove: boolean;
  language: Language;
  copy: Translation;
  favoriteCities: CitySuggestion[];
  fixedCity?: CitySuggestion;
}>();

const emit = defineEmits<{
  remove: [];
  toggleFavorite: [city: CitySuggestion];
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

const isReadonly = computed(() => Boolean(props.fixedCity));
const isFavorite = computed(() => {
  if (!selectedCity.value) return false;

  const cityKey = getCityKey(selectedCity.value);
  return props.favoriteCities.some((favorite) => getCityKey(favorite) === cityKey);
});

const chartPoints = computed(() => {
  if (!forecast.value) return [];

  return forecastMode.value === 'day'
    ? buildTodayPoints(forecast.value.list, props.language)
    : buildWeekPoints(forecast.value.list, props.language);
});

watch(
  () => props.fixedCity,
  async (fixedCity) => {
    if (!fixedCity) return;

    selectedCity.value = fixedCity;
    city.value = formatCity(fixedCity);
    await loadWeather(fixedCity);
  },
  { immediate: true },
);

watch(city, (value) => {
  if (isReadonly.value) return;

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

function toggleFavorite() {
  if (!selectedCity.value) return;
  emit('toggleFavorite', selectedCity.value);
}
</script>

<template>
  <article class="weather-block">
    <header class="weather-block-header">
      <h2>{{ title }}</h2>
      <button
        v-if="canRemove && !isReadonly"
        class="remove-block-button"
        type="button"
        :aria-label="copy.actions.removeBlock"
        @click="emit('remove')"
      >
        ×
      </button>
    </header>

    <CitySearch
      v-if="!isReadonly"
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
    <WeatherCard
      :weather="weather"
      :is-loading="isLoadingWeather"
      :copy="copy.card"
      :is-favorite="isFavorite"
      :can-toggle-favorite="Boolean(selectedCity)"
      @toggle-favorite="toggleFavorite"
    />
    <WeatherChart
      :points="chartPoints"
      :mode="forecastMode"
      :is-loading="isLoadingForecast"
      :copy="copy.chart"
    />
  </article>
</template>
