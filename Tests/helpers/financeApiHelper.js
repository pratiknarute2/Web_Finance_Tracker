const Utility = require('../../Base/Utility');
const { API_URL } = require('../../playwright.config');

class FinanceApiHelper extends Utility {
    constructor(request) {
        super();
        this.request = request;
    }

    async ensureAuthenticated() {
        if (global.token) {
            return global.token;
        }

        const response = await this.request.post(`${API_URL}/api/auth/login`, {
            data: {
                email: 'testingnotes011@gmail.com',
                password: 'Testing@123'
            },
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 60000
        });

        if (!response.ok()) {
            const body = await response.text();
            throw new Error(`API login failed with ${response.status()}: ${body}`);
        }

        const payload = await response.json();
        global.token = payload.token;
        return global.token;
    }

    async sendWithAuth(executeRequest) {
        await this.ensureAuthenticated();

        let response = await executeRequest();
        if (response.status() === 401) {
            global.token = undefined;
            await this.ensureAuthenticated();
            response = await executeRequest();
        }

        return response;
    }

    async getJson(path, testName, options) {
        await this.ensureAuthenticated();
        return this.getRequest(this.request, `${API_URL}${path}`, testName, options);
    }

    async postJson(path, payload, testName, options = {}) {
        const response = await this.sendWithAuth(() => this.request.post(`${API_URL}${path}`, {
            data: payload,
            headers: this.getAuthHeaders(),
            timeout: options.timeout || 60000
        }));

        if (!response.ok()) {
            const body = await response.text();
            throw new Error(`${testName} failed with ${response.status()}: ${body}`);
        }

        const rawText = await response.text();
        return rawText ? JSON.parse(rawText) : {};
    }

    async tryPostJson(path, payload, testName, options = {}) {
        const response = await this.sendWithAuth(() => this.request.post(`${API_URL}${path}`, {
            data: payload,
            headers: this.getAuthHeaders(),
            timeout: options.timeout || 60000
        }));

        const rawText = await response.text();
        let body = rawText || {};

        if (rawText) {
            try {
                body = JSON.parse(rawText);
            } catch {
                body = rawText;
            }
        }

        return {
            ok: response.ok(),
            status: response.status(),
            body
        };
    }

    async deleteById(resource, id) {
        if (!id) {
            return;
        }

        const response = await this.sendWithAuth(() => this.request.delete(`${API_URL}/api/${resource}/${id}`, {
            headers: this.getAuthHeaders(),
            timeout: 60000
        }));

        if (!response.ok() && ![401, 404].includes(response.status())) {
            const body = await response.text();
            throw new Error(`Delete ${resource}/${id} failed with ${response.status()}: ${body}`);
        }
    }

    buildUniqueName(prefix) {
        const letters = Array.from({ length: 6 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
        return `${prefix} ${letters}`;
    }

    async createContact(overrides = {}) {
        const payload = {
            name: this.buildUniqueName('Auto Contact'),
            email: `auto.${Date.now()}@example.com`,
            mobNo: `9${Date.now().toString().slice(-9)}`,
            ...overrides
        };

        return this.postJson('/api/contacts', payload, 'Create Contact');
    }

    async createCategory(type, overrides = {}) {
        const payload = {
            name: this.buildUniqueName(`${type} Category`),
            type,
            status: '',
            ...overrides
        };

        return this.postJson('/api/categories', payload, `Create ${type} Category`);
    }

    async createLabel(overrides = {}) {
        const payload = {
            name: this.buildUniqueName('Auto Label'),
            color: '#4CAF50',
            ...overrides
        };

        return this.postJson('/api/labels', payload, 'Create Label');
    }

    async createTransaction(overrides = {}) {
        const payload = {
            date: '2026-04-14',
            type: 'debit',
            category: 'Food',
            amount: 10,
            reimbursable: 'N',
            comments: `Auto Txn ${Date.now()}`,
            labelIds: [],
            ...overrides
        };

        return this.postJson('/api/transactions', payload, 'Create Transaction');
    }
}

module.exports = FinanceApiHelper;
