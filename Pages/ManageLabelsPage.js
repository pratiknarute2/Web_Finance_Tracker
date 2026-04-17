const { expect } = require('@playwright/test');
const AppShellPage = require('./AppShellPage');

class ManageLabelsPage extends AppShellPage {
    constructor(page) {
        super(page);
        this.labelNameInput = page.getByPlaceholder('Enter a new label name');
        this.addLabelButton = page.getByRole('button', { name: /add label/i }).first();
    }

    async open() {
        await this.openModule('Manage Labels');
        await expect(this.page.getByRole('heading', { name: /manage labels/i })).toBeVisible();
    }

    async createLabel(labelName) {
        await this.fillInputField(this.labelNameInput, labelName, 'Label Name');
        await this.clickElement(this.addLabelButton, 'Add Label');
    }

    async expectLabelVisible(labelName) {
        const label = this.page.getByText(labelName, { exact: true });
        await expect.poll(async () => label.count(), {
            timeout: 10000,
            message: `Wait for label ${labelName} to appear in the list`
        }).toBeGreaterThan(0);
        await expect(label.first()).toBeVisible();
    }
}

module.exports = ManageLabelsPage;
