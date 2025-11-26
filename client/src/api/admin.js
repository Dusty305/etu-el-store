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