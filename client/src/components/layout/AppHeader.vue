<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <router-link to="/main" class="logo-link">
          <h1>El-store</h1>
        </router-link>
      </div>

      <nav class="navigation">
        <div v-if="authStore.isAdmin" class="nav-item">
          <BaseButton
              @click="goToAdmin"
              variant="outline"
              class="admin-button"
          >
            🛠️ Админ-панель
          </BaseButton>
        </div>

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
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import BaseButton from '../ui/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const goToAdmin = () => {
  router.push('/admin');
};

const handleCartClick = () => {
  if (authStore.isAuthenticated) {
    router.push('/cart');
  }
};

const handleAuthClick = () => {
  if (authStore.isAuthenticated) {
    router.push('/profile');
  } else {
    // Перенаправляем на страницу авторизации
    router.push('/auth');
  }
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

.logo-link {
  text-decoration: none;
  color: inherit;
}
</style>