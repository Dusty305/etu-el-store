<template>
  <div class="base-input">
    <label v-if="label" :for="id" class="input-label">{{ label }}</label>

    <input
        v-if="type !== 'textarea'"
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
        class="input-field"
    />

    <textarea
        v-else
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
        class="textarea-field"
        :rows="rows"
    ></textarea>

    <div v-if="error" class="input-error">{{ error }}</div>
  </div>
</template>

<script setup>
defineProps({
  id: String,
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  modelValue: [String, Number],
  placeholder: String,
  required: Boolean,
  error: String,
  disabled: Boolean,
  rows: {
    type: Number,
    default: 3
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-input {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input-field, .textarea-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}

.input-field:focus, .textarea-field:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.input-field:disabled, .textarea-field:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.textarea-field {
  resize: vertical;
  min-height: 80px;
}

.input-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>