const { expect } = require('@playwright/test');
const AppShellPage = require('./AppShellPage');

class ManageContactsPage extends AppShellPage {
    constructor(page) {
        super(page);
        this.addNewContactButton = page.getByRole('button', { name: /add new contact/i });
        this.nameInput = page.locator('#name');
        this.emailInput = page.locator('#email');
        this.mobileInput = page.locator('#mobNo');
        this.addContactButton = page.getByRole('button', { name: /^add contact$/i });
    }

    async open() {
        await this.openModule('Manage Contacts');
        await expect(this.page.getByRole('heading', { name: /manage contacts/i })).toBeVisible();
    }

    async createContact(contact) {
        await this.clickElement(this.addNewContactButton, 'Add New Contact');
        await this.fillInputField(this.nameInput, contact.name, 'Contact Name');
        await this.fillInputField(this.emailInput, contact.email, 'Contact Email');
        await this.fillInputField(this.mobileInput, contact.mobNo, 'Contact Mobile Number');
        await this.clickElement(this.addContactButton, 'Add Contact');
    }

    async expectContactVisible(contactName) {
        const contact = this.page.getByText(contactName, { exact: true });
        await expect.poll(async () => contact.count(), {
            timeout: 10000,
            message: `Wait for contact ${contactName} to appear in the list`
        }).toBeGreaterThan(0);
        await expect(contact.first()).toBeVisible();
    }
}

module.exports = ManageContactsPage;
