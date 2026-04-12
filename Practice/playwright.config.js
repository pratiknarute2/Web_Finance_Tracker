const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './Tests',
    timeout: 60 * 1000,
    expect: {
        timeout: 5000
    },
    retries: 1,
    use: {
        baseURL: 'https://beutiful-expense-tracker-app.netlify.app',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ]
});
