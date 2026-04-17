const { expect } = require('@playwright/test');
const AppShellPage = require('./AppShellPage');

class ManageCategoriesPage extends AppShellPage {
    constructor(page) {
        super(page);
        this.debitCategoryInput = page.locator('[name="add-debit-input"]');
        this.creditCategoryInput = page.locator('[name="add-credit-input"]');
        this.addButtons = page.getByRole('button', { name: /^add$/i });
    }

    async open() {
        await this.openModule('Manage Categories');
        await expect(this.page.getByRole('heading', { name: /manage categories/i })).toBeVisible();
    }

    async addDebitCategory(categoryName) {
        await this.fillInputField(this.debitCategoryInput, categoryName, 'Debit Category Name');
        await this.clickElement(this.addButtons.nth(0), 'Add Debit Category');
    }

    async addCreditCategory(categoryName) {
        await this.fillInputField(this.creditCategoryInput, categoryName, 'Credit Category Name');
        await this.clickElement(this.addButtons.nth(1), 'Add Credit Category');
    }

    async expectCategoryVisible(categoryName) {
        const category = this.page.getByText(categoryName, { exact: true });
        await expect.poll(async () => category.count(), {
            timeout: 10000,
            message: `Wait for category ${categoryName} to appear in the list`
        }).toBeGreaterThan(0);
        await expect(category.first()).toBeVisible();
    }
}

module.exports = ManageCategoriesPage;
