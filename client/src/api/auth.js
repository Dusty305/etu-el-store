import { SERVER_ADDRESS, handleResponse } from "./utils.js";

export const API_BASE = 'api/auth';


export const authAPI = {
    async login(credentials) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include'
        });

        return handleResponse(response);
    },

    async register(userData) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            credentials: 'include'
        });

        return handleResponse(response);
    },

    async logout() {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        return handleResponse(response);
    },

    async getCurrentUser() {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/me`, {
            credentials: 'include'
        });

        return handleResponse(response);
    }
};