const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility');
const { UI_URL, API_URL } = require('../playwright.config.js'); // Import dynamic URLs

class LoginPage extends Utility {
    constructor(page) {
        super(page);  // Pass page to parent class
        this.page = page;

        // Locators
        this.emailInput = page.getByRole('textbox', { name: 'Email address' });
        this.passwordInput = page.getByRole('textbox', { name: 'Password' });
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.loginSuccessMessage = page.getByText('Login successful! Redirecting');
        this.loginErrorMessageToaster = page.locator("//section//div[text()='Invalid email or password']");
        this.loginErrorMessageText = page.locator("//form//div[text()='Invalid email or password']");
    }

    // ✅ Login through POST API
    async login_through_post_API(request) {
        const loginResponse = await this.postRequest(
            request,
            `${API_URL}/api/auth/login`, // Dynamic API URL
            'Login',
            'Post Login API'
        );

        await this.expectToBe(loginResponse.message, 'Logged in successfully', 'Post Login Message');

        global.token = loginResponse.token;
        console.log('🔑 Global token set:', global.token);

        // Navigate to UI URL dynamically
        const appURL = UI_URL.replace('/login', '/expense-tracker');
        await this.page.goto(appURL);

        // Set token in localStorage
        await this.page.evaluate((authToken) => localStorage.setItem('token', authToken), token);

        // Optional: Navigate again to ensure token is loaded
        await this.navigateOnURL(this.page, appURL);

        await this.staticWait(3)
    }

    // ✅ Login via UI with valid credentials
    async login_with_valid_credentials(email = 'pratiknarute2@gmail.com', password = 'Pratik@1234') {
        // Navigate to login page dynamically
        await this.navigateOnURL(this.page, UI_URL);

        // Convert to string explicitly
        email = String(email);
        password = String(password);

        // Fill email & password using utility methods
        await this.fillInputField(this.emailInput, 'pratiknarute2@gmail.com', 'Email Input');
        await this.fillInputField(this.passwordInput, password, 'Password Input');

        // Click login button
        await this.clickElement(this.loginButton, 'Login Button');

        // Wait & verify success message
        const isVisible = await this.isDisplay(this.loginSuccessMessage, 5000, 'Login Success Message');
        await this.expectToBe(isVisible, true, 'Login Success Message');
    }
    async login_with_invalid_credentials() {
        // Navigate to login page dynamically
        await this.navigateOnURL(this.page, UI_URL);

        // Fill email & password using utility methods
        await this.fillInputField(this.emailInput, 'pratiknarute2@gmail.com', 'Email Input');
        await this.fillInputField(this.passwordInput, '123', 'Password Input');

        // Click login button
        await this.clickElement(this.loginButton, 'Login Button');

        const isVisible_loginErrorMessageText = await this.isDisplay(this.loginErrorMessageText, 5000, 'Text Error Message: Invalid email or password');
        const isVisible_loginErrorMessageToaster = await this.isDisplay(this.loginErrorMessageToaster, 5000, 'Toaster Error Message: Invalid email or password');

        await this.expectToBe(isVisible_loginErrorMessageText, true, 'Text Error Message: Invalid email or password');
        await this.expectToBe(isVisible_loginErrorMessageToaster, true, 'Toaster Error Message: Invalid email or password');

    }


}

module.exports = LoginPage;
