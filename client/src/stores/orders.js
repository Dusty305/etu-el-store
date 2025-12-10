import { defineStore } from 'pinia';
import { ordersAPI } from '../api/orders.js';
import { ref, computed } from 'vue';

export const useOrdersStore = defineStore('orders', () => {
    const orders = ref([]);
    const currentOrder = ref(null);
    const isLoading = ref(false);
    const error = ref(null);
    const pagination = ref({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10
    });

    const orderStatuses = {
        NEW: 'НОВЫЙ',
        PAID: 'ОПЛАЧЕН',
        DELIVERED: 'ВЫПОЛНЕН',
        CANCELLED: 'ОТМЕНЁН'
    };

    const loadOrders = async (page = 1, limit = 10, status = '') => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await ordersAPI.getOrders(page, limit, status);
            orders.value = response.orders;
            pagination.value = {
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                total: response.total,
                limit: limit
            };
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка загрузки заказов';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const loadOrder = async (orderId) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await ordersAPI.getOrder(orderId);
            currentOrder.value = response.order;
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка загрузки заказа';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const createOrderFromCart = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await ordersAPI.createOrder({});
            return { success: true, order: response.order };
        } catch (err) {
            error.value = err.message || 'Ошибка создания заказа';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const updateOrder = async (orderId, orderData) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await ordersAPI.updateOrder(orderId, orderData);
            // Обновляем заказ в локальном состоянии
            if (currentOrder.value && currentOrder.value._id === orderId) {
                currentOrder.value = response.order;
            }
            return { success: true, order: response.order };
        } catch (err) {
            error.value = err.message || 'Ошибка обновления заказа';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const payOrder = async (orderId, paymentData) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await ordersAPI.payOrder(orderId, paymentData);
            // Обновляем заказ в локальном состоянии
            if (currentOrder.value && currentOrder.value._id === orderId) {
                currentOrder.value = response.order;
            }
            return { success: true, order: response.order };
        } catch (err) {
            error.value = err.message || 'Ошибка оплаты заказа';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const cancelOrder = async (orderId) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await ordersAPI.cancelOrder(orderId);
            // Обновляем заказ в локальном состоянии
            if (currentOrder.value && currentOrder.value._id === orderId) {
                currentOrder.value = response.order;
            }
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка отмены заказа';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const clearError = () => {
        error.value = null;
    };

    const canEditOrder = computed(() => {
        if (!currentOrder.value) return false;

        const status = currentOrder.value.status;
        return status === orderStatuses.NEW || status === orderStatuses.PAID;
    });

    const canEditDelivery = computed(() => {
        if (!currentOrder.value) return false;

        const status = currentOrder.value.status;
        return status === orderStatuses.NEW || status === orderStatuses.PAID;
    });

    const canEditPayment = computed(() => {
        if (!currentOrder.value) return false;

        return currentOrder.value.status === orderStatuses.NEW;
    });

    const canCancelOrder = computed(() => {
        if (!currentOrder.value) return false;

        return currentOrder.value.status === orderStatuses.NEW;
    });

    return {
        orders,
        currentOrder,
        isLoading,
        error,
        pagination,
        orderStatuses,
        loadOrders,
        loadOrder,
        createOrderFromCart,
        updateOrder,
        payOrder,
        cancelOrder,
        clearError,
        canEditOrder,
        canEditDelivery,
        canEditPayment,
        canCancelOrder
    };
});