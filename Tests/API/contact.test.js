const { test, expect } = require('@playwright/test');
const Post = require('../../API/Post.js');
const Get = require('../../API/Get.js');
const Put = require('../../API/Put.js');
const Delete = require('../../API/Delete.js');
const fs = require("fs/promises");

test.describe.serial('👥 Manage Contacts', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI(request);
        const data = JSON.parse(await fs.readFile('API/Payloads.json', 'utf-8'));
        const payloadBody = data[`Contact`];
        if (payloadBody?.name) {
            await new Delete(request).deleteEntityByNameIfExists('contacts', payloadBody.name);
        }
    });
    test('POST | Create Contact', async ({ request }) => {
        await new Post(request).postContactAPI();
    });
    test('GET | Fetch Contacts', async ({ request }) => {
        await new Get(request).getContactsAPI();
    });
    test('PUT | Update Contact', async ({ request }) => {
        await new Put(request).updateContactsApi();
    });
    test('DELETE | Delete Contact', async ({ request }) => {
        await new Delete(request).deleteContactsAPI();
    });
});
