const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility');
const { UI_URL } = require('../playwright.config.js')

class TransactionPage extends Utility {

    constructor(page) {
        super(page);
        this.page = page;

        // 🔹 Locators
        this.emailField = page.getByRole('textbox', { name: 'Email address' });
        this.passwordField = page.getByRole('textbox', { name: 'Password' });
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.addEntryButton = page.getByRole('button', { name: '+ Add Entry' });
        this.creditButton = page.getByRole('button', { name: 'Credit' });
        this.debitButton = page.getByRole('button', { name: 'Debit' });
        this.categoryDropdown = page.getByLabel('Category');
        this.amountField = page.getByRole('spinbutton', { name: 'Amount (₹) *' });
        this.commentField = page.getByRole('textbox', { name: 'Comments' });
        this.essentialsCategory = page.getByText('Essentials', { exact: true });
        this.unessentialsCategory = page.getByText('Unessentials', { exact: true });
        this.addTransactionButton = page.getByRole('button', { name: 'Add Transaction' });
        this.dateTab = page.getByRole('textbox', { name: 'Date *' });
    }

    async createTransaction(date_yyyy_mm_dd, transactionType, category, amount, label, comments) {
        console.log(`🔹 Creating ${transactionType} transaction`);

        // ✅ Open Transaction Modal
        await this.clickElement(this.addEntryButton, 'Add Entry');

        await this.fillInputField(this.dateTab, date_yyyy_mm_dd, 'Select Date')
        // ✅ Choose Transaction Type
        if (transactionType.toLowerCase() === 'credit') {
            await this.clickElement(this.creditButton, 'Credit');
        } else if (transactionType.toLowerCase() === 'debit') {
            await this.clickElement(this.debitButton, 'Debit');
        } else {
            throw new Error('❌ Invalid transaction type! Use either "credit" or "debit".');
        }

        // ✅ Fill transaction details
        await this.selectDropdown(this.categoryDropdown, category, 'Categry Dropdown');
        await this.fillInputField(this.amountField, amount, 'Amount Field');
        await this.fillInputField(this.commentField, comments, "Comment Field");

        // ✅ Choose Label (use the `label` parameter passed to the function)
        const labelLower = (label || '').toLowerCase();
        if (labelLower === 'essentials') {
            await this.clickElement(this.essentialsCategory, 'Essentials');
        } else if (labelLower === 'unessentials' || labelLower === 'unessentials') {
            await this.clickElement(this.unessentialsCategory, 'UnEssentials');
        } else {
            // If an unknown label is provided, try to click by exact text as a fallback
            const labelElement = this.page.getByText(label || '', { exact: true });
            if (labelElement) {
                await this.clickElement(labelElement, `Label: ${label}`);
            } else {
                throw new Error('❌ Invalid Label!');
            }
        }

        await this.clickElement(this.addTransactionButton, 'Add Transaction');
        await this.staticWait(1)
        return {
            date_yyyy_mm_dd,
            transactionType,
            category,
            amount,
            label
        };

    }


}


module.exports = TransactionPage;
