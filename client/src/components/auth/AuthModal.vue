<template>
  <BaseModal :isOpen="isOpen" @close="handleClose">
    <component
        :is="currentComponent"
        @success="handleSuccess"
        @switch-to-login="switchToLogin"
        @switch-to-register="switchToRegister"
    />
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth.js';
import BaseModal from '../ui/BaseModal.vue';
import LoginForm from '../auth/LoginForm.vue';
import RegisterForm from '../auth/RegisterForm.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  initialMode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value)
  }
});

const emit = defineEmits(['close', 'success']);

const authStore = useAuthStore();
const authMode = ref(props.initialMode);

const currentComponent = computed(() => {
  return authMode.value === 'login' ? LoginForm : RegisterForm;
});

const handleClose = () => {
  emit('close');
  authStore.clearError();
};

const handleSuccess = () => {
  emit('success');
  handleClose();
};

const switchToLogin = () => {
  authMode.value = 'login';
  authStore.clearError();
};

const switchToRegister = () => {
  authMode.value = 'register';
  authStore.clearError();
};
</script>