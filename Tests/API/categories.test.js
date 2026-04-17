const { test, expect } = require('@playwright/test');
const Get = require('../../API/Get');
const FinanceApiHelper = require('../helpers/financeApiHelper');

test.describe.serial('API coverage categories', () => {
    test('Create debit category for transactions', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const debitCategory = await helper.createCategory('debit');

        try {
            const categories = await new Get(request).getCategoryAPI();
            const debitMatch = categories.find((item) => `${item.id}` === `${debitCategory.id}`);

            expect(debitMatch).toBeDefined();
            expect(debitMatch.name).toBe(debitCategory.name);
            expect(debitMatch.type).toBe('debit');
        } finally {
            await helper.deleteById('categories', debitCategory.id);
        }
    });

    test('Use debit category in transaction', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const debitCategory = await helper.createCategory('debit');

        try {
            const transaction = await helper.createTransaction({
                type: 'debit',
                category: debitCategory.name,
                amount: 20
            });

            expect(transaction.category).toBe(debitCategory.name);
            await helper.deleteById('transactions', transaction.id);
        } finally {
            await helper.deleteById('categories', debitCategory.id);
        }
    });

    test('Create credit category for transactions', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const creditCategory = await helper.createCategory('credit');

        try {
            const categories = await new Get(request).getCategoryAPI();
            const creditMatch = categories.find((item) => `${item.id}` === `${creditCategory.id}`);

            expect(creditMatch).toBeDefined();
            expect(creditMatch.name).toBe(creditCategory.name);
            expect(creditMatch.type).toBe('credit');
        } finally {
            await helper.deleteById('categories', creditCategory.id);
        }
    });

    test('Use credit category in transaction', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const creditCategory = await helper.createCategory('credit');

        try {
            const transaction = await helper.createTransaction({
                type: 'credit',
                category: creditCategory.name,
                amount: 30
            });

            expect(transaction.category).toBe(creditCategory.name);
            await helper.deleteById('transactions', transaction.id);
        } finally {
            await helper.deleteById('categories', creditCategory.id);
        }
    });
});
