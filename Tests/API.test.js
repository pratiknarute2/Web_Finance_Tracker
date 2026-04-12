const { test, expect } = require('@playwright/test');
const LoginPage = require('../Pages/LoginPage');
const HomePage = require('../Pages/HomePage');
const TransactionPage = require('../Pages/TransactionPage');
const Utility = require('../Base/Utility.js');
const Post = require('../API/Post.js');
const Get = require('../API/Get.js');
const Put = require('../API/Put.js');
const Delete = require('../API/Delete.js');
const fs = require("fs/promises");

let token = '';
let utility;

// 🔐 AUTHENTICATION FEATURE
test.describe('🔐 Login Authentication', () => {
    test('POST | Login through API', async ({ request, page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_through_post_API(request);
    });
});

// 🏷️ LABEL FEATURE
test.describe.serial('🏷️ Label Feature', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI()

        const data = JSON.parse(await fs.readFile('API/Payloads.json', 'utf-8'));
        const payloadBody = data[`Label`];
        await new Delete(request).deleteEntityByNameIfExists('labels', payloadBody.name)
    })
    test('Post | Create Label', async ({ request }) => {
        const labelResponse = await new Post(request).postLabelAPI()
    })

    test('GET | Fetch Label', async ({ request }) => {
        const get = new Get(request);
        await get.getLabelAPI();
    });
    test('Update | Update Label', async ({ request }) => {
        await new Put(request).updateLabelAPI()
    })
    test('Delete | Delete Label', async ({ request }) => {
        await new Delete(request).deleteLabelApi()

    })
});

// 💵 OPENING BALANCE FEATURE
test.describe.serial('💵 Opening Balance Feature', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI()
    })

    test('GET | Opening Balance API', async ({ request }) => {
        const get = new Get(request);
        await get.getOpeningBalanceAPI();
    });
});


// 💰 CATEGORY FEATURE
test.describe.serial('💰 Category Feature', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI()

        const data = JSON.parse(await fs.readFile('API/Payloads.json', 'utf-8'));

        let payloadBody = data[`Categories_debit`];
        await new Delete(request).deleteEntityByNameIfExists('categories', payloadBody.name)

        payloadBody = data[`Categories_credit`];
        await new Delete(request).deleteEntityByNameIfExists('categories', payloadBody.name)

        payloadBody = data[`Category_given_Ledger`];
        await new Delete(request).deleteEntityByNameIfExists('categories', payloadBody.name)

        payloadBody = data[`Category_received_Ledger`];
        await new Delete(request).deleteEntityByNameIfExists('categories', payloadBody.name)
    })

    test.describe('Debit', () => {
        test('POST | Create Debit Category', async ({ request }) => {
            const post = new Post(request);
            await post.postCategoriesAPI('debit');
        });

        test('GET | Fetch Categories', async ({ request }) => {
            const get = new Get(request);
            await get.getCategoryAPI();
        });

        test('PUT | Update Debit Category', async ({ request }) => {
            const put = new Put(request);
            await put.updateCategoriesAPI('debit');
        });

        // test('DELETE | Delete Debit Category', async ({ request }) => {
        //     const del = new Delete(request);
        //     await del.deleteCategoriesAPI('debit');
        // });

    });

    test.describe('Credit', () => {
        test('POST | Create Credit Category', async ({ request }) => {
            const post = new Post(request);
            await post.postCategoriesAPI('credit');
        });

        test('PUT | Update Credit Category', async ({ request }) => {
            const put = new Put(request);
            await put.updateCategoriesAPI('credit');
        });

        test('DELETE | Delete Credit Category', async ({ request }) => {
            const del = new Delete(request);
            await del.deleteCategoriesAPI('credit');
        });

    });

    test.describe('Given', () => {
        test('POST | Create', async ({ request }) => {
            await new Post(request).postGivenCategoryAPI()
        });
        test('GET | Fetch', async ({ request }) => {
            const response = await new Get(request).getCategoryAPI()
            const givenCategory = await response.find(category => category.id === global.givenCategoryId);
            expect.soft(givenCategory).toBeDefined();
            expect.soft(givenCategory.id).toBe(global.givenCategoryId);
        });
        test('PUT | Update', async ({ request }) => {
            await new Put(request).updateGivenCategoryAPI()

        });
        test('DELETE | Delete', async ({ request }) => {
            await new Delete(request).deleteGivenCategoryAPI()
        });
    });

    test.describe('Received', () => {
        test('POST | Create', async ({ request }) => {
            await new Post(request).postReceivedCategoryAPI()

        });
        test('GET | Fetch', async ({ request }) => {
            const response = await new Get(request).getCategoryAPI()
            const receivedCategory = await response.find(category => category.id === global.receivedCategoryId);
            expect.soft(receivedCategory).toBeDefined();
            expect.soft(receivedCategory.id).toBe(global.receivedCategoryId);
        });
        test('PUT | Update', async ({ request }) => {
            await new Put(request).updateReceivedCategoryAPI()
        });
        test('DELETE | Delete', async ({ request }) => {
            await new Delete(request).deleteReceivedCategoryAPI()
        });
    });


});
// Manage Contact
test.describe.serial('Manage Contacts', async () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI(request)
        const data = JSON.parse(await fs.readFile('API/Payloads.json', 'utf-8'));
        const payloadBody = data[`Contact`];
        if (payloadBody?.name) {
            await new Delete(request).deleteEntityByNameIfExists('contacts', payloadBody.name)
        }
    })
    test('POST | Create Contact', async ({ request }) => {
        await new Post(request).postContactAPI()
    })
    test('GET | Fetch Contacts', async ({ request }) => {
        await new Get(request).getContactsAPI()
    })
    test('PUT | Update Contact', async ({ request }) => {
        await new Put(request).updateContactsApi()
    })
    test('DELETE | Delete Contact', async ({ request }) => {
        await new Delete(request).deleteContactsAPI()
    })

})

