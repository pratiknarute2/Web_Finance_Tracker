const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility.js');
const { API_URL } = require('../playwright.config.js'); // Import dynamic API_URL

class Put extends Utility {
    constructor(request) {
        super(request);
        this.request = request;
    }

    async updateCategoriesAPI(transactionType) {
        if (!global.categoryId) {
            throw new Error('❌ categoryId is not set. Create a category first!');
        }

        const categoryResponse = await this.putRequest(
            this.request,
            `${API_URL}/api/categories/${global.categoryId}`, // ✅ dynamic URL
            `Categories_Update`,
            `Update Categories API for ${transactionType}`
        );

        expect(categoryResponse.type).toBe(transactionType);
        console.log(`✅ Updated category ID: ${global.categoryId} with type: ${transactionType}`);
    }

    async updateTransactionAPI(transactionType) {
        if (!global.transactionId) {
            throw new Error('❌ transactionId is not set. Create a transaction first!');
        }

        const transactionResponse = await this.putRequest(
            this.request,
            `${API_URL}/api/transactions/${global.transactionId}`, // ✅ dynamic URL
            `Transaction_update`,
            `Update Transaction API for ${transactionType}`
        );

        expect(transactionResponse.type).toBe(transactionType);
        console.log(`✅ Updated transaction ID: ${global.transactionId} with type: ${transactionType}`);
    }
}

module.exports = Put;
