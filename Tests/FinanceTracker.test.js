const { test, expect } = require('@playwright/test');
const LoginPage = require('../Pages/LoginPage');
const Utility = require('../Base/Utility.js');
const Post = require('../TestData/API/Post.js');
const Get = require('../TestData/API/Get.js');


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
        await get.getTransactionAPI(token)
    });
    test('3️⃣ Get Category API', async ({ request }) => {
        let get = new Get(request)
        await get.getCategoryAPI(token)
    });
    test('4️⃣ Get Label API', async ({ request }) => {
        let get = new Get(request)
        await get.getLabelAPI(token)
    });
    test('5️⃣ Get Label Usage API', async ({ request }) => {
        let get = new Get(request)
        await get.getLabelUsageeAPI(token)
    });
    test('6️⃣ Get Opening Balance API', async ({ request }) => {
        let get = new Get(request)
        await get.getOpeningBalanceAPI(token)
    });

});

test.describe('Login Scenarios', () => {
    test('1️⃣ Login through post API', async ({ request, page }) => {
        let loginPage = new LoginPage(page)
        await loginPage.login_through_post_API(request)

    });
    test('1️⃣ Login with valid credentials', async ({ request, page }) => {
        let loginPage = new LoginPage(page)
        await loginPage.login_with_valid_credentials(request)

    })

})


