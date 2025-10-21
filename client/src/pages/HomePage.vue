<template>
  <div class="home-page">
    <main class="main-content">
      <h2>Добро пожаловать в ElectroStore!</h2>
      <p>Лучший магазин электроники с выгодными ценами</p>

      <div v-if="!authStore.isAuthenticated" class="welcome-section">
        <p>Войдите или зарегистрируйтесь, чтобы начать покупки</p>
      </div>

      <div v-else class="user-section">
        <p>Привет, {{ authStore.userInfo?.displayName }}!</p>
        <p>Начните покупки в нашем каталоге</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.main-content {
  text-align: center;
  padding: 2rem 0;
}

.welcome-section, .user-section {
  margin-top: 2rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}
</style>