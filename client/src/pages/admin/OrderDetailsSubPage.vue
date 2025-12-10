<template>
  <div class="admin-order-details-page">
    <div v-if="adminOrdersStore.isLoading && !adminOrdersStore.currentOrder" class="loading">
      <div class="spinner"></div>
      <p>Загрузка информации о заказе...</p>
    </div>

    <div v-else-if="adminOrdersStore.error" class="error">
      <p>❌ {{ adminOrdersStore.error }}</p>
      <BaseButton @click="loadOrder" variant="outline">Повторить</BaseButton>
    </div>

    <div v-else-if="!adminOrdersStore.currentOrder" class="not-found">
      <h2>Заказ не найден</h2>
      <p>Запрашиваемый заказ не существует или у вас нет к нему доступа.</p>
      <router-link to="/admin/orders">
        <BaseButton variant="primary">Вернуться к заказам</BaseButton>
      </router-link>
    </div>

    <div v-else class="order-details">
      <!-- Хлебные крошки -->
      <nav class="breadcrumbs">
        <router-link to="/admin/orders" class="breadcrumb-link">Заказы</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">Заказ №{{ orderNumber }}</span>
      </nav>

      <!-- Заголовок заказа -->
      <div class="order-header">
        <div class="header-left">
          <h2>Заказ №{{ orderNumber }}</h2>
          <div class="order-meta">
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            <span :class="['order-status', getStatusClass(order.status)]">
              {{ order.status }}
            </span>
          </div>
        </div>

        <div class="header-right">
          <div class="order-total">
            <span class="total-label">Сумма заказа:</span>
            <span class="total-amount">{{ formatPrice(order.totalAmount) }} ₽</span>
          </div>
        </div>
      </div>

      <!-- Действия с заказом -->
      <div v-if="order.status === 'ОПЛАЧЕН'" class="order-actions-panel">
        <BaseButton @click="handleDeliver" variant="primary" :disabled="adminOrdersStore.isLoading">
          {{ adminOrdersStore.isLoading ? 'Обработка...' : 'Отметить как доставленный' }}
        </BaseButton>
      </div>

      <!-- Информация о заказе -->
      <div class="order-info">
        <!-- Информация о пользователе -->
        <div class="user-info-section">
          <h3>Информация о пользователе</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">ID:</span>
              <span class="info-value">{{ order.userId?._id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Логин:</span>
              <span class="info-value">{{ order.userId?.login }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Имя:</span>
              <span class="info-value">{{ order.userId?.displayName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ order.userId?.email }}</span>
            </div>
          </div>
        </div>

        <!-- Товары в заказе -->
        <div class="order-items-section">
          <h3>Товары в заказе</h3>
          <div class="items-list">
            <div v-for="item in order.items" :key="item.productId._id" class="order-item">
              <div class="item-image">
                <img :src="getProductImage(item.productId)" :alt="item.productId.name">
              </div>
              <div class="item-details">
                <h4>{{ item.productId.name }}</h4>
                <div class="item-description">{{ item.productId.description }}</div>
                <div class="item-price">{{ formatPrice(item.productId.price) }} ₽ × {{ item.quantity }} шт.</div>
                <div class="item-total">{{ formatPrice(item.productId.price * item.quantity) }} ₽</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Информация о доставке -->
        <div class="delivery-info-section">
          <h3>Информация о доставке</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Адрес:</span>
              <span class="info-value">{{ order.deliveryInfo?.address || 'Не указан' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Время доставки:</span>
              <span class="info-value">{{ formatDateTime(order.deliveryInfo?.deliveryTime) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Примечания:</span>
              <span class="info-value">{{ order.deliveryInfo?.courierNotes || 'Не указаны' }}</span>
            </div>
          </div>
        </div>

        <!-- Информация об оплате -->
        <div v-if="order.paymentInfo" class="payment-info-section">
          <h3>Информация об оплате</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Способ оплаты:</span>
              <span class="info-value">Банковская карта</span>
            </div>
            <div class="info-row">
              <span class="info-label">Номер карты:</span>
              <span class="info-value">**** **** **** {{ order.paymentInfo.cardNumber?.slice(-4) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Срок действия:</span>
              <span class="info-value">{{ order.paymentInfo.expirationDate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminOrdersStore } from '../../stores/adminOrders.js';
import BaseButton from '../../components/ui/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const adminOrdersStore = useAdminOrdersStore();

const order = computed(() => adminOrdersStore.currentOrder);
const orderNumber = computed(() => order.value?._id?.slice(-8).toUpperCase() || '');

const loadOrder = async () => {
  await adminOrdersStore.loadOrder(route.params.orderId);
};

const handleDeliver = async () => {
  if (!confirm('Вы уверены, что хотите отметить заказ как доставленный?')) return;

  const result = await adminOrdersStore.deliverOrder(order.value._id);

  if (result.success) {
    alert('Заказ успешно отмечен как доставленный!');
  } else {
    alert(result.error || 'Произошла ошибка');
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Не указано';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'Не указано';
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

const getProductImage = (product) => {
  return product?.images && product.images.length > 0
      ? product.images[0]
      : '/src/uploads/product_placeholder.png';
};

const getStatusClass = (status) => {
  switch (status) {
    case 'НОВЫЙ':
      return 'status-new';
    case 'ОПЛАЧЕН':
      return 'status-paid';
    case 'ДОСТАВЛЕН':
      return 'status-delivered';
    case 'ОТМЕНЁН':
      return 'status-cancelled';
    default:
      return '';
  }
};

onMounted(() => {
  loadOrder();
});
</script>

<style scoped>
.admin-order-details-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .error, .not-found {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.error {
  color: #dc3545;
}

.not-found {
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

.breadcrumbs {
  margin-bottom: 1rem;
  font-size: 14px;
  color: #666;
}

.breadcrumb-link {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 8px;
}

.breadcrumb-current {
  color: #333;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.header-left h2 {
  margin: 0 0 0.5rem 0;
}

.order-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.order-date {
  color: #6c757d;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-new {
  background: #fff3cd;
  color: #856404;
}

.status-paid {
  background: #d4edda;
  color: #155724;
}

.status-delivered {
  background: #d1ecf1;
  color: #0c5460;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.order-total {
  text-align: right;
}

.total-label {
  display: block;
  color: #6c757d;
  font-size: 0.9rem;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #28a745;
}

.order-actions-panel {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.order-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .order-info {
    grid-template-columns: 1fr;
  }
}

.user-info-section,
.order-items-section,
.delivery-info-section,
.payment-info-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.user-info-section h3,
.order-items-section h3,
.delivery-info-section h3,
.payment-info-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #6c757d;
  font-weight: 500;
}

.info-value {
  text-align: right;
  color: #333;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.item-image {
  width: 80px;
  height: 80px;
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

.item-details h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.item-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.item-price {
  color: #6c757d;
  font-size: 0.9rem;
}

.item-total {
  font-weight: bold;
  margin-top: 0.25rem;
}
</style>