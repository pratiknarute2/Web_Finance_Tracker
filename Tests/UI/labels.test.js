const { test, expect } = require('@playwright/test');
const LoginPage = require('../../Pages/LoginPage');
const TransactionPage = require('../../Pages/TransactionPage');
const ManageLabelsPage = require('../../Pages/ManageLabelsPage');
const FinanceApiHelper = require('../helpers/financeApiHelper');
const { UI_URL } = require('../../playwright.config');

async function openTracker(page) {
    await page.goto(UI_URL.replace('/login', '/expense-tracker'));
    await page.waitForLoadState('networkidle');
}

test.describe.serial('UI coverage labels', () => {
    test.beforeEach(async ({ page, request }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_through_post_API(request);
    });

    test('Show new label in label management', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const manageLabelsPage = new ManageLabelsPage(page);
        const labelName = helper.buildUniqueName('UI Label');

        try {
            await manageLabelsPage.open();
            await manageLabelsPage.createLabel(labelName);
            await manageLabelsPage.expectLabelVisible(labelName);
        } finally {
            const labels = await helper.getJson('/api/labels', 'Get Labels After UI Create');
            const createdLabel = labels.find((item) => item.name === labelName);
            if (createdLabel) {
                await helper.deleteById('labels', createdLabel.id);
            }
        }
    });

    test('Show new label in transaction form', async ({ page, request }) => {
        const helper = new FinanceApiHelper(request);
        const transactionPage = new TransactionPage(page);
        const label = await helper.createLabel({
            name: helper.buildUniqueName('UI Label')
        });

        try {
            await openTracker(page);
            await transactionPage.openAddTransactionForm();
            await expect(page.getByText(label.name, { exact: true })).toBeVisible();
        } finally {
            await helper.deleteById('labels', label.id);
        }
    });
});
