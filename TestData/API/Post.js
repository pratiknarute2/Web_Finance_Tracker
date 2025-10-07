const { expect } = require('@playwright/test');
const Utility = require('../../Base/Utility.js');


class Post extends Utility {
    constructor(request) {
        super(request);
        this.request = request;
    }

    async postLoginAPI() {
        const loginResponse = await this.postRequest(
            this.request,
            'https://expense-tracker-backend-y788.onrender.com/api/auth/login',
            'Login',
            'Post Login API'
        );
        expect(loginResponse.message).toBe('Logged in successfully');
        // ✅ Set token globally
        global.token = loginResponse.token;
        console.log('🔑 Global token set:', global.token);
        return loginResponse;
    }
    async postCategoriesAPI(transactionType) {
        const categoryResponse = await this.postRequest(
            this.request,
            'https://expense-tracker-backend-y788.onrender.com/api/categories',
            `Categories_${transactionType}`,
            `Post Categories API for ${transactionType}`
        );

        expect(categoryResponse.type).toBe(transactionType);

        // ✅ Set category ID globally for later use (delete/update)
        global.categoryId = categoryResponse.id;
        console.log('🔑 Global category ID set:', global.categoryId);

        return categoryResponse;
    }

}

module.exports = Post;