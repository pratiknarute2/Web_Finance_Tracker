const { test, expect } = require('@playwright/test');
const LoginPage = require('../Pages/LoginPage');
const Utility = require('../Base/Utility.js');
const Post = require('../TestData/API/Post.js');
const Get = require('../TestData/API/Get.js');
const Delete = require('../TestData/API/Delete.js');


let token = '';
let utility;

test.describe.serial('API Testing', () => {

    test('1️⃣ Post Login API', async ({ request }) => {
        let post = new Post(request);
        const loginResponse = await post.postLoginAPI();
        token = loginResponse.token;
    });
    test('2️⃣ Get Transaction API', async ({ request }) => {
        let get = new Get(request)
        await get.getTransactionAPI()
    });
    test('3️⃣ Get Category API', async ({ request }) => {
        let get = new Get(request)
        await get.getCategoryAPI()
    });
    test('4️⃣ Get Label API', async ({ request }) => {
        let get = new Get(request)
        await get.getLabelAPI()
    });
    test('5️⃣ Get Label Usage API', async ({ request }) => {
        let get = new Get(request)
        await get.getLabelUsageeAPI()
    });
    test('6️⃣ Get Opening Balance API', async ({ request }) => {
        let get = new Get(request)
        await get.getOpeningBalanceAPI()
    });
    test('7️⃣ Post Categories API for Debit transaction', async ({ request }) => {
        let post = new Post(request);
        const categoriesResponse = await post.postCategoriesAPI('debit');

    });
    test('8️⃣ Delete Categories API for Debit transaction', async ({ request }) => {
        let deleteInstance = new Delete(request);
        const categoriesResponse = await deleteInstance.deleteCategoriesAPI('debit');

    });
    test('9️⃣ Post Categories API for Credit transaction', async ({ request }) => {
        let post = new Post(request);
        const categoriesResponse = await post.postCategoriesAPI('credit');
    });
    test('1️⃣0️⃣ Delete Categories API for credit transaction', async ({ request }) => {
        let deleteInstance = new Delete(request);
        const categoriesResponse = await deleteInstance.deleteCategoriesAPI('credit');

    });

});

test.describe('Login Scenarios', () => {
    test('1️⃣ Login through post API', async ({ request, page }) => {
        let loginPage = new LoginPage(page)
        await loginPage.login_through_post_API(request)

    });
    test('2️⃣ Login with valid credentials', async ({ request, page }) => {
        let loginPage = new LoginPage(page)
        await loginPage.login_with_valid_credentials(request)

    })

})


