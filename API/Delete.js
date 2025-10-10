const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility.js');
const { API_URL } = require('../playwright.config.js'); // Import dynamic API_URL

class Delete extends Utility {
    constructor(request) {
        super(request);
        this.request = request;
    }

    async deleteCategoriesAPI(transactionType) {
        if (!global.categoryId) {
            throw new Error('❌ categoryId is not set. Create a category first!');
        }

        const deleteResponse = await this.deleteRequest(
            this.request,
            `${API_URL}/api/categories/${global.categoryId}`, // ✅ dynamic URL
            `Delete Categories API for ${transactionType}`
        );

        console.log(`✅ Deleted category ID: ${global.categoryId} for type: ${transactionType}`);
        return deleteResponse;
    }

    async deleteTransactionAPI(transactionType) {
        if (!global.transactionId) {
            throw new Error('❌ transactionId is not set. Create a transaction first!');
        }

        const deleteResponse = await this.deleteRequest(
            this.request,
            `${API_URL}/api/transactions/${global.transactionId}`, // ✅ dynamic URL
            `Delete Transaction API for ${transactionType}`
        );

        console.log(`✅ Deleted transaction ID: ${global.transactionId} for type: ${transactionType}`);
        return deleteResponse;
    }
}

module.exports = Delete;
