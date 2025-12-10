import { SERVER_ADDRESS, handleResponse } from "./utils.js";

export const API_BASE = 'api/orders';

export const ordersAPI = {
    async createOrder(orderData) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async getOrders(page = 1, limit = 10, status = '') {
        const params = new URLSearchParams({ page, limit });
        if (status) params.append('status', status);

        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}?${params}`, {
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async getOrder(orderId) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/${orderId}`, {
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async updateOrder(orderId, orderData) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async payOrder(orderId, paymentData) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/${orderId}/pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async cancelOrder(orderId) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/${orderId}/cancel`, {
            method: 'POST',
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async deliverOrder(orderId) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/${orderId}/deliver`, {
            method: 'POST',
            credentials: 'include'
        });
        return handleResponse(response);
    }
};