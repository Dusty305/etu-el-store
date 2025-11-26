<template>
  <button
      :class="['base-button', variant, size, { disabled }]"
      :disabled="disabled"
      @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style scoped>
.base-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.medium {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.large {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.primary {
  background: #007bff;
  color: white;
}

.primary:hover:not(.disabled) {
  background: #0056b3;
}

.secondary {
  background: #6c757d;
  color: white;
}

.secondary:hover:not(.disabled) {
  background: #545b62;
}

.outline {
  background: transparent;
  border: 1px solid #007bff;
  color: #007bff;
}

.outline:hover:not(.disabled) {
  background: #007bff;
  color: white;
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>