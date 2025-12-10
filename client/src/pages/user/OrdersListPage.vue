<template>
  <div class="orders-page">
    <h2>Мои заказы</h2>

    <!-- Фильтры -->
    <div class="orders-filters">
      <div class="filter-group">
        <label for="statusFilter">Статус заказа:</label>
        <select id="statusFilter" v-model="statusFilter" @change="loadOrders" class="filter-select">
          <option value="">Все заказы</option>
          <option value="НОВЫЙ">Новые</option>
          <option value="ОПЛАЧЕН">Оплаченные</option>
          <option value="ВЫПОЛНЕН">Выполненные</option>
          <option value="ОТМЕНЁН">Отменённые</option>
        </select>
      </div>
    </div>

    <!-- Список заказов -->
    <div v-if="ordersStore.isLoading && ordersStore.orders.length === 0" class="loading">
      <div class="spinner"></div>
      <p>Загрузка заказов...</p>
    </div>

    <div v-else-if="ordersStore.error" class="error">
      <p>❌ {{ ordersStore.error }}</p>
      <BaseButton @click="loadOrders" variant="outline">Повторить</BaseButton>
    </div>

    <div v-else-if="ordersStore.orders.length === 0" class="empty">
      <p>📭 У вас пока нет заказов</p>
      <p>Совершите первую покупку в нашем каталоге</p>
      <router-link to="/main">
        <BaseButton variant="primary">Перейти в каталог</BaseButton>
      </router-link>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in ordersStore.orders" :key="order._id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h3 class="order-number">Заказ №{{ order._id.slice(-8).toUpperCase() }}</h3>
            <div class="order-date">{{ formatDate(order.createdAt) }}</div>
          </div>
          <div class="order-status">
            <span :class="['status-badge', getStatusClass(order.status)]">
              {{ order.status }}
            </span>
          </div>
        </div>

        <div class="order-content">
          <div class="order-items">
            <div v-for="(item, index) in order.items.slice(0, 2)" :key="index" class="order-item-preview">
              <span class="item-name">{{ item.product?.name || `Товар #${index + 1}` }}</span>
              <span class="item-quantity">× {{ item.quantity }}</span>
            </div>
            <div v-if="order.items.length > 2" class="more-items">
              и ещё {{ order.items.length - 2 }} товар(ов)
            </div>
          </div>

          <div class="order-total">
            <div class="total-label">Итого:</div>
            <div class="total-amount">{{ formatPrice(order.totalPrice) }} ₽</div>
          </div>
        </div>

        <div class="order-actions">
          <router-link :to="`/orders/${order._id}`">
            <BaseButton variant="outline" size="small">Подробнее</BaseButton>
          </router-link>

          <template v-if="order.status === 'НОВЫЙ'">
            <BaseButton @click="goToEdit(order._id)" variant="primary" size="small">
              Оплатить/Редактировать
            </BaseButton>
          </template>
        </div>
      </div>
    </div>

    <!-- Пагинация -->
    <div v-if="ordersStore.pagination.totalPages > 1" class="pagination">
      <BaseButton
          @click="changePage(ordersStore.pagination.currentPage - 1)"
          :disabled="ordersStore.pagination.currentPage === 1"
          variant="outline"
      >
        Назад
      </BaseButton>

      <span class="page-info">
        Страница {{ ordersStore.pagination.currentPage }} из {{ ordersStore.pagination.totalPages }}
      </span>

      <BaseButton
          @click="changePage(ordersStore.pagination.currentPage + 1)"
          :disabled="ordersStore.pagination.currentPage === ordersStore.pagination.totalPages"
          variant="outline"
      >
        Вперед
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useOrdersStore } from '../../stores/orders.js';
import BaseButton from '../../components/ui/BaseButton.vue';

const router = useRouter();
const ordersStore = useOrdersStore();

const statusFilter = ref('');

const loadOrders = (page = 1) => {
  ordersStore.loadOrders(page, 10, statusFilter.value);
};

const changePage = (page) => {
  if (page >= 1 && page <= ordersStore.pagination.totalPages) {
    loadOrders(page);
  }
};

const goToEdit = (orderId) => {
  router.push(`/orders/${orderId}/edit`);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
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

const getStatusClass = (status) => {
  switch (status) {
    case 'НОВЫЙ':
      return 'status-new';
    case 'ОПЛАЧЕН':
      return 'status-paid';
    case 'ВЫПОЛНЕН':
      return 'status-delivered';
    case 'ОТМЕНЁН':
      return 'status-cancelled';
    default:
      return '';
  }
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.orders-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.orders-filters {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

.loading, .error, .empty {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.error {
  color: #dc3545;
}

.empty {
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

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.order-info h3 {
  margin: 0 0 0.25rem 0;
}

.order-date {
  color: #6c757d;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-new {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-paid {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-delivered {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.order-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.order-items {
  flex: 1;
}

.order-item-preview {
  margin-bottom: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.item-name {
  color: #333;
}

.item-quantity {
  color: #6c757d;
}

.more-items {
  color: #6c757d;
  font-size: 0.9rem;
  font-style: italic;
}

.order-total {
  text-align: right;
  min-width: 150px;
}

.total-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.total-amount {
  font-size: 1.25rem;
  font-weight: bold;
  color: #28a745;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.page-info {
  font-weight: 500;
}
</style>