# 🌐 Web Playwright JavaScript Automation Framework

This project demonstrates Playwright automation using JavaScript, designed with a clear separation between Element Locators and UI Actions for better code readability and maintainability.

---

## 🧩 Project Setup

Follow the steps below to set up and run the project.

### 🔹 1. Clone the Code

```bash
git clone <your-repo-url>
cd WEB_FINANCE_TRACKER
```

### 🔹 2. Project Initialization

```bash
# Create a new project folder
mkdir WEB_FINANCE_TRACKER
cd WEB_FINANCE_TRACKER

# Initialize npm
npm init -y
```

### 🔹 3. Install Dependencies

```bash
# Install Playwright Test as a dev dependency
npm install -D @playwright/test

# Install supported browsers (Chromium, Firefox, WebKit)
npx playwright install

# Environment variables
npm install dotenv

# Zip library
npm install archiver --save-dev
```

---

## 🎥 Playwright Codegen (Record Feature)

Playwright provides a built-in recording tool that captures your browser actions and converts them into executable code.

**This is very useful for:**
- Finding correct locators
- Quickly generating test steps
- Speeding up POM method creation

### ▶️ How to Use Codegen in WebStorm

**1️⃣ Open Terminal in WebStorm**

```
View → Tool Windows → Terminal
```

(or press `Alt + F12`)

**2️⃣ Start Recording**

```bash
npx playwright codegen
```

To open a specific website while recording:

```bash
npx playwright codegen https://flipkart.com
```

**3️⃣ Browser + Code Window Opens Automatically**
- Perform actions → Playwright generates code live
- Copy that code and paste inside:
  - Test file
  - Page Object methods
  - Utility functions

**4️⃣ Saving Recorded Script Directly**

```bash
npx playwright codegen --output=login.spec.js
```

**⭐ Supported Targets**

```bash
npx playwright codegen --target=javascript
npx playwright codegen --target=python
npx playwright codegen --target=java
```

---

## 🚀 Execute Tests

### ▶️ Run All Test Cases

After execution, an HTML report will open automatically.

```bash
npx playwright test Tests/API.test.js && npx playwright show-report playwright-reports/html-report
```

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
│   └── API.test.js
│
├── TestData/
│   └── testData.xlsx
│
├── playwright.config.js
└── package.json
```

---

## 📘 Project Overview

### 🎯 Objective

Automate web application scenarios using Playwright with a structured **Page Object Model (POM)** design and utility-based approach.

### ⚙️ Design Pattern: Element and UI Action Separation

#### ✅ 1. Declare Elements in Constructor, Perform Actions in Methods

**Example:**

```javascript
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

#### ✅ Advantages

- **Easy to maintain** — all locators in one place
- **Clear separation of UI and logic**
- **Reduces redundancy**

---

## 🧠 Best Practices

- Keep locators inside constructors
- Use descriptive method names
- Log all actions
- Reuse utilities instead of repeating Playwright commands

---

## 👨‍💻 Author

**Pratik Narute**  
QA Automation Engineer | Playwright | JavaScript | Selenium | REST Assured  

📧 pratiknarute2@gmail.com

---
