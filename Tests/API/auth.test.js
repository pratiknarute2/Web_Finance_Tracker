const { test, expect } = require('@playwright/test');
const LoginPage = require('../../Pages/LoginPage');

test.describe('API auth', () => {
    test('API login succeeds', async ({ request, page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_through_post_API(request);
    });
});
