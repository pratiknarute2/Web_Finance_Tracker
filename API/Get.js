const {expect} = require('@playwright/test');
const Utility = require('../Base/Utility.js');
const {API_URL} = require('../playwright.config.js'); // Import dynamic API_URL

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
        return await this.getRequest(
            this.request,
            `${API_URL}/api/categories`, // ✅ dynamic URL
            'Get Categories API'
        );
    }

    async getLabelAPI() {
        return await this.getRequest(
            this.request,
            `${API_URL}/api/labels`, // ✅ dynamic URL
            'Get Labels API'
        );
    }

    async getLabelUsageAPI() {
        return await this.getRequest(
            this.request,
            `${API_URL}/api/labels/usage`, // ✅ dynamic URL
            'Get Label Usage API'
        );
    }

    async getOpeningBalanceAPI() {
        return await this.getRequest(
            this.request,
            `${API_URL}/api/transactions/opening-balance`, // ✅ dynamic URL
            'Get Opening Balance API'
        );
    }

    async getContactsAPI() {
        const response = await this.getRequest(
            this.request,
            `${API_URL}/api/contacts`, // ✅ dynamic URL
            'Get Contacts API'
        );

        // Find the single contact object that matches the global values.
        // Use string comparison to avoid type mismatches (ids might be numbers or strings).
        const contact = Array.isArray(response)
            ? response.find(item => `${item.id}` === `${global.contactId}` && `${item.name}` === `${global.contactName}`)
            : null;

        expect.soft(`${contact.id}`).toBe(`${global.contactId}`);
        expect.soft(`${contact.name}`).toBe(`${global.contactName}`);


        return response;
    }


}

module.exports = Get;
