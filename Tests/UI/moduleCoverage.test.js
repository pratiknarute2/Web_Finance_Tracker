const { test, expect } = require('@playwright/test');
const LoginPage = require('../../Pages/LoginPage');
const TransactionPage = require('../../Pages/TransactionPage');
const HomePage = require('../../Pages/HomePage');
const ManageContactsPage = require('../../Pages/ManageContactsPage');
const ManageCategoriesPage = require('../../Pages/ManageCategoriesPage');
const ManageLabelsPage = require('../../Pages/ManageLabelsPage');
const ContactLedgerPage = require('../../Pages/ContactLedgerPage');
const FinanceApiHelper = require('../helpers/financeApiHelper');
const { UI_URL } = require('../../playwright.config');

test.describe.serial('🖥️ Module Coverage UI Suite', () => {
    test.beforeEach(async ({ page, request }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_through_post_API(request);
    });

    test('TC_01 | User can create a contact from Manage Contacts', async ({ page, request }) => {
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

    test('TC_02 | Contact dropdown should appear only for Given or Received transactions', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const transactionPage = new TransactionPage(page);
        const contact = await helper.createContact();

        try {
            await transactionPage.openAddTransactionForm();
            await transactionPage.selectTransactionType('debit');
            await transactionPage.selectCategory('Given');

            await expect.poll(async () => transactionPage.isContactDropdownVisible(), {
                timeout: 10000,
                message: 'Wait for contact dropdown to appear for Given category'
            }).toBe(true);

            const contactOptions = await transactionPage.getContactOptions();
            expect(contactOptions).toContain(contact.name);

            await transactionPage.selectCategory('Food');
            await expect.poll(async () => transactionPage.isContactDropdownVisible(), {
                timeout: 10000,
                message: 'Wait for contact dropdown to disappear for regular categories'
            }).toBe(false);
        } finally {
            await helper.deleteById('contacts', contact.id);
        }
    });

    test('TC_03 | Contact ledger search should show the matching contact and linked transaction', async ({ page, request }) => {
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

    test('TC_04/TC_05/TC_07 | Created debit and credit categories should be visible in management and transaction flows', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const manageCategoriesPage = new ManageCategoriesPage(page);
        const transactionPage = new TransactionPage(page);
        const debitCategoryName = helper.buildUniqueName('UI Debit Category');
        const creditCategoryName = helper.buildUniqueName('UI Credit Category');

        try {
            await manageCategoriesPage.open();
            await manageCategoriesPage.addDebitCategory(debitCategoryName);
            await manageCategoriesPage.expectCategoryVisible(debitCategoryName);
            await manageCategoriesPage.addCreditCategory(creditCategoryName);
            await manageCategoriesPage.expectCategoryVisible(creditCategoryName);

            await page.goto(UI_URL.replace('/login', '/expense-tracker'));
            await page.waitForLoadState('networkidle');
            await transactionPage.openAddTransactionForm();
            await transactionPage.selectTransactionType('debit');
            expect(await transactionPage.getCategoryOptions()).toContain(debitCategoryName);

            await transactionPage.selectTransactionType('credit');
            expect(await transactionPage.getCategoryOptions()).toContain(creditCategoryName);
        } finally {
            const categories = await helper.getJson('/api/categories', 'Get Categories After UI Create');
            const createdCategories = categories.filter((item) => [debitCategoryName, creditCategoryName].includes(item.name));
            for (const category of createdCategories) {
                await helper.deleteById('categories', category.id);
            }
        }
    });

    test('TC_09/TC_10 | Created labels should be visible in label management and transaction form', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const manageLabelsPage = new ManageLabelsPage(page);
        const transactionPage = new TransactionPage(page);
        const labelName = helper.buildUniqueName('UI Label');

        try {
            await manageLabelsPage.open();
            await manageLabelsPage.createLabel(labelName);
            await manageLabelsPage.expectLabelVisible(labelName);

            await page.goto(UI_URL.replace('/login', '/expense-tracker'));
            await page.waitForLoadState('networkidle');
            await transactionPage.openAddTransactionForm();
            await expect(page.getByText(labelName, { exact: true })).toBeVisible();
        } finally {
            const labels = await helper.getJson('/api/labels', 'Get Labels After UI Create');
            const createdLabel = labels.find((item) => item.name === labelName);
            if (createdLabel) {
                await helper.deleteById('labels', createdLabel.id);
            }
        }
    });

    test('TC_08/TC_11 | Category and label filters should narrow the home transaction table', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const homePage = new HomePage(page);
        const category = await helper.createCategory('debit');
        const label = await helper.createLabel();
        const transaction = await helper.createTransaction({
            date: '2026-04-14',
            type: 'debit',
            category: category.name,
            amount: 91,
            labelIds: [label.id],
            comments: `UI Filter ${Date.now()}`
        });

        const filterData = {
            date_dd_mm_yyyy: '14-04-2026',
            transactionType: 'debit',
            category: category.name,
            amount: `${transaction.amount}`,
            label: label.name,
            comments: transaction.comments
        };

        try {
            await page.reload({ waitUntil: 'networkidle' });
            await homePage.applyTransactionFilters(filterData);
            await homePage.validateImpactOfTranctionAddedOnTable(filterData);
        } finally {
            await helper.deleteById('transactions', transaction.id);
            await helper.deleteById('categories', category.id);
            await helper.deleteById('labels', label.id);
        }
    });
});
