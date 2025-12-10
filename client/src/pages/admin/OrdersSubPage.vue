<template>
  <div class="admin-orders-page">
    <div class="page-header">
      <h2>Управление заказами</h2>
      <p>Всего заказов: {{ adminOrdersStore.pagination.total }}</p>
    </div>

    <!-- Фильтры -->
    <div class="filters">
      <div class="filter-group">
        <label for="statusFilter">Статус:</label>
        <select id="statusFilter" v-model="statusFilter" class="filter-select">
          <option value="">Все</option>
          <option value="НОВЫЙ">Новые</option>
          <option value="ОПЛАЧЕН">Оплаченные</option>
          <option value="ДОСТАВЛЕН">Доставленные</option>
          <option value="ОТМЕНЁН">Отменённые</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="userIdFilter">ID пользователя:</label>
        <input
            id="userIdFilter"
            type="text"
            v-model="userIdFilter"
            placeholder="Введите ID пользователя"
            class="filter-input"
        />
      </div>
      <div class="filter-group">
        <BaseButton @click="applyFilters" variant="primary">Применить</BaseButton>
        <BaseButton @click="resetFilters" variant="outline">Сбросить</BaseButton>
      </div>
    </div>

    <!-- Таблица заказов -->
    <div v-if="adminOrdersStore.isLoading && adminOrdersStore.orders.length === 0" class="loading">
      <div class="spinner"></div>
      <p>Загрузка заказов...</p>
    </div>

    <div v-else-if="adminOrdersStore.error" class="error">
      <p>❌ {{ adminOrdersStore.error }}</p>
      <BaseButton @click="loadOrders" variant="outline">Повторить</BaseButton>
    </div>

    <div v-else-if="adminOrdersStore.orders.length === 0" class="empty">
      <p>📭 Заказы не найдены</p>
    </div>

    <div v-else class="orders-table">
      <table class="table">
        <thead>
        <tr>
          <th>ID заказа</th>
          <th>Пользователь</th>
          <th>Дата создания</th>
          <th>Статус</th>
          <th>Сумма</th>
          <th>Действия</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="order in adminOrdersStore.orders" :key="order._id" class="order-row">
          <td class="order-id">{{ order._id }}</td>
          <td class="order-user">
            <div>{{ order.userId?.displayName }}</div>
            <div class="user-email">{{ order.userId?.email }}</div>
          </td>
          <td class="order-date">{{ formatDate(order.createdAt) }}</td>
          <td class="order-status">
              <span :class="['status-badge', getStatusClass(order.status)]">
                {{ order.status }}
              </span>
          </td>
          <td class="order-total">{{ formatPrice(order.totalAmount) }} ₽</td>
          <td class="order-actions">
            <router-link :to="`/admin/orders/${order._id}`">
              <BaseButton variant="outline" size="small">Просмотр</BaseButton>
            </router-link>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Пагинация -->
    <div v-if="adminOrdersStore.pagination.totalPages > 1" class="pagination">
      <BaseButton
          @click="changePage(adminOrdersStore.pagination.currentPage - 1)"
          :disabled="adminOrdersStore.pagination.currentPage === 1"
          variant="outline"
      >
        Назад
      </BaseButton>

      <span class="page-info">
        Страница {{ adminOrdersStore.pagination.currentPage }} из {{ adminOrdersStore.pagination.totalPages }}
      </span>

      <BaseButton
          @click="changePage(adminOrdersStore.pagination.currentPage + 1)"
          :disabled="adminOrdersStore.pagination.currentPage === adminOrdersStore.pagination.totalPages"
          variant="outline"
      >
        Вперед
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAdminOrdersStore } from '../../stores/adminOrders.js';
import BaseButton from '../../components/ui/BaseButton.vue';

const adminOrdersStore = useAdminOrdersStore();

const statusFilter = ref('');
const userIdFilter = ref('');

const loadOrders = (page = 1) => {
  adminOrdersStore.loadOrders(page, 20, statusFilter.value, userIdFilter.value);
};

const applyFilters = () => {
  loadOrders(1);
};

const resetFilters = () => {
  statusFilter.value = '';
  userIdFilter.value = '';
  loadOrders(1);
};

const changePage = (page) => {
  if (page >= 1 && page <= adminOrdersStore.pagination.totalPages) {
    loadOrders(page);
  }
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
    case 'ДОСТАВЛЕН':
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
.admin-orders-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #333;
}

.filter-select, .filter-input {
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

.orders-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
}

.order-row:hover {
  background: #f8f9fa;
}

.order-id {
  font-family: monospace;
  font-size: 0.9rem;
  color: #666;
}

.order-user .user-email {
  font-size: 0.875rem;
  color: #6c757d;
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
  font-weight: bold;
  color: #28a745;
}

.order-actions {
  white-space: nowrap;
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