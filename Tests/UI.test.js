
const { test, expect } = require('@playwright/test');
const LoginPage = require('../Pages/LoginPage');
const HomePage = require('../Pages/HomePage');
const TransactionPage = require('../Pages/TransactionPage');
const Utility = require('../Base/Utility.js');
const Post = require('../API/Post.js');
const Get = require('../API/Get.js');
const Put = require('../API/Put.js');
const Delete = require('../API/Delete.js');

test.describe('UI', ()=>{
    // 🧩 LOGIN SCENARIOS (UI + API)
    test.describe('Login Scenarios', () => {
        test('Login with Valid Credentials', async ({ request, page }) => {
            const loginPage = new LoginPage(page);
            await loginPage.login_with_valid_credentials({ email: 'testingnotes011@gmail.com' }, { password: 'Testing@123' });

        });
        test('Login with Invalid Credentials', async ({ request, page }) => {
            const loginPage = new LoginPage(page);
            await loginPage.login_with_invalid_credentials(request);
        });

    });

    test.describe("Arithmetical Calculation", () => {
        test.beforeEach((async ({ request, page }) => {
            const loginPage = new LoginPage(page);
            await loginPage.login_through_post_API(request)
        }))
        test("Table calculations", async ({ request, page }) => {
            const homePage = new HomePage(page);
            await homePage.arthmaticalTableCalculation(request)
        })
        test("Impact Calculation of Created transaction", async ({ request, page }) => {
            const homePage = new HomePage(page);
            const transactionPage = new TransactionPage(page);
            // Capture summary before transaction
            const beforeSummary = await homePage.getSummaryCardsData();
            const createdTransaction = await transactionPage.createTransaction(
                '19-09-2025', 'debit', 'Food', '1000', 'Essentials', 'Automation Testing'
            );
            await homePage.verifyTransactionSuccessMessage()
            await homePage.impactCalculationOfCreatedTransaction(createdTransaction, beforeSummary)
            await homePage.deleteTransaction(createdTransaction)
        })

    })


})