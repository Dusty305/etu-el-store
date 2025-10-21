import { defineStore } from 'pinia';
import { authAPI } from '../api/auth.js';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // Состояние (state)
    const user = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    // Геттеры (getters)
    const isAuthenticated = computed(() => !!user.value);
    const isAdmin = computed(() => user.value?.role === 'АДМИНИСТРАТОР');
    const userInfo = computed(() => user.value);

    // Действия (actions)
    const login = async (credentials) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await authAPI.login(credentials);
            user.value = response.user;
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка входа';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const register = async (userData) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await authAPI.register(userData);
            user.value = response.user;
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка регистрации';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const logout = async () => {
        isLoading.value = true;

        try {
            await authAPI.logout();
            user.value = null;
            error.value = null;
            return { success: true };
        } catch (err) {
            error.value = err.message || 'Ошибка выхода';
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const checkAuth = async () => {
        isLoading.value = true;

        try {
            const response = await authAPI.getCurrentUser();
            user.value = response.user;
            return { success: true };
        } catch (err) {
            user.value = null;
            return { success: false };
        } finally {
            isLoading.value = false;
        }
    };

    const clearError = () => {
        error.value = null;
    };

    return {
        // state
        user,
        isLoading,
        error,

        // getters
        isAuthenticated,
        isAdmin,
        userInfo,

        // actions
        login,
        register,
        logout,
        checkAuth,
        clearError
    };
});