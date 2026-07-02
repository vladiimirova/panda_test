<script setup lang="ts">
defineProps<{
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <div class="modal-backdrop" role="presentation" @click.self="emit('cancel')">
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="modal-actions">
        <button class="secondary-button" type="button" @click="emit('cancel')">
          {{ cancelLabel }}
        </button>
        <button class="danger-button" type="button" @click="emit('confirm')">
          {{ confirmLabel }}
        </button>
      </div>
    </section>
  </div>
</template>
