const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility.js');
const { API_URL } = require('../playwright.config.js'); // Import dynamic API_URL

class Get extends Utility {
    constructor(request) {
        super(request);
        this.request = request;
    }

    async getTransactionAPI() {
        const getTransactionAPIResponse = await this.getRequest(
            this.request,
            `${API_URL}/api/transactions`, // ✅ dynamic URL
            'Get Transaction API'
        );

        console.log("Total Transaction Entries: " + getTransactionAPIResponse.length);

        // Food categories
        const debitFood = getTransactionAPIResponse.filter(
            item => item.type === 'debit' && item.category === 'Food'
        );
        console.log("Food Category: " + debitFood.length);

        // Transport categories
        const transport = getTransactionAPIResponse.filter(
            item => item.type === 'debit' && item.category === 'Transport'
        );
        console.log("Transport Category: " + transport.length);
    }

    async getCategoryAPI() {
        const getCategoryAPIResponse = await this.getRequest(
            this.request,
            `${API_URL}/api/categories`, // ✅ dynamic URL
            'Get Categories API'
        );
        return getCategoryAPIResponse;
    }

    async getLabelAPI() {
        const getLabelAPIResponse = await this.getRequest(
            this.request,
            `${API_URL}/api/labels`, // ✅ dynamic URL
            'Get Labels API'
        );
        return getLabelAPIResponse;
    }

    async getLabelUsageAPI() {
        const getLabelUsageAPIResponse = await this.getRequest(
            this.request,
            `${API_URL}/api/labels/usage`, // ✅ dynamic URL
            'Get Label Usage API'
        );
        return getLabelUsageAPIResponse;
    }

    async getOpeningBalanceAPI() {
        const getOpeningBalanceAPIResponse = await this.getRequest(
            this.request,
            `${API_URL}/api/transactions/opening-balance`, // ✅ dynamic URL
            'Get Opening Balance API'
        );
        return getOpeningBalanceAPIResponse;
    }
}

module.exports = Get;
