const { expect } = require('@playwright/test');
const AppShellPage = require('./AppShellPage');

class ContactLedgerPage extends AppShellPage {
    constructor(page) {
        super(page);
        this.searchInput = page.getByPlaceholder('Search contacts...');
        this.transactionsTable = page.locator('table');
    }

    async open() {
        await this.openModule('Contact Ledger');
        await expect(this.page.getByRole('button', { name: /^home$/i })).toBeVisible();
    }

    async searchContact(contactName) {
        await this.fillInputField(this.searchInput, contactName, 'Ledger Contact Search');
    }

    async expectContactVisible(contactName) {
        await expect(this.transactionsTable.getByRole('cell', { name: contactName, exact: true }).first()).toBeVisible();
    }

    async expectTransactionDetailsVisible(textValue) {
        await expect(this.transactionsTable.getByRole('cell', { name: textValue, exact: true }).first()).toBeVisible();
    }
}

module.exports = ContactLedgerPage;
