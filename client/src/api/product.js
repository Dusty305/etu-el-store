import { SERVER_ADDRESS, handleResponse } from "./utils.js";

export const API_BASE = 'api/product';


export const productAPI = {
    async getAllProducts() {
        const response = await fetch(`${SERVER_ADDRESS}/${API_BASE}/all`);
        return handleResponse(response);
    }
};