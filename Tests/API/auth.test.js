const { test, expect } = require('@playwright/test');
const LoginPage = require('../../Pages/LoginPage');

// 🔐 AUTHENTICATION FEATURE
test.describe('🔐 Login Authentication', () => {
    test('POST | Login through API', async ({ request, page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_through_post_API(request);
    });
});

