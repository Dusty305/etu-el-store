<template>
  <div class="home-page">
    <main class="main-content">
      <div style="display: flex">
        <div class="welcome-message">
          <h2>Добро пожаловать в El-store!</h2>
          <p>Лучший магазин электроники с выгодными ценами</p>
        </div>
        <div class="welcome-user">
          <p>Привет, <b>{{ username }}</b>!</p>
          <p>Начните покупки в нашем каталоге</p>
        </div>
      </div>
      <div class="product-section">
        <h1>Товары:</h1>
        <div v-if="productStore.loading">Загрузка...</div>
        <div v-else-if="productStore.error" class="error">{{ error }}</div>
        <div v-else
         v-for="product in productStore.products"
         :key="product._id"
         class="product-card"
        >
          <!--img :src="product.images" :alt="product.name"-->
          <div>
            <h3>{{ product.name }}</h3>
            <p>{{ product.description }}</p>
            <p class="product-price">{{ product.price }} {{ currency }}</p>
            <button :disabled="!authStore.isAuthenticated">Добавить в корзину</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth.js';
import { useProductStore } from '../../stores/product.js';

const authStore = useAuthStore();
const productStore = useProductStore();

const currency = '₽';

const username = computed(() => {
  return authStore.isAuthenticated ? authStore.userInfo?.displayName : 'Гость';
});

onMounted(productStore.getAllProducts);
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

.welcome-message {
  text-align: left;
  margin-top: 1rem;
  margin-right: 2rem;
}

.welcome-user {
  padding: 2rem;
  margin-left: 2rem;
  text-align: right;
  background: #f8f9fa;
  border-radius: 8px;
}

.product-section {
  margin-top: 1rem;
}

.product-section .product-card {
  display: flex;
  border: 2px dotted grey;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
}

.product-section .product-card img {
  max-width: 200px;
  
}
</style>