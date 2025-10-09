# 🌐 Web Playwright JavaScript Automation Framework

This project demonstrates **Playwright automation using JavaScript**, designed with a clear separation between **Element Locators** and **UI Actions** for better code readability and maintainability.

---

## 🧩 Project Setup

Follow the steps below to set up and run the project.

### 🔹 1. Clone the Code
```bash
git clone <your-repo-url>

---

### 🔹 2. Project Initialization
```bash
# Create a new project folder
mkdir WEB_FINANCE_TRACKER
cd WEB_FINANCE_TRACKER

# Initialize npm
npm init -y
```

---

### 🔹 3. Install Playwright
```bash
# Install Playwright Test as a dev dependency
npm install -D @playwright/test

# Install supported browsers (Chromium, Firefox, WebKit)
npx playwright install
```

---

## 🚀 Execute Tests

▶️ Run All Test Cases
```bash
npx playwright test Tests/FinanceTracker.test.js && npx playwright show-report playwright-reports/html-report
```

After execution, an HTML report will open automatically showing the test results.

---

## 🧾 Folder Structure
```
WEB_FINANCE_TRACKER/
│
├── API/
│   ├── Delete.js
│   ├── Get.js
│   ├── Payloads.js
│   ├── Post.js
│   └── Put.js
│
├── Base/
│   └── Utility.js
│
├── Pages/
│   └── LoginPage.js
│
├── Tests/
│   ├── UpdateProfile.test.js
│   └── FinanceTracker.test.js
│
├── TestData/
│   └── testData.xlsx
│
├── playwright.config.js
└── package.json

---

## 📘 Project Overview

### 🎯 Objective
Automate web application scenarios using Playwright with a structured **Page Object Model (POM)** design and utility-based approach.

---

## ⚙️ Prompt for Element and UI Action

### ✅ 1. Declare Elements in Constructor, Perform Actions in Methods
This approach keeps all element locators inside the **constructor** and performs user interactions (clicks, typing, etc.) inside separate methods.

```js
// Example: LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailField = page.getByRole('textbox', { name: 'Enter Email' });
    this.passwordField = page.getByRole('textbox', { name: 'Enter Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async login(email, password) {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }
}

module.exports = LoginPage;
```

✅ **Advantages:**
- Easy to maintain — all locators in one place.
- Clear separation of UI and logic.
- Reduces redundancy.

---


## 🧠 Best Practices
- Keep locators inside constructors.
- Use descriptive method names for actions.
- Log all actions for easier debugging.
- Reuse utility methods instead of repeating Playwright commands.

---

## 👨‍💻 Author
**Pratik Narute**  
QA Automation Engineer | Playwright | JavaScript | Selenium | REST Assured  
📧 [pratiknarute2@gmail.com](mailto:pratiknarute2@gmail.com)
