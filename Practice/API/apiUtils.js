const { request } = require('@playwright/test');

class APIUtils {
    constructor(apiRequest) {
        this.api = apiRequest;
    }

    async post(url, data, token) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await this.api.post(url, { data, headers });
        return response;
    }

    async get(url, token) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await this.api.get(url, { headers });
        return response;
    }

    async put(url, data, token) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await this.api.put(url, { data, headers });
        return response;
    }

    async delete(url, token) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await this.api.delete(url, { headers });
        return response;
    }
}

module.exports = APIUtils;
