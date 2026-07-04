<script setup lang="ts">
withDefaults(defineProps<{
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
}>(), {
  confirmVariant: 'danger',
});

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
        <button v-if="cancelLabel" class="secondary-button" type="button" @click="emit('cancel')">
          {{ cancelLabel }}
        </button>
        <button
          :class="confirmVariant === 'danger' ? 'danger-button' : 'primary-button'"
          type="button"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </section>
  </div>
</template>
