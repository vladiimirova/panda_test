<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ConfirmModal from './components/ConfirmModal.vue';
import LanguageToggle from './components/LanguageToggle.vue';
import WeatherBlock from './components/WeatherBlock.vue';
import { getInitialLanguage, translations } from './i18n';

interface WeatherBlockItem {
  id: number;
}

const maxBlocks = 5;
const blocks = ref<WeatherBlockItem[]>([{ id: 1 }]);
const blockToDelete = ref<number | null>(null);
const language = ref(getInitialLanguage());
let nextBlockId = 2;

const canAddBlock = computed(() => blocks.value.length < maxBlocks);
const copy = computed(() => translations[language.value]);

watch(language, (value) => {
  localStorage.setItem('weather-language', value);
});

function addBlock() {
  if (!canAddBlock.value) return;
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
  <main class="weather-page">
    <section class="weather-shell" aria-labelledby="page-title">
      <header class="app-header">
        <div class="intro">
          <p class="eyebrow">OpenWeatherMap</p>
          <h1 id="page-title">Weather App</h1>
          <p class="intro-text">{{ copy.app.intro }}</p>
        </div>

        <div class="header-actions">
          <LanguageToggle v-model="language" :copy="copy.language" />
          <button class="add-block-button" type="button" :disabled="!canAddBlock" @click="addBlock">
            +
          </button>
        </div>
      </header>

      <p v-if="!canAddBlock" class="status-text">{{ copy.app.maxBlocks }}</p>

      <div class="weather-blocks">
        <WeatherBlock
          v-for="(block, index) in blocks"
          :key="block.id"
          :title="copy.app.blockTitle(index + 1)"
          :language="language"
          :copy="copy"
          :can-remove="blocks.length > 1"
          @remove="requestDeleteBlock(block.id)"
        />
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
  </main>
</template>
