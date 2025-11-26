// src/api/admin.js
import { SERVER_ADDRESS, handleResponse } from "./utils.js";

export const API_BASE = 'api/admin';

export const adminAPI = {
    async getUsers(page = 1, limit = 10, search = '') {
        const params = new URLSearchParams({ page, limit, search });
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/users?${params}`, {
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async updateUserRole(userId, role) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/users/${userId}/role`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role }),
            credentials: 'include'
        });
        return handleResponse(response);
    }
};

export const adminCategoriesAPI = {
    async createCategory(categoryData) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async updateCategory(categoryId, categoryData) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async deleteCategory(categoryId) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/categories/${categoryId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async getCategoryTree() {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/categories/tree`, {
            credentials: 'include'
        });
        return handleResponse(response);
    }
};