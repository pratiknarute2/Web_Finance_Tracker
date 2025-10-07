const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  retries: 1,
  timeout: 60_000,  // Global test timeout (60 seconds)
  expect: {
    timeout: 10_000,  // Default assertion timeout (10 seconds)
  },

  use: {
    actionTimeout: 10_000, // Timeout for each action (10 seconds)
    navigationTimeout: 20_000, // Timeout for navigation (20 seconds)
    headless: false, // Better for bypassing detection
    launchOptions: {
      args: ['--start-maximized'],
    },
    video: 'on', // Capture video only on first retry
    screenshot: 'only-on-failure', // Capture screenshot only if the test fails
    trace: 'on-first-retry', // Collect trace only on the first retry
    outputDir: 'test-results/artifacts', // Store raw artifacts
  },

  // projects: [
  //   { name: 'chromium', use: { browserName: 'chromium' }, testMatch: ['Tests/Kolonizer.test.js'] },
  //   { name: 'firefox', use: { browserName: 'firefox' }, testMatch: ['Tests/Lyca.test.js'] }, // Runs test2 only on Firefox
  // ],

  fullyParallel: true,
  workers: 2, // Set to 1 for debugging; increase for parallel execution

  reporter: [
    ['list'], // Console output
    ['html', { outputFolder: 'playwright-reports/html-report', open: 'on-failure' }], // HTML report
    ['json', { outputFile: 'playwright-reports/report.json' }], // JSON report
    ['junit', { outputFile: 'playwright-reports/report.xml' }], // JUnit report
  ],
});
