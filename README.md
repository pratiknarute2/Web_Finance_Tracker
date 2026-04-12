# Web Finance Tracker - Playwright JavaScript Automation

This repository contains Playwright automation tests for the Web Finance Tracker application. The framework uses JavaScript, API testing, UI testing, and a Page Object Model structure to keep test logic readable and maintainable.

## Tech Stack

- JavaScript
- Playwright Test
- Node.js
- dotenv
- Page Object Model
- API and UI automation

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/pratiknarute2/Web_Finance_Tracker.git
cd Web_Finance_Tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

### 4. Configure Environment Variables

Create or update the `.env` file with the required URLs:

```bash
QA_UI_URL=https://expense-tracker-qa.netlify.app/login
QA_API_URL=https://expense-tracker-backend-qa.onrender.com
```

The test environment defaults to `qa` in `playwright.config.js`.

## Run Tests

### Run All Tests

```bash
npm test
```

### Run API Tests

```bash
npx playwright test Tests/API.test.js
```

### Run UI Tests

```bash
npx playwright test Tests/UI.test.js
```

### Open HTML Report

```bash
npx playwright show-report playwright-reports/html-report
```

## Playwright Codegen

Playwright Codegen can help record browser actions and generate locators.

```bash
npx playwright codegen
```

Open a specific site:

```bash
npx playwright codegen https://expense-tracker-qa.netlify.app/login
```

Save generated code to a file:

```bash
npx playwright codegen --output=login.spec.js
```

## Folder Structure

```text
Web_Finance_Tracker/
├── API/
│   ├── Delete.js
│   ├── Get.js
│   ├── Payloads.json
│   ├── Post.js
│   └── Put.js
├── Base/
│   └── Utility.js
├── Pages/
│   ├── HomePage.js
│   ├── LoginPage.js
│   └── TransactionPage.js
├── TestData/
│   └── Excel/
│       └── TC.XLSX
├── Tests/
│   ├── API.test.js
│   └── UI.test.js
├── package.json
├── playwright.config.js
└── README.md
```

## Framework Notes

- Locators and page actions are organized in page classes under `Pages/`.
- Shared helper methods are kept in `Base/Utility.js`.
- API endpoint helpers are organized under `API/`.
- Test data and request payloads are stored separately from test scripts.
- Reports are generated under `playwright-reports/`.

## Best Practices Followed

- Keep locators inside page objects.
- Use descriptive test and helper names.
- Reuse utility methods instead of repeating Playwright actions.
- Keep API helpers grouped by request type.
- Use environment variables for configurable URLs.

## Author

Pratik Narute  
QA Automation Engineer | Playwright | JavaScript | Selenium | REST Assured

Email: pratiknarute2@gmail.com
