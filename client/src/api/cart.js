import { SERVER_ADDRESS, handleResponse } from "./utils.js";

export const API_BASE = 'api/cart';

export const cartAPI = {
    async getCart() {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}`, {
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async addToCart(productId, quantity = 1) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, quantity }),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async updateCartItem(productId, quantity) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity }),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async removeFromCart(productId) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async clearCart() {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return handleResponse(response);
    }
};