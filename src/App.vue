<script setup lang="ts">
import { computed, ref } from 'vue';
import ConfirmModal from './components/ConfirmModal.vue';
import WeatherBlock from './components/WeatherBlock.vue';

interface WeatherBlockItem {
  id: number;
}

const maxBlocks = 5;
const blocks = ref<WeatherBlockItem[]>([{ id: 1 }]);
const blockToDelete = ref<number | null>(null);
let nextBlockId = 2;

const canAddBlock = computed(() => blocks.value.length < maxBlocks);

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

  return `Видалити блок погоди #${getBlockNumber(blockToDelete.value)}?`;
});
</script>

<template>
  <main class="weather-page">
    <section class="weather-shell" aria-labelledby="page-title">
      <header class="app-header">
        <div class="intro">
          <p class="eyebrow">OpenWeatherMap</p>
          <h1 id="page-title">Weather App</h1>
          <p class="intro-text">
            Введи город, выбери вариант из автокомплита и получи текущую погоду через OpenWeatherMap.
          </p>
        </div>

        <button class="add-block-button" type="button" :disabled="!canAddBlock" @click="addBlock">
          +
        </button>
      </header>

      <p v-if="!canAddBlock" class="status-text">Максимум 5 блоків погоди.</p>

      <div class="weather-blocks">
        <WeatherBlock
          v-for="(block, index) in blocks"
          :key="block.id"
          :title="`Блок ${index + 1}`"
          :can-remove="blocks.length > 1"
          @remove="requestDeleteBlock(block.id)"
        />
      </div>
    </section>

    <ConfirmModal
      v-if="blockToDelete"
      title="Підтвердження"
      :message="deleteMessage"
      confirm-label="Видалити"
      cancel-label="Скасувати"
      @confirm="confirmDeleteBlock"
      @cancel="cancelDeleteBlock"
    />
  </main>
</template>
