<template>
  <div class="order-details-page">
    <div v-if="ordersStore.isLoading && !ordersStore.currentOrder" class="loading">
      <div class="spinner"></div>
      <p>Загрузка информации о заказе...</p>
    </div>

    <div v-else-if="ordersStore.error" class="error">
      <p>❌ {{ ordersStore.error }}</p>
      <BaseButton @click="loadOrder" variant="outline">Повторить</BaseButton>
    </div>

    <div v-else-if="!ordersStore.currentOrder" class="not-found">
      <h2>Заказ не найден</h2>
      <p>Запрашиваемый заказ не существует или у вас нет к нему доступа.</p>
      <router-link to="/orders">
        <BaseButton variant="primary">Вернуться к заказам</BaseButton>
      </router-link>
    </div>

    <div v-else class="order-details">
      <!-- Хлебные крошки -->
      <nav class="breadcrumbs">
        <router-link to="/orders" class="breadcrumb-link">Мои заказы</router-link>
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
            <span class="total-amount">{{ formatPrice(order.totalPrice) }} ₽</span>
          </div>
        </div>
      </div>

      <!-- Действия с заказом -->
      <div v-if="canPerformActions" class="order-actions-panel">
        <template v-if="order.status === ordersStore.orderStatuses.NEW">
          <BaseButton @click="startEditing" variant="primary">
            Редактировать и оплатить
          </BaseButton>
          <BaseButton @click="handleCancel" variant="outline" class="cancel-btn">
            Отменить заказ
          </BaseButton>
        </template>

        <template v-else-if="order.status === ordersStore.orderStatuses.PAID">
          <BaseButton @click="startEditing" variant="outline">
            Изменить данные доставки
          </BaseButton>
        </template>

        <template v-else-if="order.status === ordersStore.orderStatuses.DELIVERED">
          <div class="delivered-info">
            <span>✅ Заказ доставлен</span>
          </div>
        </template>
      </div>

      <!-- Форма редактирования -->
      <div v-if="isEditing" class="edit-form-container">
        <h3>{{ order.status === ordersStore.orderStatuses.NEW ? 'Редактирование и оплата заказа' : 'Изменение данных доставки' }}</h3>

        <form @submit.prevent="handleUpdate">
          <!-- Данные доставки -->
          <div class="form-section">
            <h4>Данные доставки</h4>

            <BaseInput
                id="editAddress"
                label="Адрес доставки *"
                v-model="editForm.deliveryInfo.address"
                placeholder="Улица, дом, квартира"
                required
                :error="editErrors.address"
                :disabled="!ordersStore.canEditDelivery"
            />

            <div class="form-group">
              <label for="editDeliveryTime">Время доставки *</label>
              <input
                  id="editDeliveryTime"
                  type="datetime-local"
                  v-model="editForm.deliveryInfo.deliveryTime"
                  required
                  class="datetime-input"
                  :min="minDeliveryDate"
                  :disabled="!ordersStore.canEditDelivery"
              />
              <div v-if="editErrors.deliveryTime" class="input-error">{{ editErrors.deliveryTime }}</div>
            </div>

            <BaseInput
                id="editCourierNotes"
                label="Примечания для курьера"
                v-model="editForm.deliveryInfo.courierNotes"
                placeholder="Например: позвонить заранее"
                type="textarea"
                :disabled="!ordersStore.canEditDelivery"
            />
          </div>

          <!-- Данные оплаты (только для новых заказов) -->
          <div v-if="order.status === ordersStore.orderStatuses.NEW" class="form-section">
            <h4>Данные оплаты</h4>

            <BaseInput
                id="editCardNumber"
                label="Номер карты *"
                v-model="editForm.paymentInfo.cardNumber"
                placeholder="0000 0000 0000 0000"
                required
                :error="editErrors.cardNumber"
                @input="formatCardNumber"
            />

            <div class="payment-row">
              <div class="payment-field">
                <BaseInput
                    id="editExpirationDate"
                    label="Срок действия *"
                    v-model="editForm.paymentInfo.expirationDate"
                    placeholder="MM/YY"
                    required
                    :error="editErrors.expirationDate"
                    @input="formatExpirationDate"
                />
              </div>
              <div class="payment-field">
                <BaseInput
                    id="editCvc"
                    label="CVC/CVV *"
                    v-model="editForm.paymentInfo.cvc"
                    placeholder="123"
                    type="password"
                    maxlength="3"
                    required
                    :error="editErrors.cvc"
                />
              </div>
            </div>
          </div>

          <div v-if="updateError" class="form-error">
            {{ updateError }}
          </div>

          <div class="edit-actions">
            <BaseButton @click="cancelEditing" variant="outline" type="button">
              Отмена
            </BaseButton>

            <BaseButton
                type="submit"
                :disabled="isUpdating"
                variant="primary"
                class="submit-button"
            >
              {{ isUpdating ? 'Сохранение...' : 'Сохранить изменения' }}
            </BaseButton>

            <BaseButton
                v-if="order.status === ordersStore.orderStatuses.NEW"
                @click="handlePayOnly"
                :disabled="isUpdating"
                variant="secondary"
                class="pay-button"
            >
              Только оплатить
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Информация о заказе -->
      <div class="order-info">
        <!-- Товары в заказе -->
        <div class="order-items-section">
          <h3>Товары в заказе</h3>
          <div class="items-list">
            <div v-for="item in order.items" :key="item.productId" class="order-item">
              <div class="item-image">
                <img :src="getProductImage(item.product)" :alt="item.product?.name">
              </div>
              <div class="item-details">
                <h4>{{ item.product?.name || 'Товар' }}</h4>
                <div class="item-price">{{ formatPrice(item.product?.price || 0) }} ₽ × {{ item.quantity }} шт.</div>
                <div class="item-total">{{ formatPrice(item.itemTotal) }} ₽</div>
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
            <div v-if="order.paymentDate" class="info-row">
              <span class="info-label">Дата оплаты:</span>
              <span class="info-value">{{ formatDate(order.paymentDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrdersStore } from '../../stores/orders.js';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const ordersStore = useOrdersStore();

const isEditing = ref(false);
const isUpdating = ref(false);
const updateError = ref('');

const editForm = reactive({
  deliveryInfo: {
    address: '',
    deliveryTime: '',
    courierNotes: ''
  },
  paymentInfo: {
    cardNumber: '',
    expirationDate: '',
    cvc: ''
  }
});

const editErrors = ref({});

const order = computed(() => ordersStore.currentOrder);
const orderNumber = computed(() => order.value?._id?.slice(-8).toUpperCase() || '');

const canPerformActions = computed(() => {
  if (!order.value) return false;
  const status = order.value.status;
  return status === ordersStore.orderStatuses.NEW ||
      status === ordersStore.orderStatuses.PAID;
});

const minDeliveryDate = computed(() => {
  const now = new Date();
  now.setHours(now.getHours() + 2);
  return now.toISOString().slice(0, 16);
});

const loadOrder = async () => {
  await ordersStore.loadOrder(route.params.orderId);

  if (order.value) {
    // Заполняем форму текущими значениями
    editForm.deliveryInfo = {
      address: order.value.deliveryInfo?.address || '',
      deliveryTime: order.value.deliveryInfo?.deliveryTime
          ? new Date(order.value.deliveryInfo.deliveryTime).toISOString().slice(0, 16)
          : '',
      courierNotes: order.value.deliveryInfo?.courierNotes || ''
    };

    if (order.value.paymentInfo) {
      editForm.paymentInfo.cardNumber = order.value.paymentInfo.cardNumber || '';
      editForm.paymentInfo.expirationDate = order.value.paymentInfo.expirationDate || '';
    }
  }
};

const startEditing = () => {
  isEditing.value = true;
  updateError.value = '';
};

const cancelEditing = () => {
  isEditing.value = false;
  loadOrder(); // Сбрасываем форму к исходным значениям
};

const validateEditForm = () => {
  const errors = {};

  // Валидация адреса
  if (!editForm.deliveryInfo.address.trim()) {
    errors.address = 'Обязательное поле';
  }

  // Валидация времени доставки
  if (!editForm.deliveryInfo.deliveryTime) {
    errors.deliveryTime = 'Обязательное поле';
  } else {
    const deliveryDate = new Date(editForm.deliveryInfo.deliveryTime);
    const minDate = new Date(minDeliveryDate.value);
    if (deliveryDate < minDate) {
      errors.deliveryTime = 'Время доставки должно быть не раньше чем через 2 часа';
    }
  }

  // Валидация платежных данных только для новых заказов
  if (order.value.status === ordersStore.orderStatuses.NEW) {
    const cardNumber = editForm.paymentInfo.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      errors.cardNumber = 'Обязательное поле';
    } else if (!/^\d{16}$/.test(cardNumber)) {
      errors.cardNumber = 'Номер карты должен содержать 16 цифр';
    }

    if (!editForm.paymentInfo.expirationDate) {
      errors.expirationDate = 'Обязательное поле';
    } else if (!/^\d{2}\/\d{2}$/.test(editForm.paymentInfo.expirationDate)) {
      errors.expirationDate = 'Формат: MM/YY';
    }

    if (!editForm.paymentInfo.cvc) {
      errors.cvc = 'Обязательное поле';
    } else if (!/^\d{3}$/.test(editForm.paymentInfo.cvc)) {
      errors.cvc = 'CVC должен содержать 3 цифры';
    }
  }

  editErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const formatCardNumber = () => {
  let value = editForm.paymentInfo.cardNumber.replace(/\D/g, '');
  value = value.substring(0, 16);
  const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
  editForm.paymentInfo.cardNumber = formatted;
};

const formatExpirationDate = () => {
  let value = editForm.paymentInfo.expirationDate.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  editForm.paymentInfo.expirationDate = value;
};

const handleUpdate = async () => {
  if (!validateEditForm()) return;

  isUpdating.value = true;
  updateError.value = '';

  try {
    // Подготавливаем данные для обновления
    const updateData = {
      deliveryInfo: {
        address: editForm.deliveryInfo.address.trim(),
        deliveryTime: new Date(editForm.deliveryInfo.deliveryTime).toISOString(),
        courierNotes: editForm.deliveryInfo.courierNotes.trim()
      }
    };

    // Для новых заказов добавляем данные оплаты
    if (order.value.status === ordersStore.orderStatuses.NEW) {
      updateData.paymentInfo = {
        cardNumber: editForm.paymentInfo.cardNumber.replace(/\s/g, ''),
        cvc: editForm.paymentInfo.cvc,
        expirationDate: editForm.paymentInfo.expirationDate
      };
    }

    // Обновляем заказ
    const updateResult = await ordersStore.updateOrder(order.value._id, updateData);

    if (!updateResult.success) {
      updateError.value = updateResult.error || 'Ошибка обновления заказа';
      return;
    }

    // Если заказ новый и есть данные оплаты, выполняем оплату
    if (order.value.status === ordersStore.orderStatuses.NEW && editForm.paymentInfo.cardNumber) {
      const paymentData = {
        cardNumber: editForm.paymentInfo.cardNumber.replace(/\s/g, ''),
        cvc: editForm.paymentInfo.cvc,
        expirationDate: editForm.paymentInfo.expirationDate
      };

      const paymentResult = await ordersStore.payOrder(order.value._id, paymentData);

      if (!paymentResult.success) {
        updateError.value = paymentResult.error || 'Ошибка оплаты заказа';
        return;
      }
    }

    // Успешно обновлено
    isEditing.value = false;

  } catch (error) {
    updateError.value = error.message || 'Произошла ошибка';
  } finally {
    isUpdating.value = false;
  }
};

const handlePayOnly = async () => {
  if (!validateEditForm()) return;

  isUpdating.value = true;
  updateError.value = '';

  try {
    const paymentData = {
      cardNumber: editForm.paymentInfo.cardNumber.replace(/\s/g, ''),
      cvc: editForm.paymentInfo.cvc,
      expirationDate: editForm.paymentInfo.expirationDate
    };

    const paymentResult = await ordersStore.payOrder(order.value._id, paymentData);

    if (!paymentResult.success) {
      updateError.value = paymentResult.error || 'Ошибка оплаты заказа';
      return;
    }

    isEditing.value = false;

  } catch (error) {
    updateError.value = error.message || 'Произошла ошибка';
  } finally {
    isUpdating.value = false;
  }
};

const handleCancel = async () => {
  if (!confirm('Вы уверены, что хотите отменить заказ?')) return;

  const result = await ordersStore.cancelOrder(order.value._id);

  if (result.success) {
    router.push('/orders');
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
    case 'ВЫПОЛНЕН':
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

watch(() => route.params.orderId, (newId) => {
  if (newId) {
    loadOrder();
    isEditing.value = false;
  }
});
</script>

<style scoped>
.order-details-page {
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
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.cancel-btn {
  color: #dc3545;
  border-color: #dc3545;
}

.cancel-btn:hover {
  background: #dc3545;
  color: white;
}

.delivered-info {
  color: #28a745;
  font-weight: 500;
}

.edit-form-container {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.edit-form-container h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h4 {
  margin: 0 0 1rem 0;
  color: #555;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.datetime-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.datetime-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.payment-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.payment-field {
  flex: 1;
}

.edit-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-button {
  flex: 1;
}

.pay-button {
  background: #28a745;
  border-color: #28a745;
}

.pay-button:hover {
  background: #218838;
  border-color: #1e7e34;
}

.form-error {
  color: #dc3545;
  margin: 1rem 0;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 6px;
}

.input-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.order-info {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .order-info {
    grid-template-columns: 1fr;
  }
}

.order-items-section,
.delivery-info-section,
.payment-info-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.order-items-section h3,
.delivery-info-section h3,
.payment-info-section h3 {
  margin: 0 0 1rem 0;
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
  width: 60px;
  height: 60px;
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

.item-price {
  color: #6c757d;
  font-size: 0.9rem;
}

.item-total {
  font-weight: bold;
  margin-top: 0.25rem;
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
</style>