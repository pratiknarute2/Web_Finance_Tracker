const { test, expect } = require('@playwright/test');
const LoginPage = require('../../Pages/LoginPage');
const TransactionPage = require('../../Pages/TransactionPage');
const ManageCategoriesPage = require('../../Pages/ManageCategoriesPage');
const FinanceApiHelper = require('../helpers/financeApiHelper');
const { UI_URL } = require('../../playwright.config');

async function openTracker(page) {
    await page.goto(UI_URL.replace('/login', '/expense-tracker'));
    await page.waitForLoadState('networkidle');
}

async function waitForCategoryOption(transactionPage, categoryName) {
    await expect.poll(async () => {
        const options = await transactionPage.getCategoryOptions();
        return options.includes(categoryName);
    }, {
        timeout: 15000,
        message: `Wait for ${categoryName} to appear in the category list`
    }).toBe(true);
}

test.describe.serial('UI coverage categories', () => {
    test.beforeEach(async ({ page, request }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_through_post_API(request);
    });

    test('Show new debit category in category management', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const manageCategoriesPage = new ManageCategoriesPage(page);
        const debitCategoryName = helper.buildUniqueName('UI Debit Category');

        try {
            await manageCategoriesPage.open();
            await manageCategoriesPage.addDebitCategory(debitCategoryName);
            await manageCategoriesPage.expectCategoryVisible(debitCategoryName);
        } finally {
            const categories = await helper.getJson('/api/categories', 'Get Categories After Debit UI Create');
            const createdCategory = categories.find((item) => item.name === debitCategoryName);
            if (createdCategory) {
                await helper.deleteById('categories', createdCategory.id);
            }
        }
    });

    test('Show new debit category in debit form', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const transactionPage = new TransactionPage(page);
        const debitCategory = await helper.createCategory('debit', {
            name: helper.buildUniqueName('UI Debit Category')
        });

        try {
            await openTracker(page);
            await transactionPage.openAddTransactionForm();
            await transactionPage.selectTransactionType('debit');
            await waitForCategoryOption(transactionPage, debitCategory.name);
        } finally {
            await helper.deleteById('categories', debitCategory.id);
        }
    });

    test('Show new credit category in category management', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const manageCategoriesPage = new ManageCategoriesPage(page);
        const creditCategoryName = helper.buildUniqueName('UI Credit Category');

        try {
            await manageCategoriesPage.open();
            await manageCategoriesPage.addCreditCategory(creditCategoryName);
            await manageCategoriesPage.expectCategoryVisible(creditCategoryName);
        } finally {
            const categories = await helper.getJson('/api/categories', 'Get Categories After Credit UI Create');
            const createdCategory = categories.find((item) => item.name === creditCategoryName);
            if (createdCategory) {
                await helper.deleteById('categories', createdCategory.id);
            }
        }
    });

    test('Show new credit category in credit form', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const transactionPage = new TransactionPage(page);
        const creditCategory = await helper.createCategory('credit', {
            name: helper.buildUniqueName('UI Credit Category')
        });

        try {
            await openTracker(page);
            await transactionPage.openAddTransactionForm();
            await transactionPage.selectTransactionType('credit');
            await waitForCategoryOption(transactionPage, creditCategory.name);
        } finally {
            await helper.deleteById('categories', creditCategory.id);
        }
    });
});
