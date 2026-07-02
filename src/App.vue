<script setup lang="ts">
import { ref, watch } from 'vue';
import CitySearch from './components/CitySearch.vue';
import WeatherCard from './components/WeatherCard.vue';
import { getCurrentWeather, searchCities } from './services/openWeather';
import { formatCity } from './utils/formatCity';
import type { CitySuggestion, CurrentWeather } from './types/weather';

const city = ref('');
const selectedCity = ref<CitySuggestion | null>(null);
const suggestions = ref<CitySuggestion[]>([]);
const weather = ref<CurrentWeather | null>(null);
const isSearching = ref(false);
const isLoadingWeather = ref(false);
const error = ref('');
let searchTimer: number | undefined;
let skipNextSearch = false;

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
  error.value = '';
  try {
    weather.value = await getCurrentWeather(cityToLoad);
  } catch (requestError) {
    error.value =
      requestError instanceof Error ? requestError.message : 'Не вдалося завантажити погоду.';
  } finally {
    isLoadingWeather.value = false;
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

      <WeatherCard :weather="weather" :is-loading="isLoadingWeather" />
    </section>
  </main>
</template>
