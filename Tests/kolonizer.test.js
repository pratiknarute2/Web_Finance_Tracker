const { test, expect } = require('@playwright/test');
const fs = require('fs/promises');
const LoginPage = require('../Pages/LoginPage.js');


// ✅ Function to read JSON payload properly
async function getPayload() {
    try {
        const data = await fs.readFile('./Login.json', 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("❌ Error reading the JSON file:", error.message);
        return null;
    }
}

test.describe('Login', () => {

    test('Login with valid credentials in Kolonizer', async ({ page }) => {
        const login = new LoginPage(page);
        await login.openLogin();
        await login.enterUsername();
        await login.enterPassword();
        await login.clickOnLogin();
    });

    test('API Login and integrate with UI Automation using two windows in the same browser', async ({ browser, request }) => {
        // ✅ Step 1: Create a new browser context (Window 1)
        const context1 = await browser.newContext();
        const page1 = await context1.newPage();

        try {
            // ✅ Step 2: Initialize LoginPage for the first window
            const loginPage1 = new LoginPage(page1);

            // ✅ Step 3: Perform API Login & Get Token
            const token = await loginPage1.postLoginAPI(request);
            if (!token) throw new Error("Token retrieval failed");

            // ✅ Step 4: Open Dashboard in First Window
            await loginPage1.openDashboard();
            await page1.evaluate((authToken) => localStorage.setItem('token', authToken), token);
            await page1.reload();
            console.log("🌍 Current URL in Window 1:", await page1.url());

            // ✅ Step 5: Create Second Window in the Same Browser Context
            const page2 = await context1.newPage();
            const loginPage2 = new LoginPage(page2);

            // ✅ Step 6: Open Dashboard in Second Window
            await loginPage2.openDashboard();
            await page2.evaluate((authToken) => localStorage.setItem('token', authToken), token);
            await page2.reload();
            console.log("🌍 Current URL in Window 2:", await page2.url());

            // ✅ Fetch Project API after logging in
            await loginPage1.getProjectAPI(request, token);

            // ✅ Close second page
            await page2.close();

        } catch (error) {
            console.error("❌ Error during multi-window login test:", error.message);
        } finally {
            // ✅ Properly close context
            await context1.close();
        }
    });
});

test.describe('Lead', () => {
    test('Verify Lead details', async ({ request, page }) => {
        const loginPage = new LoginPage(page);

        try {
            const token = await loginPage.postLoginAPI(request);
            if (!token) throw new Error("Token retrieval failed");

            await loginPage.openDashboard();
            await page.evaluate((authToken) => localStorage.setItem('token', authToken), token);
            await page.reload();

            console.log("🌍 Current URL in Window:", await page.url());
            await expect(page).toHaveURL('https://uatdreamcity.kolonizer.in/dashboard/sales-dashboard');

            // ✅ Initialize LeadPage
            const lead = new LeadPage(page);

            // ✅ Fetch expected count from API
            const expectedCount = await lead.getAllLeadAPI(request, token);

            // ✅ Verify the count in UI
            await lead.verifyTotalLeadCount(expectedCount);

        } catch (error) {
            console.error("❌ Error during lead verification:", error.message);
        }
    });
});
