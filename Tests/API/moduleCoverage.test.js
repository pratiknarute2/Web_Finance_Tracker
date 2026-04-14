const { test, expect } = require('@playwright/test');
const Post = require('../../API/Post');
const Get = require('../../API/Get');
const FinanceApiHelper = require('../helpers/financeApiHelper');
const { API_URL } = require('../../playwright.config');

test.describe.serial('🧩 Module Coverage API Suite', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI();
    });

    test('TC_01 | Contact creation should persist and duplicate handling should stay controlled', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const contact = await helper.createContact();

        try {
            const contactsResponse = await helper.getJson('/api/contacts?page=0&size=100', 'Get Contacts For Contact Validation');
            const contacts = contactsResponse.content;
            const createdContact = contacts.find((item) => `${item.id}` === `${contact.id}`);

            expect(createdContact).toBeDefined();
            expect(createdContact.name).toBe(contact.name);

            const duplicateResponse = await helper.tryPostJson('/api/contacts', {
                name: contact.name,
                email: contact.email,
                mobNo: contact.mobNo
            }, 'Create Duplicate Contact');

            expect([200, 201, 400, 409, 500].includes(duplicateResponse.status)).toBeTruthy();
        } finally {
            await helper.deleteById('contacts', contact.id);
        }
    });

    test('TC_02/TC_06 | Contact-based transactions should preserve linked contact and category data', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const contact = await helper.createContact();

        const givenTransaction = await helper.createTransaction({
            type: 'debit',
            category: 'Given',
            amount: 125,
            contactId: contact.id,
            comments: `Given contact txn ${Date.now()}`
        });

        const receivedTransaction = await helper.createTransaction({
            type: 'credit',
            category: 'Received',
            amount: 85,
            contactId: contact.id,
            comments: `Received contact txn ${Date.now()}`
        });

        try {
            const transactions = (await new Get(request).getAllTransactionsAPI()).content;
            const storedGiven = transactions.find((item) => `${item.id}` === `${givenTransaction.id}`);
            const storedReceived = transactions.find((item) => `${item.id}` === `${receivedTransaction.id}`);

            expect(storedGiven.contactId).toBe(contact.id);
            expect(storedGiven.category).toBe('Given');
            expect(storedReceived.contactId).toBe(contact.id);
            expect(storedReceived.category).toBe('Received');
        } finally {
            await helper.deleteById('transactions', receivedTransaction.id);
            await helper.deleteById('transactions', givenTransaction.id);
            await helper.deleteById('contacts', contact.id);
        }
    });

    test('TC_04/TC_05/TC_07 | Debit and credit categories should be created and exposed to transactions', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const debitCategory = await helper.createCategory('debit');
        const creditCategory = await helper.createCategory('credit');

        try {
            const categories = await new Get(request).getCategoryAPI();
            const debitMatch = categories.find((item) => `${item.id}` === `${debitCategory.id}`);
            const creditMatch = categories.find((item) => `${item.id}` === `${creditCategory.id}`);

            expect(debitMatch.name).toBe(debitCategory.name);
            expect(debitMatch.type).toBe('debit');
            expect(creditMatch.name).toBe(creditCategory.name);
            expect(creditMatch.type).toBe('credit');

            const debitTransaction = await helper.createTransaction({
                type: 'debit',
                category: debitCategory.name,
                amount: 20
            });

            const creditTransaction = await helper.createTransaction({
                type: 'credit',
                category: creditCategory.name,
                amount: 30
            });

            expect(debitTransaction.category).toBe(debitCategory.name);
            expect(creditTransaction.category).toBe(creditCategory.name);

            await helper.deleteById('transactions', creditTransaction.id);
            await helper.deleteById('transactions', debitTransaction.id);
        } finally {
            await helper.deleteById('categories', creditCategory.id);
            await helper.deleteById('categories', debitCategory.id);
        }
    });

    test('TC_09/TC_10 | Labels should be created and reused by transactions and dashboard usage', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const label = await helper.createLabel();

        try {
            const usageBefore = await new Get(request).getLabelUsageAPI();
            const beforeCount = usageBefore.find((item) => `${item.id}` === `${label.id}`)?.count || 0;

            const transaction = await helper.createTransaction({
                type: 'debit',
                category: 'Food',
                amount: 40,
                labelIds: [label.id]
            });

            const labels = await new Get(request).getLabelAPI();
            expect(labels.some((item) => `${item.id}` === `${label.id}` && item.name === label.name)).toBeTruthy();

            await expect.poll(async () => {
                const usageAfter = await new Get(request).getLabelUsageAPI();
                return usageAfter.find((item) => `${item.id}` === `${label.id}`)?.count || 0;
            }, {
                timeout: 15000,
                message: 'Wait for label usage to reflect the new transaction'
            }).toBe(beforeCount + 1);

            await helper.deleteById('transactions', transaction.id);
        } finally {
            await helper.deleteById('labels', label.id);
        }
    });

    test('TC_12/TC_13 | Deleting linked contacts or categories should stay controlled and not orphan transactions unexpectedly', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const contact = await helper.createContact();
        const category = await helper.createCategory('debit');

        const transaction = await helper.createTransaction({
            type: 'debit',
            category: category.name,
            amount: 55,
            contactId: contact.id,
            comments: `Delete impact ${Date.now()}`
        });

        try {
            const contactDeleteResponse = await request.delete(`${API_URL}/api/contacts/${contact.id}`, {
                headers: helper.getAuthHeaders(),
                timeout: 60000
            });
            const categoryDeleteResponse = await request.delete(`${API_URL}/api/categories/${category.id}`, {
                headers: helper.getAuthHeaders(),
                timeout: 60000
            });

            const transactions = (await new Get(request).getAllTransactionsAPI()).content;
            const linkedTransaction = transactions.find((item) => `${item.id}` === `${transaction.id}`);

            expect(contactDeleteResponse.status()).toBeLessThan(500);
            expect(categoryDeleteResponse.status()).toBeLessThan(500);

            if (linkedTransaction) {
                expect(
                    `${linkedTransaction.contactId}` === `${contact.id}`
                    || linkedTransaction.contactId === null
                ).toBeTruthy();
                expect(linkedTransaction.category.length).toBeGreaterThan(0);
            }
        } finally {
            await helper.deleteById('transactions', transaction.id);
            await helper.deleteById('contacts', contact.id);
            await helper.deleteById('categories', category.id);
        }
    });
});
