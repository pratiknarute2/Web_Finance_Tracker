const { test } = require('@playwright/test');
const LoginPage = require('../../Pages/LoginPage');
const HomePage = require('../../Pages/HomePage');
const FinanceApiHelper = require('../helpers/financeApiHelper');

test.describe.serial('UI coverage filters', () => {
    test.beforeEach(async ({ page, request }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_through_post_API(request);
    });

    test('Filter home table by category and label', async ({ page, request }) => {
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
