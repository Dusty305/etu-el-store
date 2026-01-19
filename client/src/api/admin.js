// src/api/admin.js
import { productAPI } from "./product.js";
import { SERVER_ADDRESS, handleResponse } from "./utils.js";

export const API_BASE = 'api/admin';
export const API_BASE_FILES = 'api/files';

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

export const adminOrdersAPI = {
    async getOrders(page = 1, limit = 20, status = '', userId = '') {
        const params = new URLSearchParams({ page, limit });
        if (status) params.append('status', status);
        if (userId) params.append('userId', userId);

        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/orders?${params}`, {
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async getOrder(orderId) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/orders/${orderId}`, {
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async updateOrderStatus(orderId, status) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async deliverOrder(orderId) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/orders/${orderId}/deliver`, {
            method: 'POST',
            credentials: 'include'
        });
        return handleResponse(response);
    }
};

export const adminProductsAPI = {
    async getProducts(searchString) {
        return searchString
            ? await productAPI.findProducts(searchString)
            : await productAPI.getAllProducts();
    },

    async getOneProduct(productId) {
        return productAPI.getOneProduct(productId)
    },

    async createProduct(productData) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
            credentials: 'include'
        });

        return handleResponse(response);
    },

    async uploadImages(productId, images) {
        const formData = new FormData();

        images.forEach(img => {
            formData.append('images', img.file);
        });
        
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE_FILES}/products/${productId}/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })

        return handleResponse(response);
    },

    async updateProduct(productId, productData) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async deleteProduct(productId) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return handleResponse(response);
    },

    async deleteImages(productId) {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE_FILES}/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return handleResponse(response);
    }
}