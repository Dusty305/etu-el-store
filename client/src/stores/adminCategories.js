import { defineStore } from 'pinia';
import { ref } from 'vue';
import { adminCategoriesAPI } from '../api/admin.js';

export const useAdminCategoriesStore = defineStore('adminCategories', () => {
    const categories = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const loadCategories = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await adminCategoriesAPI.getCategoryTree();
            categories.value = response.categories;
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка загрузки категорий';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const createCategory = async (categoryData) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await adminCategoriesAPI.createCategory(categoryData);
            // После создания перезагружаем дерево категорий
            await loadCategories();
            return { success: true, category: response.category };
        } catch (err) {
            error.value = err.message || 'Ошибка создания категории';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const updateCategory = async (categoryId, categoryData) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await adminCategoriesAPI.updateCategory(categoryId, categoryData);
            // После обновления перезагружаем дерево категорий
            await loadCategories();
            return { success: true, category: response.category };
        } catch (err) {
            error.value = err.message || 'Ошибка обновления категории';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const deleteCategory = async (categoryId) => {
        isLoading.value = true;
        error.value = null;

        try {
            await adminCategoriesAPI.deleteCategory(categoryId);
            // После удаления перезагружаем дерево категорий
            await loadCategories();
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка удаления категории';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const clearError = () => {
        error.value = null;
    };

    return {
        categories,
        isLoading,
        error,
        loadCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        clearError
    };
});