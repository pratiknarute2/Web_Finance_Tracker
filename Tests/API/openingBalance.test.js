const { test, expect } = require('@playwright/test');
const Post = require('../../API/Post.js');
const Get = require('../../API/Get.js');

// 💵 OPENING BALANCE FEATURE
test.describe.serial('💵 Opening Balance Feature', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI();
    });

    test('GET | Opening Balance API', async ({ request }) => {
        const get = new Get(request);
        await get.getOpeningBalanceAPI();
    });
});
