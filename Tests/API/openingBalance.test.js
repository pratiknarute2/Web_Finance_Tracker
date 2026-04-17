const { test, expect } = require('@playwright/test');
const Post = require('../../API/Post.js');
const Get = require('../../API/Get.js');

test.describe.serial('API opening balance', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI();
    });

    test('Fetch opening balance', async ({ request }) => {
        const get = new Get(request);
        await get.getOpeningBalanceAPI();
    });
});
