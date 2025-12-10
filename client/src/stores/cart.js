import { defineStore } from 'pinia';
import { cartAPI } from '../api/cart.js';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {
    const cart = ref(null);
    const isLoading = ref(false);
    const error = ref(null);
    const totalPrice = ref(0);

    const items = computed(() => cart.value?.items || []);
    const isEmpty = computed(() => items.value.length === 0);
    const totalItems = computed(() => cart.value?.totalItems || 0);
    const cartTotalPrice = computed(() => cart.value?.totalPrice || 0);
    const cartCount = computed(() => items.value.length);

    const loadCart = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await cartAPI.getCart();
            cart.value = response;
            cartCount.value = response.totalItems;
            totalPrice.value = response.totalPrice;
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка загрузки корзины';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await cartAPI.addToCart(productId, quantity);
            await loadCart(); // Обновляем корзину после добавления
            return { success: true, data: response };
        } catch (err) {
            error.value = err.message || 'Ошибка добавления в корзину';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const updateCartItem = async (productId, quantity) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await cartAPI.updateCartItem(productId, quantity);
            await loadCart(); // Обновляем корзину после изменения
            return { success: true, data: response };
        } catch (err) {
            error.value = err.message || 'Ошибка обновления корзины';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const removeFromCart = async (productId) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await cartAPI.removeFromCart(productId);
            await loadCart(); // Обновляем корзину после удаления
            return { success: true, data: response };
        } catch (err) {
            error.value = err.message || 'Ошибка удаления из корзины';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const clearCart = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await cartAPI.clearCart();
            cart.value = null;
            cartCount.value = 0;
            totalPrice.value = 0;
            return { success: true, data: response };
        } catch (err) {
            error.value = err.message || 'Ошибка очистки корзины';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const getCartItem = (productId) => {
        return items.value.find(item => item.productId === productId);
    };

    const clearError = () => {
        error.value = null;
    };

    return {
        cart,
        items,
        isLoading,
        error,
        cartCount,
        totalPrice,
        isEmpty,
        totalItems,
        cartTotalPrice,

        loadCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartItem,
        clearError
    };
});