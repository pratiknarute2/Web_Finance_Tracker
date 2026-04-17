const { test, expect } = require('@playwright/test');
const Post = require('../../API/Post.js');
const Get = require('../../API/Get.js');
const Put = require('../../API/Put.js');
const Delete = require('../../API/Delete.js');

test.describe('API transactions', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI();
    });
    test.describe.serial('Debit', () => {
        test('Create debit transaction', async ({ request }) => {
            await new Post(request).postTransactionAPI('debit');
        });
        test('Fetch transactions', async ({ request }) => {
            await new Get(request).getTransactionAPI();
        });
        test('Update debit transaction', async ({ request }) => {
            await new Put(request).updateTransactionAPI('debit');
        });
        test('Delete debit transaction', async ({ request }) => {
            await new Delete(request).deleteTransactionAPI('debit');
        });
    });
    test.describe.serial('Credit', () => {
        test('Create credit transaction', async ({ request }) => {
            await new Post(request).postTransactionAPI('credit');
        });
        test('Update credit transaction', async ({ request }) => {
            await new Put(request).updateTransactionAPI('credit');
        });
        test('Delete credit transaction', async ({ request }) => {
            await new Delete(request).deleteTransactionAPI('credit');
        });
    });
    test.describe.serial('Contact Ledger Transactions', () => {
        test.beforeAll(async ({ request }) => {
            await new Post(request).postGivenCategoryAPI();
            await new Post(request).postReceivedCategoryAPI();
            await new Post(request).postContactAPI();
            await new Post(request).postLabelAPI();
        });
        test('Create given ledger transaction', async ({ request }) => {
            await new Post(request).postGivenContactLedgerTransactionAPI();
        });
        test('Create received ledger transaction', async ({ request }) => {
            await new Post(request).postReceivedContactLedgerTransactionAPI();
        });
        test('Delete given ledger transaction', async ({ request }) => {
            await new Delete(request).deleteGivenContactLedgerTransactionAPI();
        });
        test('Delete received ledger transaction', async ({ request }) => {
            await new Delete(request).deleteReceivedContactLedgerTransactionAPI();
        });
        test.afterAll(async ({ request }) => {
            await new Delete(request).deleteGivenCategoryAPI();
            await new Delete(request).deleteReceivedCategoryAPI();
            await new Delete(request).deleteContactsAPI();
            await new Delete(request).deleteLabelApi();
        });
    });
});
