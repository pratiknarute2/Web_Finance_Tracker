const { test, expect } = require('@playwright/test');
const FinanceApiHelper = require('../helpers/financeApiHelper');
const { API_URL } = require('../../playwright.config');

test.describe.serial('API coverage deletions', () => {
    test('Delete linked contact without server error', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const contact = await helper.createContact();
        const transaction = await helper.createTransaction({
            type: 'debit',
            category: 'Food',
            amount: 55,
            contactId: contact.id,
            comments: `Delete contact ${Date.now()}`
        });

        try {
            const contactDeleteResponse = await request.delete(`${API_URL}/api/contacts/${contact.id}`, {
                headers: helper.getAuthHeaders(),
                timeout: 60000
            });

            expect(contactDeleteResponse.status()).toBeLessThan(500);
        } finally {
            await helper.deleteById('transactions', transaction.id);
            await helper.deleteById('contacts', contact.id);
        }
    });

    test('Delete linked category without server error', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const category = await helper.createCategory('debit');
        const transaction = await helper.createTransaction({
            type: 'debit',
            category: category.name,
            amount: 55,
            comments: `Delete category ${Date.now()}`
        });

        try {
            const categoryDeleteResponse = await request.delete(`${API_URL}/api/categories/${category.id}`, {
                headers: helper.getAuthHeaders(),
                timeout: 60000
            });

            expect(categoryDeleteResponse.status()).toBeLessThan(500);
        } finally {
            await helper.deleteById('transactions', transaction.id);
            await helper.deleteById('categories', category.id);
        }
    });
});
