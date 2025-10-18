const { defineConfig } = require('@playwright/test');
require('dotenv').config();


// 🧠 Choose environment
const ENV = process.env.ENV || 'qa'

// 🌍 Environment URLs
const ENV_CONFIG = {
  qa: { UI_URL: process.env.QA_UI_URL, API_URL: process.env.QA_API_URL },
  prod: { UI_URL: process.env.PROD_UI_URL, API_URL: process.env.PROD_API_URL },
};

const configEnv = ENV_CONFIG[ENV];

if (!configEnv || !configEnv.UI_URL || !configEnv.API_URL) {
  throw new Error(`❌ Invalid or missing URLs for environment: ${ENV}`);
}

const { UI_URL, API_URL } = configEnv;

console.log(`✅ Running on ${ENV}`);
console.log(`🌐 UI URL: ${UI_URL}`);
console.log(`🧩 API URL: ${API_URL}`);

module.exports = defineConfig({
  globalTeardown: require.resolve('./global-teardown.js'),
  retries: 0,
  timeout: 200_000,  // Global test timeout: 200 sec
  expect: {
    timeout: 30_000,  // Default assertion timeout: 30 seconds
  },

  use: {
    loginURL: UI_URL,
    actionTimeout: 20_000, // Timeout for each action: 120 seconds
    navigationTimeout: 20_000, // Timeout for navigation: 20 seconds
    headless: true, // Run in headed mode for debugging
    launchOptions: {
      args: ['--start-maximized'],
    },
    video: 'on-first-retry', // Capture video only on first retry
    screenshot: 'only-on-failure', // Capture screenshot only if the test fails
    trace: 'on', // ✅ Always collect trace for every test
    outputDir: 'test-results/artifacts', // Store raw artifacts
  },

  // projects: [
  //   { name: 'chromium', use: { browserName: 'chromium' }, testMatch: ['Tests/Kolonizer.test.js'] },
  //   { name: 'firefox', use: { browserName: 'firefox' }, testMatch: ['Tests/Lyca.test.js'] },
  // ],

  fullyParallel: true,
  workers: 2, // Increase for parallel execution; set to 1 for debugging

  reporter: [
    ['list'], // Console output
    ['html', { outputFolder: 'playwright-reports/html-report', open: 'on-failure' }],
    ['json', { outputFile: 'playwright-reports/report.json' }],
    ['junit', { outputFile: 'playwright-reports/report.xml' }],
  ],
});

module.exports.UI_URL = UI_URL;
module.exports.API_URL = API_URL;
