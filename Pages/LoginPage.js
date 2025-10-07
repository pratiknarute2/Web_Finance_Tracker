const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility');
const fs = require('fs/promises');



class LoginPage extends Utility {
    constructor(page) {
        super(page);  // Pass page to parent class
        this.page = page;

        this.emailInput = page.getByRole('textbox', { name: 'Email address' });
        this.passwordInput = page.getByRole('textbox', { name: 'Password' });
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.loginSuccessMessage = page.getByText('Login successful! Redirecting');

    }

    async login_through_post_API(request) {

        const loginResponse = await this.postRequest(request, 'https://expense-tracker-backend-y788.onrender.com/api/auth/login', 'Login', 'Post Login API')
        await this.expectToBe(loginResponse.message, 'Logged in successfully', 'Unexpected Post Login Message')

        const token = loginResponse.token;
        await this.page.goto('https://beutiful-expense-tracker-app.netlify.app/expense-tracker');
        await this.page.evaluate((authToken) => localStorage.setItem('token', authToken), token);
        await this.navigateOnURL(this.page, 'https://beutiful-expense-tracker-app.netlify.app/expense-tracker')

    }
    async login_with_valid_credentials(email = 'pratiknarute2@gmail.com', password = 'Pratik@1234') {
        // Navigate to login page
        await this.navigateOnURL(this.page, 'https://beutiful-expense-tracker-app.netlify.app/login');

        // Fill email & password using utility methods
        await this.fillInputField(this.emailInput, 'pratiknarute2@gmail.com', 'Email Input');
        await this.fillInputField(this.passwordInput, 'Pratik@1234', 'Password Input');

        // Click login button
        await this.clickElement(this.loginButton, 'Login Button');

        // Wait & verify success message
        const isVisible = await this.isDisplay(this.loginSuccessMessage, 5000, 'Login Success Message');
        await this.expectToBe(isVisible, true, 'Login Success Message');
    }


}

module.exports = LoginPage;
