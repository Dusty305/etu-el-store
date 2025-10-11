import { defineStore } from 'pinia';
import { authAPI } from '../api/auth.js';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isLoading: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
        isAdmin: (state) => state.user?.role === 'АДМИНИСТРАТОР',
        userInfo: (state) => state.user
    },

    actions: {
        async login(credentials) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await authAPI.login(credentials);
                this.user = response.user;
                return { success: true };
            } catch (error) {
                this.error = error.message || 'Ошибка входа';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async register(userData) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await authAPI.register(userData);
                this.user = response.user;
                return { success: true };
            } catch (error) {
                this.error = error.message || 'Ошибка регистрации';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async logout() {
            this.isLoading = true;

            try {
                await authAPI.logout();
                this.user = null;
                this.error = null;
                return { success: true };
            } catch (error) {
                this.error = error.message || 'Ошибка выхода';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async checkAuth() {
            this.isLoading = true;

            try {
                const response = await authAPI.getCurrentUser();
                this.user = response.user;
                return { success: true };
            } catch (error) {
                this.user = null;
                return { success: false };
            } finally {
                this.isLoading = false;
            }
        },

        clearError() {
            this.error = null;
        }
    }
});