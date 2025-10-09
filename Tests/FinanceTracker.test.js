const { test, expect } = require('@playwright/test');
const LoginPage = require('../Pages/LoginPage');
const Utility = require('../Base/Utility.js');
const Post = require('../API/Post.js');
const Get = require('../API/Get.js');
const Put = require('../API/Put.js');
const Delete = require('../API/Delete.js');

let token = '';
let utility;

test.describe.serial('🌐 API Testing Suite', () => {

    // 🔹 1️⃣ Login and Token Generation
    test('1️⃣ Post Login API', async ({ request }) => {
        const post = new Post(request);
        const loginResponse = await post.postLoginAPI();
        token = loginResponse.token;
    });

    // 🔹 2️⃣–6️⃣ Get APIs
    test('2️⃣ Get Transaction API', async ({ request }) => {
        const get = new Get(request);
        await get.getTransactionAPI();
    });

    test('3️⃣ Get Category API', async ({ request }) => {
        const get = new Get(request);
        await get.getCategoryAPI();
    });

    test('4️⃣ Get Label API', async ({ request }) => {
        const get = new Get(request);
        await get.getLabelAPI();
    });

    test('5️⃣ Get Label Usage API', async ({ request }) => {
        const get = new Get(request);
        await get.getLabelUsageAPI();
    });

    test('6️⃣ Get Opening Balance API', async ({ request }) => {
        const get = new Get(request);
        await get.getOpeningBalanceAPI();
    });

    // 🔹 7️⃣–9️⃣ Category APIs (Debit)
    test('7️⃣ Post Categories API (Debit)', async ({ request }) => {
        const post = new Post(request);
        await post.postCategoriesAPI('debit');
    });

    test('8️⃣ Update Categories API (Debit)', async ({ request }) => {
        const put = new Put(request);
        await put.updateCategoriesAPI('debit');
    });

    test('9️⃣ Delete Categories API (Debit)', async ({ request }) => {
        const del = new Delete(request);
        await del.deleteCategoriesAPI('debit');
    });

    // 🔹 🔟–1️⃣2️⃣ Category APIs (Credit)
    test('🔟 Post Categories API (Credit)', async ({ request }) => {
        const post = new Post(request);
        await post.postCategoriesAPI('credit');
    });

    test('1️⃣1️⃣ Update Categories API (Credit)', async ({ request }) => {
        const put = new Put(request);
        await put.updateCategoriesAPI('credit');
    });

    test('1️⃣2️⃣ Delete Categories API (Credit)', async ({ request }) => {
        const del = new Delete(request);
        await del.deleteCategoriesAPI('credit');
    });

    // 🔹 1️⃣3️⃣–1️⃣5️⃣ Transaction APIs (Debit)
    test('1️⃣3️⃣ Post Transaction API (Debit)', async ({ request }) => {
        const post = new Post(request);
        await post.postTransactionAPI('debit');
    });

    test('1️⃣4️⃣ Update Transaction API (Debit)', async ({ request }) => {
        const put = new Put(request);
        await put.updateTransactionAPI('debit');
    });

    test('1️⃣5️⃣ Delete Transaction API (Debit)', async ({ request }) => {
        const del = new Delete(request);
        await del.deleteTransactionAPI('debit');
    });

    // // 🔹 1️⃣6️⃣–1️⃣8️⃣ Transaction APIs (Credit)
    // test('1️⃣6️⃣ Post Transaction API (Credit)', async ({ request }) => {
    //     const post = new Post(request);
    //     await post.postTransactionAPI('credit');
    // });

    // test('1️⃣7️⃣ Update Transaction API (Credit)', async ({ request }) => {
    //     const put = new Put(request);
    //     await put.updateTransactionAPI('credit');
    // });

    // test('1️⃣8️⃣ Delete Transaction API (Credit)', async ({ request }) => {
    //     const del = new Delete(request);
    //     await del.deleteTransactionAPI('credit');
    // });

});

test.describe('Login Scenarios', () => {

    test('1️⃣ Login through Post API', async ({ request, page }) => {
        let loginPage = new LoginPage(page);
        await loginPage.login_through_post_API(request);
    });

    test('2️⃣ Login with Valid Credentials', async ({ request, page }) => {
        let loginPage = new LoginPage(page);
        await loginPage.login_with_valid_credentials(request);
    });

});
