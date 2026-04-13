const { test, expect } = require('@playwright/test');
const LoginPage = require('../../Pages/LoginPage');

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

