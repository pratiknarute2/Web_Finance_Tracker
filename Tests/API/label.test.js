const { test, expect } = require('@playwright/test');
const Post = require('../../API/Post.js');
const Get = require('../../API/Get.js');
const Put = require('../../API/Put.js');
const Delete = require('../../API/Delete.js');
const fs = require("fs/promises");

test.describe.serial('🏷️ Label Feature', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI();
        const data = JSON.parse(await fs.readFile('API/Payloads.json', 'utf-8'));
        const payloadBody = data[`Label`];
        await new Delete(request).deleteEntityByNameIfExists('labels', payloadBody.name);
    });

    test('POST | Create Label', async ({ request }) => {
        await new Post(request).postLabelAPI();
    });

    test('GET | Fetch Label', async ({ request }) => {
        const get = new Get(request);
        await get.getLabelAPI();
    });

    test('PUT | Update Label', async ({ request }) => {
        await new Put(request).updateLabelAPI();
    });

    test('DELETE | Delete Label', async ({ request }) => {
        await new Delete(request).deleteLabelApi();
    });
});
