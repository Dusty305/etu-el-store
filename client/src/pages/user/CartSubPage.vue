<!-- В src/pages/user/CartSubPage.vue -->
<template>
  <div class="cart-page">
    <h2>Корзина</h2>

    <div v-if="cartStore.isLoading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка корзины...</p>
    </div>

    <div v-else-if="cartStore.error" class="error">
      <p>❌ {{ cartStore.error }}</p>
      <BaseButton @click="loadCart" variant="outline">Повторить</BaseButton>
    </div>

    <div v-else-if="cartStore.isEmpty" class="empty-cart">
      <p>Ваша корзина пуста</p>
      <p>Перейдите в каталог, чтобы добавить товары</p>
      <router-link to="/main">
        <BaseButton variant="primary">Перейти в каталог</BaseButton>
      </router-link>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.productId" class="cart-item">
          <div class="item-image">
            <img
                :src="getProductImage(item.product)"
                :alt="item.product.name"
            >
          </div>

          <div class="item-details">
            <h3 class="item-name">{{ item.product.name }}</h3>
            <p class="item-price">{{ formatPrice(item.product.price) }} ₽</p>
            <p class="item-stock">В наличии: {{ item.product.stock }} шт.</p>

            <div class="item-controls">
              <div class="quantity-control">
                <button
                    class="qty-btn minus"
                    @click="decreaseQuantity(item.productId)"
                    :disabled="item.quantity <= 1"
                >-</button>
                <input
                    type="number"
                    v-model.number="item.quantity"
                    min="1"
                    :max="item.product.stock"
                    @change="updateQuantity(item.productId, item.quantity)"
                    class="qty-input"
                >
                <button
                    class="qty-btn plus"
                    @click="increaseQuantity(item.productId)"
                    :disabled="item.quantity >= item.product.stock"
                >+</button>
              </div>

              <button
                  class="remove-btn"
                  @click="removeItem(item.productId)"
              >
                Удалить
              </button>
            </div>
          </div>

          <div class="item-total">
            <div class="total-price">{{ formatPrice(item.itemTotal) }} ₽</div>
            <div class="item-quantity">× {{ item.quantity }} шт.</div>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-header">
          <h3>Итого</h3>
        </div>

        <div class="summary-details">
          <div class="summary-row">
            <span>Товары ({{ cartStore.totalItems }})</span>
            <span>{{ formatPrice(cartStore.cartTotalPrice) }} ₽</span>
          </div>
          <div class="summary-row">
            <span>Доставка</span>
            <span>Бесплатно</span>
          </div>
          <div class="summary-row total">
            <span>Общая сумма</span>
            <span class="total-price">{{ formatPrice(cartStore.cartTotalPrice) }} ₽</span>
          </div>
        </div>

        <div class="cart-actions">
          <BaseButton
              @click="clearCart"
              variant="outline"
              class="clear-btn"
              :disabled="cartStore.isLoading"
          >
            Очистить корзину
          </BaseButton>

          <router-link to="/checkout">
            <BaseButton
                variant="primary"
                class="checkout-btn"
                :disabled="cartStore.isLoading"
            >
              Перейти к оформлению
            </BaseButton>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCartStore } from '../../stores/cart.js';
import { useAuthStore } from '../../stores/auth.js';
import BaseButton from '../../components/ui/BaseButton.vue';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

const imagePlaceholder = '/src/uploads/product_placeholder.png';

const getProductImage = (product) => {
  return product.images && product.images.length > 0 ? product.images[0] : imagePlaceholder;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

const loadCart = async () => {
  await cartStore.loadCart();
};

const increaseQuantity = async (productId) => {
  const item = cartStore.getCartItem(productId);
  if (item && item.quantity < item.product.stock) {
    await cartStore.updateCartItem(productId, item.quantity + 1);
  }
};

const decreaseQuantity = async (productId) => {
  const item = cartStore.getCartItem(productId);
  if (item && item.quantity > 1) {
    await cartStore.updateCartItem(productId, item.quantity - 1);
  }
};

const updateQuantity = async (productId, quantity) => {
  if (quantity < 1) {
    quantity = 1;
  }

  const item = cartStore.getCartItem(productId);
  if (item && quantity <= item.product.stock) {
    await cartStore.updateCartItem(productId, quantity);
  } else {
    // Если введено значение больше, чем есть на складе, сбрасываем к максимальному
    loadCart();
  }
};

const removeItem = async (productId) => {
  if (confirm('Удалить товар из корзины?')) {
    await cartStore.removeFromCart(productId);
  }
};

const clearCart = async () => {
  if (confirm('Очистить всю корзину?')) {
    await cartStore.clearCart();
  }
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth');
    return;
  }
  await loadCart();
});
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .error, .empty-cart {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.error {
  color: #dc3545;
  background: #f8d7da;
}

.empty-cart {
  color: #6c757d;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  margin-top: 1rem;
}

@media (max-width: 900px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  gap: 1rem;
  align-items: center;
}

.item-image {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.item-details {
  flex: 1;
}

.item-name {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.item-price {
  font-weight: bold;
  color: #007bff;
  margin: 0 0 0.25rem 0;
}

.item-stock {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.item-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.qty-btn {
  width: 30px;
  height: 30px;
  background: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.qty-input {
  width: 40px;
  height: 30px;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  text-align: center;
  font-size: 14px;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 14px;
}

.remove-btn:hover {
  text-decoration: underline;
}

.item-total {
  text-align: right;
  min-width: 100px;
}

.total-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.item-quantity {
  color: #6c757d;
  font-size: 0.9rem;
}

.cart-summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  align-self: flex-start;
}

.summary-header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.summary-header h3 {
  margin: 0;
}

.summary-details {
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0;
}

.summary-row.total {
  border-top: 1px solid #dee2e6;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: bold;
}

.total-price {
  color: #28a745;
  font-size: 1.3rem;
}

.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.clear-btn {
  color: #dc3545;
  border-color: #dc3545;
}

.clear-btn:hover {
  background: #dc3545;
  color: white;
}

.checkout-btn {
  background: #28a745;
  border-color: #28a745;
}

.checkout-btn:hover {
  background: #218838;
  border-color: #1e7e34;
}
</style>