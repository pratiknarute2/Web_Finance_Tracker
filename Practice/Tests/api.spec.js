const { test, expect } = require('@playwright/test');
const APIUtils = require('../API/apiUtils');

const baseUrl = 'https://expense-tracker-backend-y788.onrender.com/api';

const loginPayload = {
    email: 'testingnotes011@gmail.com',
    password: 'Testing@123'
};

const makeName = (prefix) => `${prefix} ${Date.now()}`;
const makeAlphaName = (prefix) => `${prefix} ${Math.random().toString(36).replace(/[^a-z]+/g, '').slice(0, 6)}`;

const assertOk = async (response, context) => {
    if (!response.ok()) {
        const body = await response.text();
        throw new Error(`${context} failed with status ${response.status()}: ${body}`);
    }
    return response;
};

test.describe('Expense Tracker API practice full coverage', () => {

    const loginToken = async (request) => {
        const api = new APIUtils(request);
        const resLogin = await api.post(`${baseUrl}/auth/login`, loginPayload);
        expect(resLogin.ok()).toBeTruthy();

        const loginBody = await resLogin.json();
        expect(loginBody.token).toBeTruthy();
        return loginBody.token;
    };

    test('Category flow: create, update, cleanup', async ({ request }) => {
        const api = new APIUtils(request);
        const token = await loginToken(request);

        const categoryName = makeName('Practice Cat');
        const updateName = categoryName + ' Updated';

        // Create (POST)
        const resPost = await api.post(`${baseUrl}/categories`, { name: categoryName, type: 'debit', status: '' }, token);
        expect(resPost.ok()).toBeTruthy();
        const created = await resPost.json();
        expect(created.id).toBeTruthy();

        // Get list and verify created
        const resGet = await api.get(`${baseUrl}/categories`, token);
        expect(resGet.ok()).toBeTruthy();
        const categories = await resGet.json();
        expect(categories.some(c => c.id === created.id && c.name === categoryName)).toBeTruthy();

        // Update (PUT)
        const resPut = await api.put(`${baseUrl}/categories/${created.id}`, { newName: updateName }, token);
        expect(resPut.ok()).toBeTruthy();
        const updated = await resPut.json();
        expect(updated.name).toBe(updateName);

        // Re-check name updated in list
        const resGet2 = await api.get(`${baseUrl}/categories`, token);
        const categories2 = await resGet2.json();
        expect(categories2.some(c => c.id === created.id && c.name === updateName)).toBeTruthy();

        // Delete by id
        const resDelete = await api.delete(`${baseUrl}/categories/${created.id}`, token);
        expect(resDelete.ok() || resDelete.status() === 204).toBeTruthy();

        // Confirm delete
        const resGet3 = await api.get(`${baseUrl}/categories`, token);
        const categories3 = await resGet3.json();
        expect(categories3.some(c => c.id === created.id)).toBeFalsy();
    });

    test('Label flow: create, update, cleanup', async ({ request }) => {
        const api = new APIUtils(request);
        const token = await loginToken(request);

        const labelName = makeName('Practice Label');
        const labelUpdated = labelName + ' Updated';

        const resPost = await api.post(`${baseUrl}/labels`, { name: labelName, color: '#4CAF50' }, token);
        expect(resPost.ok()).toBeTruthy();
        const created = await resPost.json();
        expect(created.id).toBeTruthy();

        const resPut = await api.put(`${baseUrl}/labels/${created.id}`, { name: labelUpdated, color: '#FF9800' }, token);
        expect(resPut.ok()).toBeTruthy();
        const updated = await resPut.json();
        expect(updated.name).toBe(labelUpdated);

        const resDelete = await api.delete(`${baseUrl}/labels/${created.id}`, token);
        expect(resDelete.ok() || resDelete.status() === 204).toBeTruthy();
    });

    test('Contact flow: create, update, cleanup', async ({ request }) => {
        const api = new APIUtils(request);
        const token = await loginToken(request);

        const contactName = makeAlphaName('Practice Contact');
        const contactUpdated = contactName + ' Updated';

        const resPost = await api.post(`${baseUrl}/contacts`, { name: contactName, email: `x${Date.now()}@example.com`, mobNo: '9876543210' }, token);
        await assertOk(resPost, 'Contact create');
        const created = await resPost.json();
        expect(created.id).toBeTruthy();

        const resPut = await api.put(`${baseUrl}/contacts/${created.id}`, { name: contactUpdated, email: `x${Date.now()}@example.com`, mobNo: '9876543210' }, token);
        expect(resPut.ok()).toBeTruthy();
        const updated = await resPut.json();
        expect(updated.name).toBe(contactUpdated);

        const resDelete = await api.delete(`${baseUrl}/contacts/${created.id}`, token);
        expect(resDelete.ok() || resDelete.status() === 204).toBeTruthy();
    });

    test('Transaction flow: create, update, cleanup', async ({ request }) => {
        const api = new APIUtils(request);
        const token = await loginToken(request);

        // create supporting category/label/contact to attach
        const categoryRes = await api.post(`${baseUrl}/categories`, { name: makeName('Practice Txn Cat'), type: 'debit', status: '' }, token);
        expect(categoryRes.ok()).toBeTruthy();
        const category = await categoryRes.json();

        const labelRes = await api.post(`${baseUrl}/labels`, { name: makeName('Practice Txn Label'), color: '#0000FF' }, token);
        expect(labelRes.ok()).toBeTruthy();
        const label = await labelRes.json();

        const contactRes = await api.post(`${baseUrl}/contacts`, { name: makeAlphaName('Practice Txn Contact'), email: `x${Date.now()}@email.com`, mobNo: '9876543210' }, token);
        await assertOk(contactRes, 'Transaction contact create');
        const contact = await contactRes.json();

        const transactionPayload = {
            date: '2026-04-01',
            type: 'debit',
            category: category.name,
            amount: 20,
            reimbursable: 'N',
            comments: 'Practice transaction',
            labelIds: [label.id],
            contactId: contact.id
        };

        const txRes = await api.post(`${baseUrl}/transactions`, transactionPayload, token);
        expect(txRes.ok()).toBeTruthy();
        const transaction = await txRes.json();
        expect(transaction.id).toBeTruthy();

        const updateTxRes = await api.put(`${baseUrl}/transactions/${transaction.id}`, { ...transactionPayload, amount: 30 }, token);
        expect(updateTxRes.ok()).toBeTruthy();

        const delTxRes = await api.delete(`${baseUrl}/transactions/${transaction.id}`, token);
        expect(delTxRes.ok() || delTxRes.status() === 204).toBeTruthy();

        // cleanup support
        await api.delete(`${baseUrl}/contacts/${contact.id}`, token);
        await api.delete(`${baseUrl}/labels/${label.id}`, token);
        await api.delete(`${baseUrl}/categories/${category.id}`, token);
    });
});
