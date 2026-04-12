const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility.js');
const Delete = require('../API/Delete.js');
const { API_URL } = require('../playwright.config.js');
const fs = require("fs/promises"); // Import dynamic API_URL

class Post extends Utility {
    constructor(request) {
        super(request);
        this.request = request;
    }

    async postLoginAPI() {
        const loginResponse = await this.postRequest(
            this.request,
            `${API_URL}/api/auth/login`, // ✅ Use dynamic URL
            'Login',
            'Post Login API'
        );
        expect(loginResponse.message).toBe('Logged in successfully');

        global.token = loginResponse.token;
        console.log('🔑 Global token set:', global.token);
        return loginResponse;
    }

    async postCategoriesAPI(transactionType) {
        const data = JSON.parse(await fs.readFile('API/Payloads.json', 'utf-8'));
        const payloadBody = data[`Categories_${transactionType}`];

        if (payloadBody?.name) {
            await new Delete(this.request).deleteEntityByNameIfExists('categories', payloadBody.name, { type: transactionType });
        }

        const categoryResponse = await this.postRequest(
            this.request,
            `${API_URL}/api/categories`,
            `Categories_${transactionType}`,
            `Post Categories API for ${transactionType}`
        );

        expect(categoryResponse.type).toBe(transactionType);
        global.categoryId = categoryResponse.id;
        console.log('🔑 Global category ID set:', global.categoryId);

        return categoryResponse;
    }

    async postTransactionAPI(transactionType) {
        const transactionResponse = await this.postRequest(
            this.request,
            `${API_URL}/api/transactions`,
            `Transaction_${transactionType}`,
            `Post Transaction API for ${transactionType}`
        );


        global.transactionId = transactionResponse.id;
        console.log('🔑 Global Transaction ID set:', global.transactionId);
        return transactionResponse;
    }

    async postLabelAPI(){
        const data = JSON.parse(await fs.readFile('API/Payloads.json', 'utf-8'));
        const payloadBody = data[`Label`];

        if (payloadBody?.name) {
            await new Delete(this.request).deleteEntityByNameIfExists('labels', payloadBody.name);
        }

        const labelResponse = await this.postRequest(
            this.request,
            `${API_URL}/api/labels`,
            `Label`,
            `Post Label API`
        )

        global.labelId = labelResponse.id
        console.log('🔑 Global Label ID set:', global.labelId);

        expect(labelResponse.name).toContain(payloadBody.name)
        return labelResponse;
    }
    async postGivenCategoryAPI(){
        const categoryResponse = await this.postRequest(
            this.request,
            `${API_URL}/api/categories`,
            `Category_given_Ledger`,
            `Post Given Category API`
        );
        global.givenCategoryId = categoryResponse.id
        console.log('🔑 Global Given Category ID set:', global.givenCategoryId);

        global.givenCategoryName = categoryResponse.name
        console.log('🔑 Global Given Category Name set:', global.givenCategoryName);

        const data = JSON.parse(await fs.readFile('API/Payloads.json','utf-8'))
        const payload = data['Category_given_Ledger']
        expect.soft(categoryResponse.name).toBe(payload.name)
        expect.soft(categoryResponse.type).toBe(payload.type)
        expect.soft(categoryResponse.status).toBe(payload.status)

        return categoryResponse;
    }
    async postReceivedCategoryAPI(){
        const categoryResponse = await this.postRequest(
            this.request,
            `${API_URL}/api/categories`,
            `Category_received_Ledger`,
            `Post Received Category API`
        );
        global.receivedCategoryId = categoryResponse.id
        console.log('🔑 Global Received Category ID set:', global.receivedCategoryId);

        global.receivedCategoryName = categoryResponse.name
        console.log('🔑 Global Received Category Name set:', global.receivedCategoryName);

        const data = JSON.parse(await fs.readFile('API/Payloads.json','utf-8'))
        const payload = data['Category_received_Ledger']
        expect.soft(categoryResponse.name).toBe(payload.name)
        expect.soft(categoryResponse.type).toBe(payload.type)
        expect.soft(categoryResponse.status).toBe(payload.status)
        return categoryResponse;
    }
    async postContactAPI(){
        const data = JSON.parse(await fs.readFile('API/Payloads.json','utf-8'))
        const payload = data['Contact']

        if (payload?.name) {
            await new Delete(this.request).deleteEntityByNameIfExists('contacts', payload.name);
        }

        const response = await this.postRequest(
            this.request,
            `${API_URL}/api/contacts`,
            `Contact`,
            `Post Contact API`
        )
        global.contactId = response.id
        global.contactName = response.name
        console.log('🔑 Global Contact ID set:', global.contactId);
        console.log('🔑 Global Contact Name set:', global.contactName);

        expect.soft(response.name).toBe(payload.name)
        expect.soft(response.email).toBe(payload.email)
        expect.soft(response.mobNo).toBe(payload.mobNo)
        return response;
    }
    async postGivenContactLedgerTransactionAPI(){
        const data = JSON.parse(await fs.readFile('API/Payloads.json','utf-8'))
        const Transaction_Received_Payload = data['Transaction_Given']

        Transaction_Received_Payload.labelIds = [global.labelId];
        Transaction_Received_Payload.contactId = global.contactId;
        Transaction_Received_Payload.category = global.givenCategoryName;

        // ✅ WRITE BACK TO FILE
        await fs.writeFile(
            'API/Payloads.json',
            JSON.stringify(data, null, 2),
            'utf-8'
        );
        const response = await this.postRequest(
            this.request,
            `${API_URL}/api/transactions`,
            `Transaction_Given`,
            `Post Given Contact Ledger Transaction API`
        )

        global.givenTransactionId = response.id
        console.log(`🔑 Global Given transaction Id Set: `, global.givenTransactionId);
    }
    async postReceivedContactLedgerTransactionAPI(){
        const data = JSON.parse(await fs.readFile('API/Payloads.json','utf-8'))
        const Transaction_Received_Payload = data['Transaction_Received']

        Transaction_Received_Payload.labelIds = [global.labelId];
        Transaction_Received_Payload.contactId = global.contactId;
        Transaction_Received_Payload.category = global.receivedCategoryName;

        // ✅ WRITE BACK TO FILE
        await fs.writeFile(
            'API/Payloads.json',
            JSON.stringify(data, null, 2),
            'utf-8'
        );
        const response = await this.postRequest(
            this.request,
            `${API_URL}/api/transactions`,
            `Transaction_Received`,
            `Post Received Contact Ledger Transaction API`
        )

        global.receivedTransactionId = response.id
        console.log(`🔑 Global Received transaction Id Set: `, global.receivedTransactionId);
    }
}

module.exports = Post;
