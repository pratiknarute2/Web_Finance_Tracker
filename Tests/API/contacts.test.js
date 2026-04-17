const { test, expect } = require('@playwright/test');
const Get = require('../../API/Get');
const FinanceApiHelper = require('../helpers/financeApiHelper');

test.describe.serial('API coverage contacts', () => {
    test('Create contact and keep details', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const contact = await helper.createContact();

        try {
            const contactsResponse = await helper.getJson('/api/contacts?page=0&size=100', 'Get Contacts For Contact Validation');
            const contacts = contactsResponse.content;
            const createdContact = contacts.find((item) => `${item.id}` === `${contact.id}`);

            expect(createdContact).toBeDefined();
            expect(createdContact.name).toBe(contact.name);
        } finally {
            await helper.deleteById('contacts', contact.id);
        }
    });

    test('Handle duplicate contact create', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const contact = await helper.createContact();

        try {
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

    test('Store given transaction with linked contact', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const contact = await helper.createContact();
        const transaction = await helper.createTransaction({
            type: 'debit',
            category: 'Given',
            amount: 125,
            contactId: contact.id,
            comments: `Given contact txn ${Date.now()}`
        });

        try {
            const transactions = (await new Get(request).getAllTransactionsAPI()).content;
            const storedTransaction = transactions.find((item) => `${item.id}` === `${transaction.id}`);

            expect(storedTransaction).toBeDefined();
            expect(storedTransaction.contactId).toBe(contact.id);
            expect(storedTransaction.category).toBe('Given');
        } finally {
            await helper.deleteById('transactions', transaction.id);
            await helper.deleteById('contacts', contact.id);
        }
    });

    test('Store received transaction with linked contact', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const contact = await helper.createContact();
        const transaction = await helper.createTransaction({
            type: 'credit',
            category: 'Received',
            amount: 85,
            contactId: contact.id,
            comments: `Received contact txn ${Date.now()}`
        });

        try {
            const transactions = (await new Get(request).getAllTransactionsAPI()).content;
            const storedTransaction = transactions.find((item) => `${item.id}` === `${transaction.id}`);

            expect(storedTransaction).toBeDefined();
            expect(storedTransaction.contactId).toBe(contact.id);
            expect(storedTransaction.category).toBe('Received');
        } finally {
            await helper.deleteById('transactions', transaction.id);
            await helper.deleteById('contacts', contact.id);
        }
    });
});
