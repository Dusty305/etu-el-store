<template>
  <div class="auth-page">
    <AuthModal
        :isOpen="true"
        :initialMode="initialMode"
        @close="handleModalClose"
        @success="handleAuthSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import AuthModal from '../components/auth/AuthModal.vue';

const router = useRouter();
const authStore = useAuthStore();

const initialMode = ref('login');

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/');
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  if (mode === 'register') {
    initialMode.value = 'register';
  }
});

const handleModalClose = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
};

const handleAuthSuccess = () => {
  router.push('/main');
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>