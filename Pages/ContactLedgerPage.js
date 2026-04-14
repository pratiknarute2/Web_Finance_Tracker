const { expect } = require('@playwright/test');
const AppShellPage = require('./AppShellPage');

class ContactLedgerPage extends AppShellPage {
    constructor(page) {
        super(page);
        this.searchInput = page.getByPlaceholder('Search contacts...');
    }

    async open() {
        await this.openModule('Contact Ledger');
        await expect(this.page.getByRole('button', { name: /^home$/i })).toBeVisible();
    }

    async searchContact(contactName) {
        await this.fillInputField(this.searchInput, contactName, 'Ledger Contact Search');
    }

    async expectContactVisible(contactName) {
        await expect(this.page.getByText(contactName, { exact: true })).toBeVisible();
    }

    async expectTransactionDetailsVisible(textValue) {
        await expect(this.page.getByText(textValue, { exact: true })).toBeVisible();
    }
}

module.exports = ContactLedgerPage;
