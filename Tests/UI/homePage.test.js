const { test, expect } = require('@playwright/test');
const LoginPage = require('../../Pages/LoginPage');
const HomePage = require('../../Pages/HomePage');
const TransactionPage = require('../../Pages/TransactionPage');

test.describe.serial('UI calculations', () => {
    test.beforeEach((async ({ request, page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_through_post_API(request)
    }))
    test('Validate table totals', async ({ request, page }) => {
        const homePage = new HomePage(page);
        await homePage.arthmaticalTableCalculation(request)
    })
    test('Validate transaction impact', async ({ request, page }) => {
        const homePage = new HomePage(page);
        const transactionPage = new TransactionPage(page);
        const uniqueComment = `Automation Testing ${Date.now()}`;
        // Capture summary before transaction
        const beforeSummary = await homePage.getSummaryCardsData();
        const createdTransaction = await transactionPage.createTransaction(
            '19-09-2025', 'debit', 'Food', '1000', 'Essentials', uniqueComment
        );
        await homePage.verifyTransactionSuccessMessage()
        await homePage.impactCalculationOfCreatedTransaction(createdTransaction, beforeSummary)
        await homePage.deleteTransaction(createdTransaction)
    })
})
