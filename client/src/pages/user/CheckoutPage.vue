<template>
  <div class="checkout-page">
    <h2>Оформление заказа</h2>

    <div v-if="cartStore.isEmpty" class="empty-cart">
      <p>Ваша корзина пуста</p>
      <router-link to="/main">
        <BaseButton variant="primary">Перейти в каталог</BaseButton>
      </router-link>
    </div>

    <div v-else class="checkout-content">
      <div class="checkout-layout">
        <!-- Информация о товарах -->
        <div class="cart-summary">
          <h3>Товары в заказе</h3>
          <div class="cart-items-list">
            <div v-for="item in cartStore.items" :key="item.productId" class="checkout-item">
              <div class="item-image">
                <img :src="getProductImage(item.product)" :alt="item.product.name">
              </div>
              <div class="item-details">
                <h4>{{ item.product.name }}</h4>
                <div class="item-price">{{ formatPrice(item.product.price) }} ₽ × {{ item.quantity }} шт.</div>
                <div class="item-total">{{ formatPrice(item.itemTotal) }} ₽</div>
              </div>
            </div>
          </div>
          <div class="cart-total">
            <div class="total-row">
              <span>Итого:</span>
              <span class="total-amount">{{ formatPrice(cartStore.cartTotalPrice) }} ₽</span>
            </div>
          </div>
        </div>

        <!-- Форма оформления заказа -->
        <div class="checkout-form">
          <form @submit.prevent="handleSubmit">
            <!-- Данные доставки -->
            <div class="form-section">
              <h3>Данные доставки</h3>

              <BaseInput
                  id="deliveryAddress"
                  label="Адрес доставки *"
                  v-model="form.deliveryInfo.address"
                  placeholder="Улица, дом, квартира"
                  required
                  :error="formErrors.deliveryAddress"
              />

              <div class="form-group">
                <label for="deliveryTime">Время доставки *</label>
                <input
                    id="deliveryTime"
                    type="datetime-local"
                    v-model="form.deliveryInfo.deliveryTime"
                    required
                    class="datetime-input"
                    :min="minDeliveryDate"
                />
                <div v-if="formErrors.deliveryTime" class="input-error">{{ formErrors.deliveryTime }}</div>
              </div>

              <BaseInput
                  id="courierNotes"
                  label="Примечания для курьера"
                  v-model="form.deliveryInfo.courierNotes"
                  placeholder="Например: позвонить заранее"
                  type="textarea"
              />
            </div>

            <!-- Данные оплаты -->
            <div class="form-section">
              <h3>Данные оплаты</h3>

              <BaseInput
                  id="cardNumber"
                  label="Номер карты *"
                  v-model="form.paymentInfo.cardNumber"
                  placeholder="0000 0000 0000 0000"
                  required
                  :error="formErrors.cardNumber"
                  @input="formatCardNumber"
              />

              <div class="payment-row">
                <div class="payment-field">
                  <BaseInput
                      id="expirationDate"
                      label="Срок действия *"
                      v-model="form.paymentInfo.expirationDate"
                      placeholder="MM/YY"
                      required
                      :error="formErrors.expirationDate"
                      @input="formatExpirationDate"
                  />
                </div>
                <div class="payment-field">
                  <BaseInput
                      id="cvc"
                      label="CVC/CVV *"
                      v-model="form.paymentInfo.cvc"
                      placeholder="123"
                      type="password"
                      maxlength="3"
                      required
                      :error="formErrors.cvc"
                  />
                </div>
              </div>
            </div>

            <!-- Согласие с условиями -->
            <div class="form-section">
              <div class="checkbox-group">
                <input
                    type="checkbox"
                    id="terms"
                    v-model="form.acceptTerms"
                    required
                    class="checkbox-input"
                />
                <label for="terms" class="checkbox-label">
                  Я согласен с условиями покупки и политикой конфиденциальности
                </label>
                <div v-if="formErrors.acceptTerms" class="input-error">{{ formErrors.acceptTerms }}</div>
              </div>
            </div>

            <div v-if="ordersStore.error" class="form-error">
              {{ ordersStore.error }}
            </div>

            <div class="form-actions">
              <router-link to="/cart">
                <BaseButton variant="outline" type="button">Вернуться в корзину</BaseButton>
              </router-link>

              <BaseButton
                  type="submit"
                  :disabled="ordersStore.isLoading || !form.acceptTerms"
                  variant="primary"
                  class="submit-button"
              >
                {{ ordersStore.isLoading ? 'Оформление...' : 'Оформить заказ' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../../stores/cart.js';
import { useOrdersStore } from '../../stores/orders.js';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const router = useRouter();
const cartStore = useCartStore();
const ordersStore = useOrdersStore();

const imagePlaceholder = '/src/uploads/product_placeholder.png';

const form = reactive({
  deliveryInfo: {
    address: '',
    deliveryTime: '',
    courierNotes: ''
  },
  paymentInfo: {
    cardNumber: '',
    expirationDate: '',
    cvc: ''
  },
  acceptTerms: false
});

const formErrors = ref({});

const minDeliveryDate = computed(() => {
  const now = new Date();
  now.setHours(now.getHours() + 2); // Минимум через 2 часа
  return now.toISOString().slice(0, 16);
});

const validateForm = () => {
  const errors = {};

  // Валидация адреса
  if (!form.deliveryInfo.address.trim()) {
    errors.deliveryAddress = 'Обязательное поле';
  }

  // Валидация времени доставки
  if (!form.deliveryInfo.deliveryTime) {
    errors.deliveryTime = 'Обязательное поле';
  } else {
    const deliveryDate = new Date(form.deliveryInfo.deliveryTime);
    const minDate = new Date(minDeliveryDate.value);
    if (deliveryDate < minDate) {
      errors.deliveryTime = 'Время доставки должно быть не раньше чем через 2 часа';
    }
  }

  // Валидация номера карты
  const cardNumber = form.paymentInfo.cardNumber.replace(/\s/g, '');
  if (!cardNumber) {
    errors.cardNumber = 'Обязательное поле';
  } else if (!/^\d{16}$/.test(cardNumber)) {
    errors.cardNumber = 'Номер карты должен содержать 16 цифр';
  }

  // Валидация срока действия
  if (!form.paymentInfo.expirationDate) {
    errors.expirationDate = 'Обязательное поле';
  } else if (!/^\d{2}\/\d{2}$/.test(form.paymentInfo.expirationDate)) {
    errors.expirationDate = 'Формат: MM/YY';
  } else {
    const [month, year] = form.paymentInfo.expirationDate.split('/');
    const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    if (expDate < today) {
      errors.expirationDate = 'Карта просрочена';
    }
  }

  // Валидация CVC
  if (!form.paymentInfo.cvc) {
    errors.cvc = 'Обязательное поле';
  } else if (!/^\d{3}$/.test(form.paymentInfo.cvc)) {
    errors.cvc = 'CVC должен содержать 3 цифры';
  }

  // Валидация согласия
  if (!form.acceptTerms) {
    errors.acceptTerms = 'Необходимо согласие с условиями';
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const formatCardNumber = () => {
  let value = form.paymentInfo.cardNumber.replace(/\D/g, '');
  value = value.substring(0, 16);
  const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
  form.paymentInfo.cardNumber = formatted;
};

const formatExpirationDate = () => {
  let value = form.paymentInfo.expirationDate.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  form.paymentInfo.expirationDate = value;
};

const getProductImage = (product) => {
  return product.images && product.images.length > 0 ? product.images[0] : imagePlaceholder;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  ordersStore.clearError();

  // Сначала создаем заказ
  const orderResult = await ordersStore.createOrderFromCart();

  if (!orderResult.success) {
    return;
  }

  const orderId = orderResult.order._id;

  // Обновляем заказ с данными доставки и оплаты
  const updateData = {
    deliveryInfo: {
      address: form.deliveryInfo.address.trim(),
      deliveryTime: new Date(form.deliveryInfo.deliveryTime).toISOString(),
      courierNotes: form.deliveryInfo.courierNotes.trim()
    },
    paymentInfo: {
      cardNumber: form.paymentInfo.cardNumber.replace(/\s/g, ''),
      cvc: form.paymentInfo.cvc,
      expirationDate: form.paymentInfo.expirationDate
    }
  };

  const updateResult = await ordersStore.updateOrder(orderId, updateData);

  if (!updateResult.success) {
    return;
  }

  // Оплачиваем заказ
  const paymentData = {
    cardNumber: form.paymentInfo.cardNumber.replace(/\s/g, ''),
    cvc: form.paymentInfo.cvc,
    expirationDate: form.paymentInfo.expirationDate
  };

  const paymentResult = await ordersStore.payOrder(orderId, paymentData);

  if (paymentResult.success) {
    // Очищаем корзину после успешного оформления
    await cartStore.clearCart();

    // Перенаправляем на страницу заказа
    router.push(`/orders/${orderId}`);
  }
};

onMounted(() => {
  if (!cartStore.cart) {
    cartStore.loadCart();
  }
});
</script>

<style scoped>
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

@media (max-width: 900px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}

.cart-summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  align-self: flex-start;
}

.checkout-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #dee2e6;
}

.checkout-item:last-child {
  border-bottom: none;
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

.item-price {
  color: #6c757d;
  font-size: 0.9rem;
}

.item-total {
  font-weight: bold;
  margin-top: 0.25rem;
}

.cart-total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #dee2e6;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: bold;
}

.total-amount {
  color: #28a745;
}

.checkout-form {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h3 {
  margin-bottom: 1rem;
  color: #333;
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

.datetime-input:focus {
  outline: none;
  border-color: #007bff;
}

.payment-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.payment-field {
  flex: 1;
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.checkbox-input {
  margin-top: 0.25rem;
}

.checkbox-label {
  font-size: 0.9rem;
  line-height: 1.4;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-button {
  flex: 1;
  max-width: 200px;
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
</style>