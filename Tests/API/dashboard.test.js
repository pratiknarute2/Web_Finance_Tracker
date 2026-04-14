const { test, expect } = require('@playwright/test');
const Post = require('../../API/Post.js');
const Get = require('../../API/Get.js');
const Delete = require('../../API/Delete.js');
const Utility = require('../../Base/Utility.js');
const { API_URL } = require('../../playwright.config.js');

let utility;

function parseNumber(value) {
    return Number.parseFloat(value) || 0;
}
function sumTransactionAmounts(transactions, type) {
    return transactions
        .filter((transaction) => transaction.type === type)
        .reduce((total, transaction) => total + parseNumber(transaction.amount), 0);
}
function buildCategoryTotals(transactions, type) {
    return transactions
        .filter((transaction) => transaction.type === type)
        .reduce((totals, transaction) => {
            const key = (transaction.category || '').trim();
            totals[key] = (totals[key] || 0) + parseNumber(transaction.amount);
            return totals;
        }, {});
}
function sumObjectValues(values) {
    return Object.values(values).reduce((total, amount) => total + parseNumber(amount), 0);
}
function getPercentageSumFromTotals(totals) {
    const total = sumObjectValues(totals);
    if (total === 0) {
        return 0;
    }
    return Object.values(totals)
        .map((amount) => (parseNumber(amount) / total) * 100)
        .reduce((sum, percentage) => sum + percentage, 0);
}
function getUsageCount(usageResponse, labelId) {
    const usage = usageResponse.find((item) => `${item.id}` === `${labelId}`);
    return usage ? usage.count : 0;
}
function getSignedAmount(transaction) {
    const amount = parseNumber(transaction.amount);
    return transaction.type === 'credit' ? amount : amount * -1;
}
function sortTransactionsChronologically(transactions) {
    return [...transactions].sort((left, right) => {
        const leftDate = new Date(`${left.date}T${left.time || '00:00:00.000'}`).getTime();
        const rightDate = new Date(`${right.date}T${right.time || '00:00:00.000'}`).getTime();
        return leftDate - rightDate;
    });
}

