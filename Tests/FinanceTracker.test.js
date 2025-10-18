const { test, expect } = require('@playwright/test');
const LoginPage = require('../Pages/LoginPage');
const HomePage = require('../Pages/HomePage');
const TransactionPage = require('../Pages/TransactionPage');
const Utility = require('../Base/Utility.js');
const Post = require('../API/Post.js');
const Get = require('../API/Get.js');
const Put = require('../API/Put.js');
const Delete = require('../API/Delete.js');

let token = '';
let utility;

test.describe.skip('🌐 API Testing Suite', () => {

    // 🔐 AUTHENTICATION FEATURE
    test.describe('🔐 Authentication', () => {

        test('POST | Login API', async ({ request }) => {
            console.log('\n🔹 Executing Login API...');
            const post = new Post(request);
            const loginResponse = await post.postLoginAPI();
            token = loginResponse.token;
            expect(token).toBeTruthy();
        });
    });

    // 🏷️ LABEL FEATURE
    test.describe('🏷️ Label Feature', () => {

        test('GET | Fetch Label API', async ({ request }) => {
            const get = new Get(request);
            await get.getLabelAPI();
        });

        test('GET | Fetch Label Usage API', async ({ request }) => {
            const get = new Get(request);
            await get.getLabelUsageAPI();
        });
    });

    // 💵 OPENING BALANCE FEATURE
    test.describe('💵 Opening Balance Feature', () => {

        test('GET | Opening Balance API', async ({ request }) => {
            const get = new Get(request);
            await get.getOpeningBalanceAPI();
        });
    });

    // 💰 CATEGORY FEATURE
    test.describe('💰 Category Feature', () => {

        test('POST | Create Debit Category', async ({ request }) => {
            const post = new Post(request);
            await post.postCategoriesAPI('debit');
        });

        test('GET | Fetch Categories', async ({ request }) => {
            const get = new Get(request);
            await get.getCategoryAPI();
        });

        test('PUT | Update Debit Category', async ({ request }) => {
            const put = new Put(request);
            await put.updateCategoriesAPI('debit');
        });

        test('DELETE | Delete Debit Category', async ({ request }) => {
            const del = new Delete(request);
            await del.deleteCategoriesAPI('debit');
        });

        test('POST | Create Credit Category', async ({ request }) => {
            const post = new Post(request);
            await post.postCategoriesAPI('credit');
        });

        test('PUT | Update Credit Category', async ({ request }) => {
            const put = new Put(request);
            await put.updateCategoriesAPI('credit');
        });

        test('DELETE | Delete Credit Category', async ({ request }) => {
            const del = new Delete(request);
            await del.deleteCategoriesAPI('credit');
        });
    });

    // 💳 TRANSACTION FEATURE
    test.describe('💳 Transaction Feature', () => {

        test('POST | Debit Transaction', async ({ request }) => {
            const post = new Post(request);
            await post.postTransactionAPI('debit');
        });

        test('GET | Fetch Transaction', async ({ request }) => {
            const get = new Get(request);
            await get.getTransactionAPI();
        });

        test('PUT | Update Debit Transaction', async ({ request }) => {
            const put = new Put(request);
            await put.updateTransactionAPI('debit');
        });

        test('DELETE | Delete Debit Transaction', async ({ request }) => {
            const del = new Delete(request);
            await del.deleteTransactionAPI('debit');
        });
        test('POST | Credit Transaction', async ({ request }) => {
            const post = new Post(request);
            await post.postTransactionAPI('credit');
        });
        test('PUT | Update Credit Transaction', async ({ request }) => {
            const put = new Put(request);
            await put.updateTransactionAPI('credit');
        });
        test('DELETE | Delete Credit Transaction', async ({ request }) => {
            const del = new Delete(request);
            await del.deleteTransactionAPI('credit');
        });
    });

});


// 🧩 LOGIN SCENARIOS (UI + API)
test.describe.skip('🧩 Login Scenarios', () => {
    test('POST | Login through API', async ({ request, page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_through_post_API(request);
    });

    test('UI | Login with Valid Credentials', async ({ request, page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_with_valid_credentials(request);
    });
    test('UI | Login with Invalid Credentials', async ({ request, page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_with_invalid_credentials(request);
    });

});

test.describe("Arthmatical Calculation", () => {
    test.skip("UI | Table calculations", async ({ request, page }) => {
        const loginPage = new LoginPage(page);
        const homePage = new HomePage(page);

        await loginPage.login_through_post_API(request)
        await homePage.arthmaticalTableCalculation(request)

    })
    test("UI | Impact Calculation of Created transaction", async ({ request, page }) => {
        const loginPage = new LoginPage(page);
        const homePage = new HomePage(page);
        const transactionPage = new TransactionPage(page);

        await loginPage.login_through_post_API(request)

        // Capture summary before transaction
        const beforeSummary = await homePage.getSummaryCardsData();

        const createdTransaction = await transactionPage.createTransaction(
            '25-09-2025', 'credit', 'Refund', '1000', 'Essentials', 'Automation Testing'
        );

        await homePage.verifyTransactionSuccessMessage()
        await homePage.impactCalculationOfCreatedTransaction(createdTransaction, beforeSummary)
        await homePage.deleteTransaction(createdTransaction)


    })


})
