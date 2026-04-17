const { test, expect } = require('@playwright/test');
const Get = require('../../API/Get');
const FinanceApiHelper = require('../helpers/financeApiHelper');

test.describe.serial('API coverage labels', () => {
    test('Create label for transaction reuse', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const label = await helper.createLabel();

        try {
            const labels = await new Get(request).getLabelAPI();
            expect(labels.some((item) => `${item.id}` === `${label.id}` && item.name === label.name)).toBeTruthy();
        } finally {
            await helper.deleteById('labels', label.id);
        }
    });

    test('Increase label usage after transaction', async ({ request }) => {
        const helper = new FinanceApiHelper(request);
        const label = await helper.createLabel();

        try {
            const usageBefore = await new Get(request).getLabelUsageAPI();
            const beforeCount = usageBefore.find((item) => `${item.id}` === `${label.id}`)?.count || 0;

            const transaction = await helper.createTransaction({
                type: 'debit',
                category: 'Food',
                amount: 40,
                labelIds: [label.id]
            });

            await expect.poll(async () => {
                const usageAfter = await new Get(request).getLabelUsageAPI();
                return usageAfter.find((item) => `${item.id}` === `${label.id}`)?.count || 0;
            }, {
                timeout: 15000,
                message: 'Wait for label usage to reflect the new transaction'
            }).toBe(beforeCount + 1);

            await helper.deleteById('transactions', transaction.id);
        } finally {
            await helper.deleteById('labels', label.id);
        }
    });
});
