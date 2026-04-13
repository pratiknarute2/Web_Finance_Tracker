# Web Finance Tracker - Playwright Automation

This repository contains Playwright automation for the Web Finance Tracker application. It covers both API and UI flows, uses JavaScript, and follows a Page Object Model style for UI interactions.

## Tech Stack

- JavaScript
- Node.js
- Playwright Test
- dotenv
- API and UI automation
- Page Object Model

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install
```

### 3. Configure environment variables

Create or update `.env` with the required URLs:

```bash
QA_UI_URL=https://expense-tracker-qa.netlify.app/login
QA_API_URL=https://expense-tracker-backend-qa.onrender.com
```

The framework defaults to `qa`. You can switch environments with:

```bash
ENV=qa
ENV=dev
ENV=prod
```

## Run Tests

### Run full suite

```bash
npm test
```

### Run only API tests

```bash
npx playwright test Tests/API
```

### Run only UI tests

```bash
npx playwright test Tests/UI
```

### Run a specific file

```bash
npx playwright test Tests/API/auth.test.js
npx playwright test Tests/API/dashboard.test.js
npx playwright test Tests/UI/Dashboard.test.js
```

### Run by grep

```bash
npx playwright test --grep "Dashboard"
npx playwright test --grep "Create"
```

### Open the HTML report

```bash
npx playwright show-report playwright-reports/html-report
```

## Current Test Organization

The suite is organized by test type and feature so files are easier to find and maintain.

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
│   ├── DashboardPage.js
│   ├── HomePage.js
│   ├── LoginPage.js
│   └── TransactionPage.js
├── TestData/
│   └── Excel/
│       └── TC.XLSX
├── Tests/
│   ├── API/
│   │   ├── auth.test.js
│   │   ├── category.test.js
│   │   ├── contact.test.js
│   │   ├── dashboard.test.js
│   │   ├── label.test.js
│   │   ├── openingBalance.test.js
│   │   └── transaction.test.js
│   └── UI/
│       ├── Dashboard.test.js
│       ├── homePage.test.js
│       └── login.test.js
├── playwright.config.js
├── package.json
└── README.md
```

## Feature Coverage

### API tests

- `auth.test.js`: login and token setup
- `label.test.js`: label CRUD
- `openingBalance.test.js`: opening balance validation
- `dashboard.test.js`: dashboard data and totals validation
- `category.test.js`: debit, credit, given, and received category flows
- `contact.test.js`: contact CRUD
- `transaction.test.js`: debit, credit, and ledger transaction flows

### UI tests

- `login.test.js`: login scenarios (currently skipped in the suite)
- `homePage.test.js`: home page calculations and transaction impact checks
- `Dashboard.test.js`: dashboard chart, tab, update, and responsive validations

## Framework Notes

- `playwright.config.js` runs tests only from the top-level `Tests/` folder.
- The `Practice/` folder is intentionally ignored by the main Playwright config.
- Shared API helpers live in `API/`.
- Shared utilities live in `Base/Utility.js`.
- UI page objects live in `Pages/`.
- Reports are generated in `playwright-reports/` and raw artifacts in `test-results/`.

## Naming and Maintenance Notes

- Keep one feature per test file where possible.
- Use descriptive names such as `auth.test.js` or `category.test.js`.
- Add new API tests under `Tests/API/`.
- Add new UI tests under `Tests/UI/`.
- Reuse page objects and API helpers instead of duplicating logic.

## Playwright Codegen

```bash
npx playwright codegen
```

Example:

```bash
npx playwright codegen https://expense-tracker-qa.netlify.app/login
```

## Author

Pratik Narute  
QA Automation Engineer | Playwright | JavaScript | Selenium | REST Assured
