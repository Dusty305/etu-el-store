import { defineStore } from 'pinia';
import { ref } from 'vue';
import { adminOrdersAPI } from '../api/admin.js';

export const useAdminOrdersStore = defineStore('adminOrders', () => {
    const orders = ref([]);
    const currentOrder = ref(null);
    const isLoading = ref(false);
    const error = ref(null);
    const pagination = ref({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 20
    });

    const loadOrders = async (page = 1, limit = 20, status = '', userId = '') => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await adminOrdersAPI.getOrders(page, limit, status, userId);
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
            const response = await adminOrdersAPI.getOrder(orderId);
            currentOrder.value = response.order;
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка загрузки заказа';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await adminOrdersAPI.updateOrderStatus(orderId, status);

            // Обновляем заказ в списке
            const orderIndex = orders.value.findIndex(order => order._id === orderId);
            if (orderIndex !== -1) {
                orders.value[orderIndex] = response.order;
            }

            // Обновляем текущий заказ
            if (currentOrder.value && currentOrder.value._id === orderId) {
                currentOrder.value = response.order;
            }

            return { success: true, order: response.order };
        } catch (err) {
            error.value = err.message || 'Ошибка обновления статуса заказа';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const deliverOrder = async (orderId) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await adminOrdersAPI.deliverOrder(orderId);

            // Обновляем заказ в списке
            const orderIndex = orders.value.findIndex(order => order._id === orderId);
            if (orderIndex !== -1) {
                orders.value[orderIndex].status = 'ДОСТАВЛЕН';
            }

            // Обновляем текущий заказ
            if (currentOrder.value && currentOrder.value._id === orderId) {
                currentOrder.value.status = 'ДОСТАВЛЕН';
            }

            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка отметки заказа как доставленного';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const clearError = () => {
        error.value = null;
    };

    return {
        orders,
        currentOrder,
        isLoading,
        error,
        pagination,
        loadOrders,
        loadOrder,
        updateOrderStatus,
        deliverOrder,
        clearError
    };
});