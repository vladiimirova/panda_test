<script setup lang="ts">
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import { onBeforeUnmount, ref, watch } from 'vue';
import type { Translation } from '../i18n';
import type { ChartPoint, ForecastMode } from '../types/weather';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

const props = defineProps<{
  points: ChartPoint[];
  mode: ForecastMode;
  isLoading: boolean;
  copy: Translation['chart'];
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart<'line'> | null = null;

watch(
  () => [props.points, props.mode, props.isLoading, props.copy] as const,
  () => {
    if (props.isLoading || !canvas.value || props.points.length === 0) {
      chart?.destroy();
      chart = null;
      return;
    }

    const data = {
      labels: props.points.map((point) => point.label),
      datasets: [
        {
          label: props.mode === 'day' ? props.copy.dayDataset : props.copy.weekDataset,
          data: props.points.map((point) => point.temp),
          borderColor: '#2e7189',
          backgroundColor: 'rgba(46, 113, 137, 0.14)',
          pointBackgroundColor: '#d9783f',
          tension: 0.35,
        },
      ],
    };

    if (chart) {
      chart.data = data;
      chart.update();
      return;
    }

    chart = new Chart(canvas.value, {
      type: 'line',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y}°C`,
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => `${value}°`,
            },
          },
        },
      },
    });
  },
  { immediate: true, deep: true },
);

onBeforeUnmount(() => {
  chart?.destroy();
});
</script>

<template>
  <section class="chart-card">
    <div>
      <p class="card-label">{{ copy.title }}</p>
      <h2>{{ mode === 'day' ? copy.dayTitle : copy.weekTitle }}</h2>
    </div>

    <p v-if="isLoading" class="status-text">{{ copy.loading }}</p>
    <p v-else-if="!points.length" class="status-text">{{ copy.empty }}</p>
    <div v-else class="chart-wrap">
      <canvas ref="canvas" :aria-label="copy.aria"></canvas>
    </div>
  </section>
</template>
