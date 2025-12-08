import { SERVER_ADDRESS, handleResponse } from "./utils.js";

export const API_BASE = 'api/product';

const handle_fetch = async (req) => {
    const response = await fetch(`${SERVER_ADDRESS}/${req}`);
    return handleResponse(response);
}

export const productAPI = {
    async getAllProducts() { return handle_fetch(`${API_BASE}/all`) },

    async getOneProduct(productId) { return handle_fetch(`${API_BASE}/id/${productId}`) },

    async getProductsFromCategories(categories) {
        return handle_fetch(`${API_BASE}/search?c=${categories.join(',')}`)
    },

    async findProducts(searchString, categories) {
        return handle_fetch(`${API_BASE}/search?w=${searchString}&c=${categories.join(',')}`)
    },
};