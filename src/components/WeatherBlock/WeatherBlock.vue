<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import CitySearch from '../CitySearch/CitySearch.vue';
import ForecastToggle from '../ForecastToggle/ForecastToggle.vue';
import WeatherChart from '../WeatherChart/WeatherChart.vue';
import WeatherCard from '../WeatherCard/WeatherCard.vue';
import type { Language, Translation } from '../../i18n';
import { getCurrentWeather, getForecast, searchCities } from '../../services/openWeather';
import { buildDayPoints, buildWeekPoints } from '../../utils/forecast';
import { formatCity } from '../../utils/formatCity';
import type { CitySuggestion, CurrentWeather, ForecastMode, ForecastResponse } from '../../types/weather';
import { getCityKey } from '../../utils/favorites';

const props = defineProps<{
  title: string;
  canRemove: boolean;
  language: Language;
  copy: Translation;
  favoriteCities: CitySuggestion[];
  initialCity?: CitySuggestion;
  fixedCity?: CitySuggestion;
}>();

const emit = defineEmits<{
  remove: [];
  toggleFavorite: [city: CitySuggestion];
  citySelected: [city: CitySuggestion];
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
const isEditingCity = ref(false);
const selectedWeekPointIndex = ref(0);
let searchTimer: number | undefined;
let skipNextSearch = false;
let initialCityKey = '';

const isReadonly = computed(() => Boolean(props.fixedCity));
const shouldShowSearch = computed(
  () => !isReadonly.value && (!selectedCity.value || isEditingCity.value),
);
const isFavorite = computed(() => {
  if (!selectedCity.value) return false;

  const cityKey = getCityKey(selectedCity.value);
  return props.favoriteCities.some((favorite) => getCityKey(favorite) === cityKey);
});
const headerTitle = computed(() => (selectedCity.value ? formatCity(selectedCity.value) : props.title));

const chartPoints = computed(() => {
  if (!forecast.value) return [];

  return forecastMode.value === 'day'
    ? buildDayPoints(forecast.value.list, props.language, forecast.value.city.timezone)
    : buildWeekPoints(forecast.value.list, props.language, forecast.value.city.timezone);
});
const selectedWeekPoint = computed(() =>
  forecastMode.value === 'week' ? chartPoints.value[selectedWeekPointIndex.value] : null,
);
const displayedWeather = computed(() => {
  if (forecastMode.value !== 'week' || !selectedWeekPoint.value || !forecast.value) {
    return weather.value;
  }

  const dayItems = forecast.value.list.filter((item) =>
    item.dt_txt.startsWith(`${selectedWeekPoint.value?.date} `),
  );
  if (!dayItems.length) return weather.value;

  const average = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;
  const representativeItem =
    dayItems.find((item) => item.dt_txt.includes('12:00:00')) ?? dayItems[Math.floor(dayItems.length / 2)];

  return {
    name: forecast.value.city.name,
    sys: {
      country: forecast.value.city.country,
    },
    main: {
      temp: average(dayItems.map((item) => item.main.temp)),
      feels_like: average(dayItems.map((item) => item.main.feels_like)),
      humidity: Math.round(average(dayItems.map((item) => item.main.humidity))),
      pressure: Math.round(average(dayItems.map((item) => item.main.pressure))),
    },
    weather: representativeItem.weather,
    wind: {
      speed: average(dayItems.map((item) => item.wind.speed)),
    },
  };
});
const cardTitle = computed(() =>
  forecastMode.value === 'week' && selectedWeekPoint.value
    ? props.copy.card.forecastTitle(selectedWeekPoint.value.label)
    : props.copy.card.title,
);

watch(
  () => props.fixedCity,
  async (fixedCity) => {
    if (!fixedCity) return;

    selectedCity.value = fixedCity;
    city.value = formatCity(fixedCity);
    isEditingCity.value = false;
    await loadWeather(fixedCity);
  },
  { immediate: true },
);

watch(
  () => props.initialCity,
  async (initialCity) => {
    if (!initialCity || selectedCity.value) return;

    const nextInitialCityKey = getCityKey(initialCity);
    if (initialCityKey === nextInitialCityKey) return;

    initialCityKey = nextInitialCityKey;
    skipNextSearch = true;
    selectedCity.value = initialCity;
    city.value = formatCity(initialCity);
    isEditingCity.value = false;
    await loadWeather(initialCity);
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
  isEditingCity.value = false;
  emit('citySelected', suggestion);
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

function showCitySearch() {
  isEditingCity.value = true;
  suggestions.value = [];
}

function selectChartPoint(index: number) {
  selectedWeekPointIndex.value = index;
}

watch(
  () => [forecastMode.value, forecast.value] as const,
  () => {
    selectedWeekPointIndex.value = 0;
  },
);
</script>

<template>
  <article class="weather-block">
    <header class="weather-block-header">
      <h2>{{ headerTitle }}</h2>
      <button
        v-if="canRemove && !isReadonly"
        class="remove-block-button"
        type="button"
        :aria-label="copy.actions.removeBlock"
        @click="emit('remove')"
      >
        <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </header>

    <CitySearch
      v-if="shouldShowSearch"
      :model-value="city"
      :suggestions="suggestions"
      :is-searching="isSearching"
      :copy="copy.search"
      @update:model-value="updateCity"
      @select="selectCity"
      @submit="submitSearch"
    />
    <button
      v-else-if="!isReadonly"
      class="change-city-button"
      type="button"
      @click="showCitySearch"
    >
      {{ copy.search.change }}
    </button>

    <p v-if="error" class="error-message">{{ error }}</p>

    <ForecastToggle v-model="forecastMode" :copy="copy.forecast" />
    <div v-if="forecastMode === 'week' && chartPoints.length" class="forecast-days">
      <button
        v-for="(point, index) in chartPoints"
        :key="point.date || point.label"
        type="button"
        :class="{ active: index === selectedWeekPointIndex }"
        @click="selectChartPoint(index)"
      >
        {{ point.label }}
      </button>
    </div>
    <WeatherCard
      :weather="displayedWeather"
      :is-loading="isLoadingWeather"
      :copy="copy.card"
      :title="cardTitle"
      :is-favorite="isFavorite"
      :can-toggle-favorite="Boolean(selectedCity)"
      @toggle-favorite="toggleFavorite"
    />
    <WeatherChart
      :points="chartPoints"
      :mode="forecastMode"
      :is-loading="isLoadingForecast"
      :copy="copy.chart"
      @select-point="selectChartPoint"
    />
  </article>
</template>
