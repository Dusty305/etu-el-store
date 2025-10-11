<template>
  <div class="cart-page">
    <h2>Корзина</h2>
    <div class="empty-cart">
      <p>Ваша корзина пуста</p>
      <p>Перейдите в каталог, чтобы добавить товары</p>
    </div>
  </div>
</template>

<script setup>
// Пока пустая страница корзины
</script>

<style scoped>
.cart-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
}
</style>