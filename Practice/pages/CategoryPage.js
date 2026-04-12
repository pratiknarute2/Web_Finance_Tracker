const BasePage = require('./BasePage');

class CategoryPage extends BasePage {
    constructor(page) {
        super(page);
        this.newCategoryInput = page.locator('input[name="categoryName"]');
        this.saveCategoryBtn = page.locator('button:has-text("Save")');
        this.categoriesList = page.locator('table tr');
    }

    async open() {
        await this.navigate('/manage-categories');
    }

    async createCategory(name, type = 'debit') {
        await this.newCategoryInput.fill(name);
        await this.saveCategoryBtn.click();
    }

    async categoryExists(name) {
        return this.categoriesList.locator(`text=${name}`).count().then(c => c > 0);
    }
}

module.exports = CategoryPage;
