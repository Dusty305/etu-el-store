import { defineStore } from 'pinia';
import { productAPI } from '../api/product.js';
import { ref, computed } from 'vue';

export const useProductStore = defineStore('product', () => {
    // Состояние (state)
    const products = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    // Геттеры (getters)

    // Действия (actions)
    const getAllProducts = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await productAPI.getAllProducts();
            products.value = response.products;
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка получения товаров';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const getOneProduct = async (productId) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await productAPI.getOneProduct(productId);
            return { success: true, value: response.product };
        } catch (err) {
            error.value = err.message || `Ошибка получения товара с идентификатором ${productId}`;
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const getProductsFromCategories = async (categoriesId) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await productAPI.getProductsFromCategories(categoriesId);
            return { success: true, value: response.products };
        } catch (err) {
            error.value = err.message || `Ошибка получения товаров из категории ${categoriesId}`;
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const findProducts = async (searchString, categoriesId) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await productAPI.findProducts(searchString, categoriesId);
            return { success: true, value: response.products };
        } catch (err) {
            error.value = err.message || `Ошибка получения товаров по запросу ${searchString}`;
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    }

    return {
        // state
        isLoading,
        error,
        products,

        // getters

        // actions
        getAllProducts,
        getOneProduct,
        getProductsFromCategories,
        findProducts
    };
});