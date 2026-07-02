<script setup lang="ts">
import { computed, ref } from 'vue';

const city = ref('');
const lastSearch = ref('');

const canSearch = computed(() => city.value.trim().length > 1);

function submitSearch() {
  if (!canSearch.value) return;

  lastSearch.value = city.value.trim();
}
</script>

<template>
  <main class="weather-page">
    <section class="weather-shell" aria-labelledby="page-title">
      <div class="intro">
        <p class="eyebrow">OpenWeatherMap</p>
        <h1 id="page-title">Weather App</h1>
        <p class="intro-text">
          Введи город, чтобы подготовить запрос погоды. Подключение API будет следующим отдельным коммитом.
        </p>
      </div>

      <form class="search-form" @submit.prevent="submitSearch">
        <label for="city">Город</label>
        <div class="search-row">
          <input
            id="city"
            v-model="city"
            name="city"
            type="search"
            autocomplete="address-level2"
            placeholder="Например, Kyiv"
          />
          <button type="submit" :disabled="!canSearch">Найти</button>
        </div>
      </form>

      <section class="weather-card" aria-live="polite">
        <div>
          <p class="card-label">Текущий запрос</p>
          <h2>{{ lastSearch || 'Город пока не выбран' }}</h2>
        </div>
        <p>
          Здесь появятся температура, описание погоды, влажность и ветер после подключения API.
        </p>
      </section>
    </section>
  </main>
</template>
