<template>
  <div class="profile-page">
    <h2>Профиль пользователя</h2>
    <div v-if="authStore.userInfo" class="profile-info">
      <p><strong>Имя:</strong> {{ authStore.userInfo.displayName }}</p>
      <p><strong>Логин:</strong> {{ authStore.userInfo.login }}</p>
      <p><strong>Email:</strong> {{ authStore.userInfo.email }}</p>
      <p><strong>Роль:</strong> {{ authStore.userInfo.role }}</p>

      <BaseButton @click="handleLogout" variant="secondary">
        Выйти
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import BaseButton from '../../components/ui/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.profile-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-info {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 1rem;
}
</style>