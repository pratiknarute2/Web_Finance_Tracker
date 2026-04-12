const {expect} = require('@playwright/test');
const Utility = require('../Base/Utility.js');
const {API_URL} = require('../playwright.config.js'); // Import dynamic API_URL

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

    async deleteDataIfExists(data, existField, entityType = 'labels') {

        console.log(`Checking if ${existField} exists before deletion in ${entityType}...`);

        if (!Array.isArray(data)) {
            console.log('Response is not an array');
            return;
        }

        const itemsToDelete = data.filter(item =>
            item.name === existField || (item.name && item.name.includes('Updated'))
        );

        if (itemsToDelete.length === 0) {
            console.log(`No matching ${entityType} found. No delete needed.`);
            return;
        }

        for (const item of itemsToDelete) {
            console.log(`Deleting ${entityType.slice(0, -1)}: ${item.name} | id: ${item.id}`);

            await this.deleteRequest(
                this.request,
                `${API_URL}/api/${entityType}/${item.id}`,
                `Delete ${entityType.slice(0, -1)} API`
            );

        }
    }

    async deleteEntityByNameIfExists(entityType, nameToDelete, filters = {}) {
        console.log(`Looking for existing ${entityType} with name '${nameToDelete}' to delete before creating.`);

        const existingData = await this.getRequest(
            this.request,
            `${API_URL}/api/${entityType}`,
            `Get ${entityType} API`
        );

        // Handle both array and object structures
        const items = Array.isArray(existingData) ? existingData : existingData.content || [];

        if (!Array.isArray(items)) {
            console.log(`Could not parse ${entityType} response as array.`);
            return;
        }

        const matchItems = items.filter(item => {
            const nameMatches = item.name === nameToDelete;
            const typeMatches = !filters.type || item.type === filters.type;
            return nameMatches && typeMatches;
        });

        if (matchItems.length === 0) {
            console.log(`No existing ${entityType} entries to delete with name '${nameToDelete}'.`);
            return;
        }

        for (const match of matchItems) {
            console.log(`Deleting existing ${entityType.slice(0, -1)} with id ${match.id} name ${match.name}`);
            await this.deleteRequest(
                this.request,
                `${API_URL}/api/${entityType}/${match.id}`,
                `Delete ${entityType.slice(0, -1)} API`
            );
        }
    }



}

module.exports = Delete;