// 💳 TRANSACTION FEATURE
test.describe('💳 Transaction Feature', () => {
    test.beforeAll(async ({ request }) => {
        await new Post(request).postLoginAPI()
    })
    test.describe.serial('Debit', async () => {
        test('POST | Debit Transaction', async ({ request }) => {
            const post = new Post(request);
            await post.postTransactionAPI('debit');
        });
        test('GET | Fetch Transaction', async ({ request }) => {
            const get = new Get(request);
            await get.getTransactionAPI();
        });

        test('PUT | Update Debit Transaction', async ({ request }) => {
            const put = new Put(request);
            await put.updateTransactionAPI('debit');
        });

        test('DELETE | Delete Debit Transaction', async ({ request }) => {
            const del = new Delete(request);
            await del.deleteTransactionAPI('debit');
        });

    })
    test.describe.serial('Credit', async () => {
        test('POST | Credit Transaction', async ({ request }) => {
            const post = new Post(request);
            await post.postTransactionAPI('credit');
        });
        test('PUT | Update Credit Transaction', async ({ request }) => {
            const put = new Put(request);
            await put.updateTransactionAPI('credit');
        });
        test('DELETE | Delete Credit Transaction', async ({ request }) => {
            const del = new Delete(request);
            await del.deleteTransactionAPI('credit');
        });

    })

    test.describe.serial(`Contact Ledger Transactions`, async () => {
        test.beforeAll(async ({ request }) => {
            await new Post(request).postGivenCategoryAPI()
            await new Post(request).postReceivedCategoryAPI()
            await new Post(request).postContactAPI()
            await new Post(request).postLabelAPI()
        })
        test('POST | Given', async ({ request }) => {
            await new Post(request).postGivenContactLedgerTransactionAPI()
        })
        test('POST | Received', async ({ request }) => {
            await new Post(request).postReceivedContactLedgerTransactionAPI()
        })
        test('DELETE | Given', async ({ request }) => {
            await new Delete(request).deleteGivenContactLedgerTransactionAPI()
        })
        test('DELETE | Received', async ({ request }) => {
            await new Delete(request).deleteReceivedContactLedgerTransactionAPI()
        })
        test.afterAll(async ({ request }) => {
            await new Delete(request).deleteGivenCategoryAPI()
            await new Delete(request).deleteReceivedCategoryAPI()
            await new Delete(request).deleteContactsAPI()
            await new Delete(request).deleteLabelApi()
        })

    })
});








