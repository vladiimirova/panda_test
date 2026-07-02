<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import CitySearch from './components/CitySearch.vue';
import ForecastToggle from './components/ForecastToggle.vue';
import WeatherChart from './components/WeatherChart.vue';
import WeatherCard from './components/WeatherCard.vue';
import { getCurrentWeather, getForecast, searchCities } from './services/openWeather';
import { buildTodayPoints, buildWeekPoints } from './utils/forecast';
import { formatCity } from './utils/formatCity';
import type { CitySuggestion, CurrentWeather, ForecastMode, ForecastResponse } from './types/weather';

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
    ? buildTodayPoints(forecast.value.list)
    : buildWeekPoints(forecast.value.list);
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
    } catch (requestError) {
      error.value =
        requestError instanceof Error ? requestError.message : 'Не вдалося знайти місто.';
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
    error.value = 'Місто не знайдено.';
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
      getCurrentWeather(cityToLoad),
      getForecast(cityToLoad),
    ]);
    weather.value = currentWeather;
    forecast.value = cityForecast;
  } catch (requestError) {
    error.value =
      requestError instanceof Error ? requestError.message : 'Не вдалося завантажити погоду.';
  } finally {
    isLoadingWeather.value = false;
    isLoadingForecast.value = false;
  }
}
</script>

<template>
  <main class="weather-page">
    <section class="weather-shell" aria-labelledby="page-title">
      <div class="intro">
        <p class="eyebrow">OpenWeatherMap</p>
        <h1 id="page-title">Weather App</h1>
        <p class="intro-text">
          Введи город, выбери вариант из автокомплита и получи текущую погоду через OpenWeatherMap.
        </p>
      </div>

      <CitySearch
        :model-value="city"
        :suggestions="suggestions"
        :is-searching="isSearching"
        @update:model-value="updateCity"
        @select="selectCity"
        @submit="submitSearch"
      />

      <p v-if="error" class="error-message">{{ error }}</p>

      <ForecastToggle v-model="forecastMode" />
      <WeatherCard :weather="weather" :is-loading="isLoadingWeather" />
      <WeatherChart :points="chartPoints" :mode="forecastMode" :is-loading="isLoadingForecast" />
    </section>
  </main>
</template>
