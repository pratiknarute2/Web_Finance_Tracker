const { test, expect } = require('@playwright/test');
const Post = require('../../API/Post.js');
const Get = require('../../API/Get.js');
const Put = require('../../API/Put.js');
const Delete = require('../../API/Delete.js');

test.describe('💳 Transaction Feature', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI();
    });
    test.describe.serial('Debit', () => {
        test('POST | Debit Transaction', async ({ request }) => {
            await new Post(request).postTransactionAPI('debit');
        });
        test('GET | Fetch Transaction', async ({ request }) => {
            await new Get(request).getTransactionAPI();
        });
        test('PUT | Update Debit Transaction', async ({ request }) => {
            await new Put(request).updateTransactionAPI('debit');
        });
        test('DELETE | Delete Debit Transaction', async ({ request }) => {
            await new Delete(request).deleteTransactionAPI('debit');
        });
    });
    test.describe.serial('Credit', () => {
        test('POST | Credit Transaction', async ({ request }) => {
            await new Post(request).postTransactionAPI('credit');
        });
        test('PUT | Update Credit Transaction', async ({ request }) => {
            await new Put(request).updateTransactionAPI('credit');
        });
        test('DELETE | Delete Credit Transaction', async ({ request }) => {
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
        test('POST | Given', async ({ request }) => {
            await new Post(request).postGivenContactLedgerTransactionAPI();
        });
        test('POST | Received', async ({ request }) => {
            await new Post(request).postReceivedContactLedgerTransactionAPI();
        });
        test('DELETE | Given', async ({ request }) => {
            await new Delete(request).deleteGivenContactLedgerTransactionAPI();
        });
        test('DELETE | Received', async ({ request }) => {
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
