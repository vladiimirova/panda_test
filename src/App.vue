<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import ConfirmModal from './components/ConfirmModal/ConfirmModal.vue';
import LanguageToggle from './components/LanguageToggle/LanguageToggle.vue';
import ThemeToggle from './components/ThemeToggle/ThemeToggle.vue';
import WeatherBlock from './components/WeatherBlock/WeatherBlock.vue';
import { getInitialLanguage, translations } from './i18n';
import { getUserCityByIp } from './services/ipLocation';
import { getInitialTheme } from './theme';
import type { CitySuggestion } from './types/weather';
import { getCityKey, loadFavorites, saveFavorites } from './utils/favorites';
import {
  loadWeatherBlocks,
  saveWeatherBlocks,
  type StoredWeatherBlock,
} from './utils/weatherBlocks';

const maxBlocks = 5;
const maxFavorites = 5;
const blocks = ref<StoredWeatherBlock[]>(loadWeatherBlocks());
const blockToDelete = ref<number | null>(null);
const favorites = ref<CitySuggestion[]>(loadFavorites());
const userCity = ref<CitySuggestion | null>(null);
const activeTab = ref<'weather' | 'favorites'>('weather');
const showBlocksLimitModal = ref(false);
const showFavoritesLimitModal = ref(false);
const isDetectingUserCity = ref(false);
const userCityError = ref('');
const language = ref(getInitialLanguage());
const theme = ref(getInitialTheme());
let nextBlockId = Math.max(...blocks.value.map((block) => block.id), 0) + 1;

const canAddBlock = computed(() => blocks.value.length < maxBlocks);
const copy = computed(() => translations[language.value]);

watch(language, (value) => {
  localStorage.setItem('weather-language', value);
});

watch(theme, (value) => {
  localStorage.setItem('weather-theme', value);
});

watch(
  favorites,
  (value) => {
    saveFavorites(value);
  },
  { deep: true },
);

watch(
  blocks,
  (value) => {
    saveWeatherBlocks(value);
  },
  { deep: true },
);

onMounted(async () => {
  isDetectingUserCity.value = true;
  userCityError.value = '';

  try {
    userCity.value = await getUserCityByIp();
    if (!userCity.value) {
      userCityError.value = copy.value.app.userCityError;
    }
  } catch {
    userCityError.value = copy.value.app.userCityError;
  } finally {
    isDetectingUserCity.value = false;
  }
});

function addBlock() {
  if (!canAddBlock.value) {
    showBlocksLimitModal.value = true;
    return;
  }

  blocks.value.push({ id: nextBlockId });
  nextBlockId += 1;
}

function requestDeleteBlock(blockId: number) {
  if (blocks.value.length === 1) return;
  blockToDelete.value = blockId;
}

function confirmDeleteBlock() {
  if (!blockToDelete.value) return;

  blocks.value = blocks.value.filter((block) => block.id !== blockToDelete.value);
  blockToDelete.value = null;
}

function cancelDeleteBlock() {
  blockToDelete.value = null;
}

function updateBlockCity(blockId: number, city: CitySuggestion) {
  blocks.value = blocks.value.map((block) =>
    block.id === blockId ? { ...block, city } : block,
  );
}

function toggleFavorite(city: CitySuggestion) {
  const cityKey = getCityKey(city);
  const existingFavorite = favorites.value.some((favorite) => getCityKey(favorite) === cityKey);

  if (existingFavorite) {
    favorites.value = favorites.value.filter((favorite) => getCityKey(favorite) !== cityKey);
    return;
  }

  if (favorites.value.length >= maxFavorites) {
    showFavoritesLimitModal.value = true;
    return;
  }

  favorites.value.push(city);
}

function getBlockNumber(blockId: number) {
  const index = blocks.value.findIndex((block) => block.id === blockId);
  if (index === -1) return blocks.value.length;

  return index + 1;
}

const deleteMessage = computed(() => {
  if (!blockToDelete.value) return '';

  return copy.value.app.deleteMessage(getBlockNumber(blockToDelete.value));
});
</script>

