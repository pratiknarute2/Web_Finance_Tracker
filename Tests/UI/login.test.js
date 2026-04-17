const { test, expect } = require('@playwright/test');
const LoginPage = require('../../Pages/LoginPage');

test.describe('UI login', () => {
    test('Valid login opens home', async ({ request, page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_with_valid_credentials({ email: 'testingnotes011@gmail.com' }, { password: 'Testing@123' });
    });
    test('Invalid login shows error', async ({ request, page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_with_invalid_credentials(request);
    });
});
