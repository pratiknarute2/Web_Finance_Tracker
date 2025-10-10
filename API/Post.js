const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility.js');
const { API_URL } = require('../playwright.config.js'); // Import dynamic API_URL

class Post extends Utility {
    constructor(request) {
        super(request);
        this.request = request;
    }

    async postLoginAPI() {
        const loginResponse = await this.postRequest(
            this.request,
            `${API_URL}/api/auth/login`, // ✅ Use dynamic URL
            'Login',
            'Post Login API'
        );
        expect(loginResponse.message).toBe('Logged in successfully');

        global.token = loginResponse.token;
        console.log('🔑 Global token set:', global.token);
        return loginResponse;
    }

    async postCategoriesAPI(transactionType) {
        const categoryResponse = await this.postRequest(
            this.request,
            `${API_URL}/api/categories`,
            `Categories_${transactionType}`,
            `Post Categories API for ${transactionType}`
        );

        expect(categoryResponse.type).toBe(transactionType);
        global.categoryId = categoryResponse.id;
        console.log('🔑 Global category ID set:', global.categoryId);

        return categoryResponse;
    }

    async postTransactionAPI(transactionType) {
        const transactionResponse = await this.postRequest(
            this.request,
            `${API_URL}/api/transactions`,
            `Transaction_${transactionType}`,
            `Post Transaction API for ${transactionType}`
        );

        global.transactionId = transactionResponse.id;
        console.log('🔑 Global Transaction ID set:', global.transactionId);
        return transactionResponse;
    }
}

module.exports = Post;
