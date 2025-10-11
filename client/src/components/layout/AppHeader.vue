<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <h1>ElectroStore</h1>
      </div>

      <nav class="navigation">
        <div class="nav-item" @click="handleCartClick">
          <BaseButton
              :disabled="!authStore.isAuthenticated"
              variant="outline"
              class="cart-button"
          >
            🛒 Корзина
          </BaseButton>
        </div>

        <div class="nav-item" @click="handleAuthClick">
          <BaseButton variant="primary" class="auth-button">
            {{ authStore.isAuthenticated ? '👤 Профиль' : 'Войти' }}
          </BaseButton>
        </div>
      </nav>
    </div>

    <!-- Модальное окно авторизации -->
    <BaseModal :isOpen="isAuthModalOpen" @close="closeAuthModal">
      <component
          :is="currentAuthComponent"
          @success="handleAuthSuccess"
          @switch-to-login="switchToLogin"
          @switch-to-register="switchToRegister"
      />
    </BaseModal>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import BaseButton from '../ui/BaseButton.vue';
import BaseModal from '../ui/BaseModal.vue';
import LoginForm from '../auth/LoginForm.vue';
import RegisterForm from '../auth/RegisterForm.vue';

const router = useRouter();
const authStore = useAuthStore();

const isAuthModalOpen = ref(false);
const authMode = ref('login'); // 'login' или 'register'

const currentAuthComponent = computed(() => {
  return authMode.value === 'login' ? LoginForm : RegisterForm;
});

const handleCartClick = () => {
  if (authStore.isAuthenticated) {
    router.push('/cart');
  }
};

const handleAuthClick = () => {
  if (authStore.isAuthenticated) {
    router.push('/profile');
  } else {
    isAuthModalOpen.value = true;
  }
};

const closeAuthModal = () => {
  isAuthModalOpen.value = false;
  authStore.clearError();
};

const handleAuthSuccess = () => {
  closeAuthModal();
  // Можно добавить дополнительную логику после успешной авторизации
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

<style scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  margin: 0;
  color: #007bff;
  font-size: 1.5rem;
}

.navigation {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-item {
  cursor: pointer;
}

.cart-button, .auth-button {
  min-width: 100px;
}
</style>