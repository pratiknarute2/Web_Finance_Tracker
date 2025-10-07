const { expect } = require('@playwright/test');
const Utility = require('../../Base/Utility.js');

class Get extends Utility {
    constructor(request) {
        super(request);
        this.request = request;
    }

    async getTransactionAPI(token) {
        let getTransactionAPIResponse = await this.getRequest(   // ✅ Removed this.utility (because getRequest() is from Utility)
            this.request,        // ✅ Changed request → this.request (class property)
            'https://expense-tracker-backend-y788.onrender.com/api/transactions',
            token,
            'Get Transaction API'
        );

        console.log("Total Transaction Entries: " + getTransactionAPIResponse.length)

        // Food categories
        const debitFood = getTransactionAPIResponse.filter(
            item => item.type === 'debit' && item.category === 'Food'
        );
        console.log("Food Category: " + debitFood.length);

        // Transport categories
        const Transport = getTransactionAPIResponse.filter(
            item => item.type === 'debit' && item.category === 'Transport'
        );
        console.log("Transport Category: " + Transport.length);

    }

    async getCategoryAPI(token) {
        let getCategoryAPIResponse = await this.getRequest(this.request, 'https://expense-tracker-backend-y788.onrender.com/api/categories', token, 'Get Categories API')
    }
    async getLabelAPI(token) {
        let getLabelAPIResponse = await this.getRequest(this.request, 'https://expense-tracker-backend-y788.onrender.com/api/labels', token, 'Get Labels API')
    }
    async getLabelUsageeAPI(token) {
        let getLabelUsageAPIResponse = await this.getRequest(this.request, 'https://expense-tracker-backend-y788.onrender.com/api/labels/usage', token, 'Get Label Usage API')
    }
    async getOpeningBalanceAPI(token) {
        let getLabelAPIResponse = await this.getRequest(this.request, 'https://expense-tracker-backend-y788.onrender.com/api/transactions/opening-balance', token, 'Get Opening Balance API')
    }


}

module.exports = Get;
