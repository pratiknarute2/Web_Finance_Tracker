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

    async deleteGivenCategoryAPI() {
        if (!global.givenCategoryId) {
            throw new Error('❌ givenCategoryId is not set. Create a category first!');

        }

        const deleteResponse = await this.deleteRequest(
            this.request,
            `${API_URL}/api/categories/${global.givenCategoryId}`,
            `Delete Given Categories API`
        );

        console.log(`✅ Deleted Given category ID: ${global.givenCategoryId}`);
        return deleteResponse;

    }

    async deleteReceivedCategoryAPI() {
        if (!global.receivedCategoryId) {
            throw new Error('❌ receivedCategoryId is not set. Create a category first!');
        }

        const deleteResponse = await this.deleteRequest(
            this.request,
            `${API_URL}/api/categories/${global.receivedCategoryId}`,
            `Delete Received Categories API`
        );

        console.log(`✅ Deleted category ID: ${global.receivedCategoryId}`);
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

    async deleteLabelApi() {
        if (!global.labelId) {
            throw new Error('❌ labelId is not set. Create a label first!');
        }

        const deleteResponse = await this.deleteRequest(
            this.request,
            `${API_URL}/api/labels/${global.labelId}`,
            `Delete Label API`
        );

        console.log(`✅ Deleted label ID: ${global.labelId}`);
        return deleteResponse;
    }

    async deleteContactsAPI() {
        if (!global.contactId) {
            throw new Error('❌ contactId is not set. Create a contact first!');
        }

        const deleteResponse = await this.deleteRequest(
            this.request,
            `${API_URL}/api/contacts/${global.contactId}`,
            `Delete Contact API`
        );

        console.log(`✅ Deleted contact ID: ${global.contactId}`);
        return deleteResponse;
    }

    async deleteGivenContactLedgerTransactionAPI() {
        if (!global.givenTransactionId) {
            throw new Error('❌ givenContactLedgerTransactionId is not set. Create a transaction first!');
        }

        const deleteResponse = await this.deleteRequest(
            this.request,
            `${API_URL}/api/transactions/${global.givenTransactionId}`,
            `Delete Given Contact Ledger Transaction API`
        );

        console.log(`✅ Deleted Given Contact Ledger transaction ID: ${global.givenTransactionId}`);
        return deleteResponse;
    }

    async deleteReceivedContactLedgerTransactionAPI() {
        if (!global.receivedTransactionId) {
            throw new Error('❌ receivedTransactionId is not set. Create a transaction first!');
        }
        const deleteResponse = await this.deleteRequest(
            this.request,
            `${API_URL}/api/transactions/${global.receivedTransactionId}`,
            `Delete Received Contact Ledger Transaction API`
        );

        console.log(`✅ Deleted Received Contact Ledger transaction ID: ${global.receivedTransactionId}`);
        return deleteResponse;
    }
}

module.exports = Delete;
