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
        await expect(this.page.getByText(categoryName, { exact: true }).first()).toBeVisible();
    }
}

module.exports = ManageCategoriesPage;
