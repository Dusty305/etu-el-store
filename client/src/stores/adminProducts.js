import { defineStore } from 'pinia';
import { ref } from 'vue';
import { adminProductsAPI } from '../api/admin.js';

export const useAdminProductsStore = defineStore('adminProducts', () => {
    const products = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const loadProducts = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await adminProductsAPI.getProducts();
            products.value = response.products;
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка загрузки товаров';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const loadOneProduct = async (productId) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await adminProductsAPI.getOneProduct(productId);
            return { success: true, product: response.product };
        } catch (err) {
            error.value = err.message || 'Ошибка загрузки товаров';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const createProduct = async (productData) => {
        isLoading.value = true;
        error.value = null;

        try {
            const images = productData.images;
            delete productData.images;

            const response = await adminProductsAPI.createProduct(productData);
            const response2 = await adminProductsAPI.uploadImages(response.productId, images);
            await adminProductsAPI.updateProduct(response.productId, { images: response2.files })
            await loadProducts();
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка создания товара';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const updateProduct = async (productId, productData) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await adminProductsAPI.updateProduct(productId, productData);
            await loadProducts();
            return { success: true, product: response.product };
        } catch (err) {
            error.value = err.message || 'Ошибка обновления товара';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const deleteProduct = async (productId) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await adminProductsAPI.deleteProduct(productId);
            await adminProductsAPI.deleteImages(response.productId);
            await loadProducts();
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка удаления товара';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const clearError = () => {
        error.value = null;
    };

    return {
        products,
        isLoading,
        error,
        loadProducts,
        loadOneProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        clearError
    };
});