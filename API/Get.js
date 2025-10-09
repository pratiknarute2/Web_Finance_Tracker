const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility.js');

class Get extends Utility {
    constructor(request) {
        super(request);
        this.request = request;
    }

    async getTransactionAPI() {
        let getTransactionAPIResponse = await this.getRequest(   // ✅ Removed this.utility (because getRequest() is from Utility)
            this.request,        // ✅ Changed request → this.request (class property)
            'https://expense-tracker-backend-y788.onrender.com/api/transactions',
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

    async getCategoryAPI() {
        let getCategoryAPIResponse = await this.getRequest(this.request, 'https://expense-tracker-backend-y788.onrender.com/api/categories', 'Get Categories API')
    }
    async getLabelAPI() {
        let getLabelAPIResponse = await this.getRequest(this.request, 'https://expense-tracker-backend-y788.onrender.com/api/labels', 'Get Labels API')
    }
    async getLabelUsageAPI() {
        let getLabelUsageAPIResponse = await this.getRequest(this.request, 'https://expense-tracker-backend-y788.onrender.com/api/labels/usage', 'Get Label Usage API')
    }
    async getOpeningBalanceAPI() {
        let getLabelAPIResponse = await this.getRequest(this.request, 'https://expense-tracker-backend-y788.onrender.com/api/transactions/opening-balance', 'Get Opening Balance API')
    }


}

module.exports = Get;