test.describe.serial('📊 Dashboard API Feature', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI();
        utility = new Utility();
    });
    test('GET | Dashboard source transactions should expose chart-ready fields', async ({ request }) => {
        const transactionsResponse = await new Get(request).getTransactionAPI();
        const transactions = transactionsResponse.content;
        expect(Array.isArray(transactions)).toBeTruthy();
        expect(transactions.length).toBeGreaterThan(0);
        expect(transactions.some((transaction) => transaction.type === 'debit')).toBeTruthy();
        expect(transactions.some((transaction) => transaction.type === 'credit')).toBeTruthy();
        const latestTransaction = transactions[0];
        expect(latestTransaction.id).toBeTruthy();
        expect(latestTransaction.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(['debit', 'credit']).toContain(latestTransaction.type);
        expect((latestTransaction.category || '').trim().length).toBeGreaterThan(0);
        expect(Number.isFinite(parseNumber(latestTransaction.amount))).toBeTruthy();
        expect(Number.isFinite(parseNumber(latestTransaction.runningBalance))).toBeTruthy();
        expect(Array.isArray(latestTransaction.labelIds)).toBeTruthy();
    });
    test('GET | Dashboard balances should stay continuous across recent transactions', async ({ request }) => {
        const get = new Get(request);
        const transactionsResponse = await get.getAllTransactionsAPI();
        const transactions = transactionsResponse.content;
        const openingBalance = parseNumber(await get.getOpeningBalanceAPI());
        const totalDebit = sumTransactionAmounts(transactions, 'debit');
        const totalCredit = sumTransactionAmounts(transactions, 'credit');
        const calculatedCurrentBalance = openingBalance + totalCredit - totalDebit;

        const chronologicalTransactions = sortTransactionsChronologically(transactions);
        const recentTransactions = chronologicalTransactions.slice(-10);

        expect(openingBalance).toBeGreaterThanOrEqual(0);
        expect(totalDebit).toBeGreaterThan(0);
        expect(totalCredit).toBeGreaterThan(0);
        expect(Number.isFinite(calculatedCurrentBalance)).toBeTruthy();
        expect(recentTransactions.length).toBeGreaterThan(2);

        for (let index = 1; index < recentTransactions.length; index++) {
            const previousTransaction = recentTransactions[index - 1];
            const currentTransaction = recentTransactions[index];
            const expectedRunningBalance = parseNumber(previousTransaction.runningBalance) + getSignedAmount(currentTransaction);

            expect(parseNumber(currentTransaction.runningBalance)).toBeCloseTo(expectedRunningBalance, 2);
        }
    });
    test('GET | Dashboard debit and credit category percentages should total 100 percent', async ({ request }) => {
        const transactionsResponse = await new Get(request).getAllTransactionsAPI();
        const transactions = transactionsResponse.content;
        for (const transactionType of ['debit', 'credit']) {
            const categoryTotals = buildCategoryTotals(transactions, transactionType);
            const categoryNames = Object.keys(categoryTotals);
            const totalAmount = sumObjectValues(categoryTotals);
            const percentageSum = getPercentageSumFromTotals(categoryTotals);
            expect(categoryNames.length).toBeGreaterThan(0);
            expect(totalAmount).toBeGreaterThan(0);
            expect(percentageSum).toBeCloseTo(100, 5);
            for (const categoryName of categoryNames) {
                expect(categoryName.length).toBeGreaterThan(0);
                expect(parseNumber(categoryTotals[categoryName])).toBeGreaterThan(0);
            }
        }
    });
    test('GET | Dashboard label usage should map to labels and percentage totals', async ({ request }) => {
        const get = new Get(request);
        const labels = await get.getLabelAPI();
        const labelUsage = await get.getLabelUsageAPI();
        expect(Array.isArray(labels)).toBeTruthy();
        expect(Array.isArray(labelUsage)).toBeTruthy();
        expect(labels.length).toBeGreaterThan(0);
        const labelMap = new Map(labels.map((label) => [`${label.id}`, label]));
        const essentialsLabel = labels.find((label) => label.name === 'Essentials');
        const nonEssentialsLabel = labels.find((label) => label.name === 'Non-Essentials');
        const totalUsage = labelUsage.reduce((total, item) => total + parseNumber(item.count), 0);
        const usagePercentageSum = totalUsage === 0
            ? 0
            : labelUsage
                .map((item) => (parseNumber(item.count) / totalUsage) * 100)
                .reduce((sum, percentage) => sum + percentage, 0);
        expect(essentialsLabel).toBeDefined();
        expect(nonEssentialsLabel).toBeDefined();
        for (const usage of labelUsage) {
            expect(labelMap.has(`${usage.id}`)).toBeTruthy();
            expect(Number.isInteger(usage.count)).toBeTruthy();
            expect(usage.count).toBeGreaterThanOrEqual(0);
        }
        if (totalUsage > 0) {
            expect(usagePercentageSum).toBeCloseTo(100, 5);
        }
    });
    test('POST/DELETE | Dashboard source data should update for a new essentials debit transaction', async ({ request }) => {
        const get = new Get(request);
        const del = new Delete(request);
        const labels = await get.getLabelAPI();
        const essentialsLabel = labels.find((label) => label.name === 'Essentials');
        expect(essentialsLabel).toBeDefined();
        const beforeTransactions = (await get.getAllTransactionsAPI()).content;
        const beforeLabelUsage = await get.getLabelUsageAPI();
        const beforeDebitTotal = sumTransactionAmounts(beforeTransactions, 'debit');
        const beforeFoodTotal = buildCategoryTotals(beforeTransactions, 'debit').Food || 0;
        const beforeEssentialsUsage = getUsageCount(beforeLabelUsage, essentialsLabel.id);
        const payload = {
            date: '2026-04-14',
            type: 'debit',
            category: 'Food',
            amount: 10,
            reimbursable: 'N',
            comments: `Dashboard API ${Date.now()}`,
            labelIds: [essentialsLabel.id]
        };
        const createTransactionResponse = await request.post(`${API_URL}/api/transactions`, {
            data: payload,
            headers: utility.getAuthHeaders(),
            timeout: 60000
        });
        expect(createTransactionResponse.ok()).toBeTruthy();
        const createdTransaction = await createTransactionResponse.json();
        global.transactionId = createdTransaction.id;
        try {
            await expect.poll(async () => {
                const afterTransactions = (await get.getAllTransactionsAPI()).content;
                const afterDebitTotal = sumTransactionAmounts(afterTransactions, 'debit');
                return Number(afterDebitTotal.toFixed(2));
            }, {
                timeout: 15000,
                message: 'Wait for debit dashboard source total to update'
            }).toBe(Number((beforeDebitTotal + payload.amount).toFixed(2)));
            await expect.poll(async () => {
                const afterTransactions = (await get.getAllTransactionsAPI()).content;
                const afterFoodTotal = buildCategoryTotals(afterTransactions, 'debit').Food || 0;
                return Number(afterFoodTotal.toFixed(2));
            }, {
                timeout: 15000,
                message: 'Wait for food debit category total to update'
            }).toBe(Number((beforeFoodTotal + payload.amount).toFixed(2)));
            await expect.poll(async () => {
                const afterTransactions = (await get.getAllTransactionsAPI()).content;
                const createdTransactionFromList = afterTransactions.find((transaction) => `${transaction.id}` === `${createdTransaction.id}`);
                return !!createdTransactionFromList;
            }, {
                timeout: 15000,
                message: 'Wait for created dashboard transaction to appear in transactions API'
            }).toBe(true);
            await expect.poll(async () => {
                const afterLabelUsage = await get.getLabelUsageAPI();
                return getUsageCount(afterLabelUsage, essentialsLabel.id);
            }, {
                timeout: 15000,
                message: 'Wait for essentials label usage to update'
            }).toBe(beforeEssentialsUsage + 1);
        } finally {
            await del.deleteTransactionAPI('dashboard');
        }
    });
});
