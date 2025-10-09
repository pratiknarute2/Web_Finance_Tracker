const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility.js');

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
            `https://expense-tracker-backend-y788.onrender.com/api/categories/${global.categoryId}`,
            `Delete Categories API for ${transactionType}`
        );
        return deleteResponse;
    }
    async deleteTransactionAPI(transactionType) {
        if (!global.transactionId) {
            throw new Error('❌ transactionId is not set. Create a transaction first!');
        }

        const deleteResponse = await this.deleteRequest(
            this.request,
            `https://expense-tracker-backend-y788.onrender.com/api/transactions/${global.transactionId}`,
            `Delete Transaction API for ${transactionType}`
        );
        return deleteResponse;
    }





}

module.exports = Delete;
