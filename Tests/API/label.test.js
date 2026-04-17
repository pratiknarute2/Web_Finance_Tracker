const { test } = require('@playwright/test');
const Post = require('../../API/Post.js');
const Get = require('../../API/Get.js');
const Put = require('../../API/Put.js');
const Delete = require('../../API/Delete.js');
const fs = require("fs/promises");

test.describe.serial('API labels', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI();
        const data = JSON.parse(await fs.readFile('API/Payloads.json', 'utf-8'));
        const payloadBody = data[`Label`];
        await new Delete(request).deleteEntityByNameIfExists('labels', payloadBody.name);
    });

    test('Create label', async ({ request }) => {
        await new Post(request).postLabelAPI();
    });

    test('Fetch labels', async ({ request }) => {
        const get = new Get(request);
        await get.getLabelAPI();
    });

    test('Fetch label usage', async ({ request }) => {
        const get = new Get(request);
        await get.getLabelUsageAPI();
    });

    test('Update label', async ({ request }) => {
        await new Put(request).updateLabelAPI();
    });

    test('Delete label', async ({ request }) => {
        await new Delete(request).deleteLabelApi();
    });
});
