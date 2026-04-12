const { test, expect } = require('@playwright/test');
const CategoryPage = require('../pages/CategoryPage');

test.describe('Expense Tracker UI - Category flows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/manage-categories');
    });

    test('Create category via UI', async ({ page }) => {
        const category = new CategoryPage(page);

        const name = 'Testing Category ' + Date.now();
        await category.createCategory(name);

        // wait for list update
        await expect(category.categoriesList).toContainText(name);

        expect(await category.categoryExists(name)).toBe(true);
    });
});