<template>
  <main class="weather-page" :class="`theme-${theme}`">
    <section class="weather-shell" aria-labelledby="page-title">
      <header class="app-header">
        <div class="brand-logo">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" focusable="false">
              <path class="brand-sun" d="M35 2.8a2 2 0 0 1 2 2v2.1a2 2 0 0 1-4 0V4.8a2 2 0 0 1 2-2ZM35 22.9a2 2 0 0 1 2 2V27a2 2 0 0 1-4 0v-2.1a2 2 0 0 1 2-2ZM46.2 14.9a2 2 0 0 1-2 2h-2.1a2 2 0 0 1 0-4h2.1a2 2 0 0 1 2 2ZM28 14.9a2 2 0 0 1-2 2h-2.1a2 2 0 0 1 0-4H26a2 2 0 0 1 2 2ZM43 6.9a2 2 0 0 1 0 2.8l-1.5 1.5a2 2 0 1 1-2.8-2.8l1.5-1.5a2 2 0 0 1 2.8 0ZM31.3 18.6a2 2 0 0 1 0 2.8l-1.5 1.5a2 2 0 1 1-2.8-2.8l1.5-1.5a2 2 0 0 1 2.8 0ZM27 6.9a2 2 0 0 1 2.8 0l1.5 1.5a2 2 0 1 1-2.8 2.8L27 9.7a2 2 0 0 1 0-2.8ZM38.7 18.6a2 2 0 0 1 2.8 0L43 20.1a2 2 0 1 1-2.8 2.8l-1.5-1.5a2 2 0 0 1 0-2.8ZM35 8a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z" />
              <path class="brand-cloud" d="M16.2 16.2A11.8 11.8 0 0 1 38.4 20a8.3 8.3 0 0 1-1 16.5H13.6a9.7 9.7 0 0 1 2.6-20.3Z" />
            </svg>
          </span>
          <h1 id="page-title">Weather App</h1>
        </div>

        <div class="header-actions">
          <LanguageToggle v-model="language" :copy="copy.language" />
          <ThemeToggle v-model="theme" :copy="copy.theme" />
          <button
            class="add-block-button"
            type="button"
            :aria-disabled="!canAddBlock"
            @click="addBlock"
          >
            <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </header>

      <div class="tabs" role="tablist" aria-label="Weather views">
        <button
          type="button"
          :class="{ active: activeTab === 'weather' }"
          @click="activeTab = 'weather'"
        >
          {{ copy.app.weatherTab }}
        </button>
        <button
          type="button"
          :class="{ active: activeTab === 'favorites' }"
          @click="activeTab = 'favorites'"
        >
          {{ copy.app.favoritesTab }} ({{ favorites.length }})
        </button>
      </div>

      <div v-if="activeTab === 'weather'" class="weather-blocks">
        <WeatherBlock
          v-for="(block, index) in blocks"
          :key="block.id"
          :title="copy.app.blockTitle(index + 1)"
          :language="language"
          :copy="copy"
          :favorite-cities="favorites"
          :initial-city="block.city || (index === 0 ? userCity || undefined : undefined)"
          :can-remove="blocks.length > 1"
          @remove="requestDeleteBlock(block.id)"
          @toggle-favorite="toggleFavorite"
          @city-selected="updateBlockCity(block.id, $event)"
        />
      </div>

      <div v-else class="weather-blocks">
        <p v-if="favorites.length === 0" class="empty-state">{{ copy.app.favoritesEmpty }}</p>
        <template v-else>
          <WeatherBlock
            v-for="(favorite, index) in favorites"
            :key="getCityKey(favorite)"
            :title="copy.actions.favoriteCity + ` ${index + 1}`"
            :language="language"
            :copy="copy"
            :favorite-cities="favorites"
            :fixed-city="favorite"
            :can-remove="false"
            @toggle-favorite="toggleFavorite"
          />
        </template>
      </div>
    </section>

    <ConfirmModal
      v-if="blockToDelete"
      :title="copy.modal.title"
      :message="deleteMessage"
      :confirm-label="copy.modal.confirm"
      :cancel-label="copy.modal.cancel"
      @confirm="confirmDeleteBlock"
      @cancel="cancelDeleteBlock"
    />

    <ConfirmModal
      v-if="showBlocksLimitModal"
      :title="copy.app.blocksLimitTitle"
      :message="copy.app.blocksLimitMessage"
      :confirm-label="copy.app.blocksLimitConfirm"
      confirm-variant="primary"
      @confirm="showBlocksLimitModal = false"
      @cancel="showBlocksLimitModal = false"
    />

    <ConfirmModal
      v-if="showFavoritesLimitModal"
      :title="copy.app.favoritesLimitTitle"
      :message="copy.app.favoritesLimitMessage"
      :confirm-label="copy.app.favoritesLimitConfirm"
      :cancel-label="copy.modal.cancel"
      @confirm="showFavoritesLimitModal = false"
      @cancel="showFavoritesLimitModal = false"
    />
  </main>
</template>
