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
        console.log("Token:", loginResponse.token);
        return loginResponse;
    }
}

module.exports = Post;