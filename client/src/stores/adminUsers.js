// src/stores/adminUsers.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { adminAPI } from '../api/admin.js';

export const useAdminUsersStore = defineStore('adminUsers', () => {
    const users = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const pagination = ref({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10
    });
    const searchQuery = ref('');

    const loadUsers = async (page = 1, limit = 10, search = '') => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await adminAPI.getUsers(page, limit, search);
            users.value = response.users;
            pagination.value = {
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                total: response.total,
                limit: limit
            };
            searchQuery.value = search;
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка загрузки пользователей';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const updateRole = async (userId, role) => {
        try {
            const response = await adminAPI.updateUserRole(userId, role);

            // Обновляем пользователя в локальном состоянии
            const userIndex = users.value.findIndex(user => user._id === userId);
            if (userIndex !== -1) {
                users.value[userIndex] = response.user;
            }

            return { success: true, user: response.user };
        } catch (err) {
            error.value = err.message || 'Ошибка обновления роли';
            return { success: false, error: error.value };
        }
    };

    const clearError = () => {
        error.value = null;
    };

    return {
        users,
        isLoading,
        error,
        pagination,
        searchQuery,
        loadUsers,
        updateRole,
        clearError
    };
});