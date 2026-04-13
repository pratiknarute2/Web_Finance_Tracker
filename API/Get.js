const {expect} = require('@playwright/test');
const Utility = require('../Base/Utility.js');
const {API_URL} = require('../playwright.config.js'); // Import dynamic API_URL

class Get extends Utility {
    constructor(request) {
        super(request);
        this.request = request;
    }

    async getTransactionAPI() {
        const result = await this.getRequest(
            this.request,
            `${API_URL}/api/transactions`,
            'Get Transaction API'
        );

        // result is already JSON object
        const transactions = result.content;

        if (!Array.isArray(transactions)) {
            throw new Error("Transactions API: content is not an array");
        }

        console.log("Total Transaction Entries:", transactions.length);

        // Food categories
        const debitFood = transactions.filter(
            item => item.type === 'debit' && item.category === 'Food'
        );
        console.log("Food Category:", debitFood.length);

        // Transport categories
        const transport = transactions.filter(
            item => item.type === 'debit' && item.category === 'Transport'
        );
        console.log("Transport Category:", transport.length);

        return result;
    }

    async getAllTransactionsAPI() {
        const firstPage = await this.getTransactionAPI();
        const pageSize = firstPage?.size || firstPage?.pageable?.pageSize || 15;
        const totalPages = firstPage?.totalPages || 1;
        const allTransactions = Array.isArray(firstPage?.content) ? [...firstPage.content] : [];

        for (let pageNumber = 1; pageNumber < totalPages; pageNumber++) {
            const pageResponse = await this.getRequest(
                this.request,
                `${API_URL}/api/transactions?page=${pageNumber}&size=${pageSize}`,
                `Get Transaction API - Page ${pageNumber + 1}`
            );

            const pageTransactions = Array.isArray(pageResponse?.content) ? pageResponse.content : [];
            allTransactions.push(...pageTransactions);
        }

        return {
            ...firstPage,
            content: allTransactions
        };
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

        // result is already JSON object
        const contactsResponse = response.content;

        // Find the single contact object that matches the global values.
        // Use string comparison to avoid type mismatches (ids might be numbers or strings).
        const contact = Array.isArray(contactsResponse)
            ? contactsResponse.find(item => `${item.id}` === `${global.contactId}` && `${item.name}` === `${global.contactName}`)
            : null;

        expect.soft(`${contact.id}`).toBe(`${global.contactId}`);
        expect.soft(`${contact.name}`).toBe(`${global.contactName}`);


        return response;
    }


}

module.exports = Get;
