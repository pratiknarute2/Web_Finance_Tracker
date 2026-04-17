const { test, expect } = require('@playwright/test');
const Post = require('../../API/Post.js');
const Get = require('../../API/Get.js');
const Put = require('../../API/Put.js');
const Delete = require('../../API/Delete.js');
const fs = require("fs/promises");

test.describe.serial('API categories', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI();
        const data = JSON.parse(await fs.readFile('API/Payloads.json', 'utf-8'));
        let payloadBody = data[`Categories_debit`];
        await new Delete(request).deleteEntityByNameIfExists('categories', payloadBody.name, { type: payloadBody.type });
        payloadBody = data[`Categories_credit`];
        await new Delete(request).deleteEntityByNameIfExists('categories', payloadBody.name, { type: payloadBody.type });
        payloadBody = data[`Category_given_Ledger`];
        await new Delete(request).deleteEntityByNameIfExists('categories', payloadBody.name, { type: payloadBody.type });
        payloadBody = data[`Category_received_Ledger`];
        await new Delete(request).deleteEntityByNameIfExists('categories', payloadBody.name, { type: payloadBody.type });
    });

    test.describe('Debit', () => {
        test('Create debit category', async ({ request }) => {
            await new Post(request).postCategoriesAPI('debit');
        });
        test('Fetch categories', async ({ request }) => {
            const get = new Get(request);
            await get.getCategoryAPI();
        });
        test('Update debit category', async ({ request }) => {
            await new Put(request).updateCategoriesAPI('debit');
        });
        test('Delete debit category', async ({ request }) => {
            await new Delete(request).deleteCategoriesAPI('debit');
        });
    });

    test.describe('Credit', () => {
        test('Create credit category', async ({ request }) => {
            await new Post(request).postCategoriesAPI('credit');
        });
        test('Update credit category', async ({ request }) => {
            await new Put(request).updateCategoriesAPI('credit');
        });
        test('Delete credit category', async ({ request }) => {
            await new Delete(request).deleteCategoriesAPI('credit');
        });
    });

    test.describe('Given', () => {
        test('Create given category', async ({ request }) => {
            await new Post(request).postGivenCategoryAPI();
        });
        test('Fetch given category', async ({ request }) => {
            const response = await new Get(request).getCategoryAPI();
            const givenCategory = await response.find(category => category.id === global.givenCategoryId);
            expect.soft(givenCategory).toBeDefined();
            expect.soft(givenCategory.id).toBe(global.givenCategoryId);
        });
        test('Update given category', async ({ request }) => {
            await new Put(request).updateGivenCategoryAPI();
        });
        test('Delete given category', async ({ request }) => {
            await new Delete(request).deleteGivenCategoryAPI();
        });
    });

    test.describe('Received', () => {
        test('Create received category', async ({ request }) => {
            await new Post(request).postReceivedCategoryAPI();
        });
        test('Fetch received category', async ({ request }) => {
            const response = await new Get(request).getCategoryAPI();
            const receivedCategory = await response.find(category => category.id === global.receivedCategoryId);
            expect.soft(receivedCategory).toBeDefined();
            expect.soft(receivedCategory.id).toBe(global.receivedCategoryId);
        });
        test('Update received category', async ({ request }) => {
            await new Put(request).updateReceivedCategoryAPI();
        });
        test('Delete received category', async ({ request }) => {
            await new Delete(request).deleteReceivedCategoryAPI();
        });
    });
});
