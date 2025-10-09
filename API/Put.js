const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility.js');


class Put extends Utility {
    constructor(request) {
        super(request);
        this.request = request;
    }
    async updateCategoriesAPI(transactionType) {
        const categoryResponse = await this.putRequest(
            this.request,
            `https://expense-tracker-backend-y788.onrender.com/api/categories/${global.categoryId}`,
            `Categories_Update`,
            `Update Categories API for ${transactionType}`
        );

        expect(categoryResponse.type).toBe(transactionType);

    }
    async updateTransactionAPI(transactionType) {
        const categoryResponse = await this.putRequest(
            this.request,
            `https://expense-tracker-backend-y788.onrender.com/api/transactions/${global.transactionId}`,
            `Transaction_update`,
            `Update Transaction API for ${transactionType}`
        );

        expect(categoryResponse.type).toBe(transactionType);

    }


}

module.exports = Put;