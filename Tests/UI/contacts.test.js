const { test, expect } = require('@playwright/test');
const LoginPage = require('../../Pages/LoginPage');
const TransactionPage = require('../../Pages/TransactionPage');
const ManageContactsPage = require('../../Pages/ManageContactsPage');
const ContactLedgerPage = require('../../Pages/ContactLedgerPage');
const FinanceApiHelper = require('../helpers/financeApiHelper');

async function waitForCategoryOption(transactionPage, categoryName) {
    await expect.poll(async () => {
        const options = await transactionPage.getCategoryOptions();
        return options.includes(categoryName);
    }, {
        timeout: 15000,
        message: `Wait for ${categoryName} to appear in the category list`
    }).toBe(true);
}

test.describe.serial('UI coverage contacts', () => {
    test.beforeEach(async ({ page, request }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_through_post_API(request);
    });

    test('Create contact from contacts page', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const manageContactsPage = new ManageContactsPage(page);
        const contact = {
            name: helper.buildUniqueName('UI Contact'),
            email: `ui.contact.${Date.now()}@example.com`,
            mobNo: `8${Date.now().toString().slice(-9)}`
        };

        try {
            await manageContactsPage.open();
            await manageContactsPage.createContact(contact);
            await manageContactsPage.expectContactVisible(contact.name);
        } finally {
            const contacts = (await helper.getJson('/api/contacts', 'Get Contacts After UI Create')).content;
            const createdContact = contacts.find((item) => item.name === contact.name);
            if (createdContact) {
                await helper.deleteById('contacts', createdContact.id);
            }
        }
    });

    test('Show contact picker for given category', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const transactionPage = new TransactionPage(page);
        const contact = await helper.createContact();
        const givenCategory = await helper.createCategory('debit', {
            name: helper.buildUniqueName('Given UI Category'),
            status: 'given'
        });

        try {
            await transactionPage.openAddTransactionForm();
            await transactionPage.selectTransactionType('debit');
            await waitForCategoryOption(transactionPage, givenCategory.name);
            await transactionPage.selectCategory(givenCategory.name);

            await expect.poll(async () => transactionPage.isContactDropdownVisible(), {
                timeout: 10000,
                message: 'Wait for contact dropdown to appear for a given category'
            }).toBe(true);

            const contactOptions = await transactionPage.getContactOptions();
            expect(contactOptions).toContain(contact.name);
        } finally {
            await helper.deleteById('contacts', contact.id);
            await helper.deleteById('categories', givenCategory.id);
        }
    });

    test('Show contact picker for received category', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const transactionPage = new TransactionPage(page);
        const contact = await helper.createContact();
        const receivedCategory = await helper.createCategory('credit', {
            name: helper.buildUniqueName('Received UI Category'),
            status: 'received'
        });

        try {
            await transactionPage.openAddTransactionForm();
            await transactionPage.selectTransactionType('credit');
            await waitForCategoryOption(transactionPage, receivedCategory.name);
            await transactionPage.selectCategory(receivedCategory.name);

            await expect.poll(async () => transactionPage.isContactDropdownVisible(), {
                timeout: 10000,
                message: 'Wait for contact dropdown to appear for a received category'
            }).toBe(true);

            const contactOptions = await transactionPage.getContactOptions();
            expect(contactOptions).toContain(contact.name);
        } finally {
            await helper.deleteById('contacts', contact.id);
            await helper.deleteById('categories', receivedCategory.id);
        }
    });

    test('Hide contact picker for regular category', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const transactionPage = new TransactionPage(page);
        const regularCategory = await helper.createCategory('debit', {
            name: helper.buildUniqueName('Regular UI Category')
        });

        try {
            await transactionPage.openAddTransactionForm();
            await transactionPage.selectTransactionType('debit');
            await waitForCategoryOption(transactionPage, regularCategory.name);
            await transactionPage.selectCategory(regularCategory.name);

            await expect.poll(async () => transactionPage.isContactDropdownVisible(), {
                timeout: 10000,
                message: 'Wait for contact dropdown to stay hidden for a regular category'
            }).toBe(false);
        } finally {
            await helper.deleteById('categories', regularCategory.id);
        }
    });

    test('Find contact in ledger search', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const contactLedgerPage = new ContactLedgerPage(page);
        const contact = await helper.createContact();
        const transaction = await helper.createTransaction({
            type: 'debit',
            category: 'Given',
            amount: 77,
            contactId: contact.id,
            comments: `Ledger search ${Date.now()}`
        });

        try {
            await contactLedgerPage.open();
            await contactLedgerPage.searchContact(contact.name);
            await contactLedgerPage.expectContactVisible(contact.name);
            await contactLedgerPage.expectTransactionDetailsVisible(transaction.comments);
        } finally {
            await helper.deleteById('transactions', transaction.id);
            await helper.deleteById('contacts', contact.id);
        }
    });
});
