const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility');
const Get = require('../API/Get.js');
const { UI_URL, API_URL } = require('../playwright.config.js');
const TransactionPage = require('./TransactionPage.js');

class HomePage extends Utility {
    constructor(page) {
        super(page);
        this.page = page;
        this.initLocators();
    }

    // ============================
    // 🔹 Locator Initialization
    // ============================
    initLocators() {
        // Pagination buttons
        this.paginationNext = this.page.locator("//button[contains(text(),'Next')]");
        this.paginationPrevious = this.page.locator("//button[contains(text(),'Previous')]");

        // Table amounts
        this.debitAmountsElement = this.page.locator("//table//tbody//tr//td[@class='debit-amount']");
        this.allDebitAmountsElement = this.page.locator("//table//tbody//tr//td[5]");
        this.creditAmountsElement = this.page.locator("//table//tbody//tr//td[@class='credit-amount']");
        this.allCreditAmountsElement = this.page.locator("//table//tbody//tr//td[6]");
        this.currentBalancesElement = this.page.locator("//table//tbody//tr//td[7]");

        // Summary cards
        this.currentBalanceSummary = this.page.locator("//div[@class='summary-cards']//div[@class='summary-card balance']//p");
        this.totalIncome = this.page.locator("//div[@class='summary-cards']//div[@class='summary-card income']//p");
        this.totalExpense = this.page.locator("//div[@class='summary-cards']//div[@class='summary-card expense']//p");

        // Transaction messages & filters
        this.successfullMessageTransaction = this.page.locator("//div[text()='Transaction added successfully!']");
        this.showFilterButton = this.page.locator("//button[text()='Show Filters']");
        this.startDateFilter = this.page.locator("//label[text()='Start Date:']//input");
        this.endDateFilter = this.page.locator("//label[text()='End Date:']//input");

        // First row table locators
        this.date1Row_Table = this.page.locator("//table//tbody//tr[1]//td[1]");
        this.category1Row_Table = this.page.locator("//table//tbody//tr[1]//td[2]");
        this.comments1Row_Table = this.page.locator("//table//tbody//tr[1]//td[3]");
        this.label1Row_Table = this.page.locator("//table//tbody//tr[1]//td[4]");
        this.debitAmount1Row_Table = this.page.locator("//table//tbody//tr[1]//td[5]");
        this.creditAmount1Row_Table = this.page.locator("//table//tbody//tr[1]//td[6]");
        this.balance1Row_Table = this.page.locator("//table//tbody//tr[1]//td[7]");
        this.edit1Row_Table = this.page.locator("//table//tbody//tr[1]//td[8]//span[@title='Edit']]");
        this.delete1Row_Table = this.page.locator("//table//tbody//tr[1]//td[8]//span[@title='Delete']");
    }

    // ============================
    // 🔹 Main Table Calculation
    // ============================
    async arthmaticalTableCalculation(request) {
        let pageCount = 1;
        let debitAmount = 0;
        let creditAmount = 0;

        // Wait until Next button is initially enabled
        await this.waitForInitialNextButton();

        // Loop through all pages to sum debit and credit amounts
        while (true) {
            await this.waitForTableData();

            debitAmount = await this.calculateDebitAmountsSum(debitAmount); // Sum debit amounts
            creditAmount = await this.calculateCreditAmountsSum(creditAmount); // Sum credit amounts
            await this.waitForDataStabilization();

            pageCount++;
            if (!(await this.canProceedToNextPage())) break; // Exit if last page
            await this.navigateToNextPage(pageCount);
        }

        console.log(`✅ Processed ${(pageCount - 1)} pages successfully.`);
        console.log(`💰 Total Debit Amount: ${debitAmount.toFixed(2)} | Total Credit Amount: ${creditAmount.toFixed(2)} `);

        // Fetch summary cards and calculate current balance using API opening balance
        const summaryData = await this.getSummaryCardsData();
        const get = new Get(request);
        const openingBalance = await get.getOpeningBalanceAPI();
        const actualCurrentBalance = openingBalance + summaryData.TotalIncomeSummary - summaryData.TotalExpenseSummary;

        await this.validateSummaryCalculations(debitAmount, creditAmount, summaryData, actualCurrentBalance);

        // Validate each row backward for current balance correctness
        let lastPage = pageCount - 1;
        let expectedCurrentBalance;
        while (true) {
            expectedCurrentBalance = await this.validateTableCalcualtion(request, pageCount, lastPage, expectedCurrentBalance, openingBalance);
            pageCount--;
            if (!(await this.canProceedToPreviousPage())) break;
            await this.navigateToPreviousPage(pageCount - 1);
            lastPage = 0;
        }
    }

    // ============================
    // 🔹 Transaction Impact Methods
    // ============================
    async impactCalculationOfCreatedTransaction() {
        const transactionPage = new TransactionPage(this.page);
        await this.waitForTableData();

        // Capture summary before transaction
        const beforeSummary = await this.getSummaryCardsData();

        // Create transaction
        const createdTransaction = await transactionPage.createTransaction(
            '2025-10-09', 'debit', 'Food', '1000', 'Essentials', 'Automation Testing'
        );

        // Verify success message
        await this.verifyTransactionSuccessMessage();
        await this.waitForDataStabilization();

        // Capture summary after transaction
        const afterSummary = await this.getSummaryCardsData();

        // Validate impact on summary cards
        await this.validateImpactOfTransactionAddedOnSummary(beforeSummary, afterSummary, createdTransaction);

        // Apply filters and validate transaction appears in table
        await this.applyTransactionFilters(createdTransaction);
        await this.validateImpactOfTranctionAddedOnTable(createdTransaction);
    }

    // ============================
    // 🔹 Waits & Navigation Helpers
    // ============================
    async waitForInitialNextButton() {
        await this.page.waitForFunction(el => el && !el.disabled, await this.paginationNext.elementHandle(), { timeout: 15000 });
    }

    async waitForTableData() {
        await this.debitAmountsElement.first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async waitForDataStabilization() { await this.page.waitForTimeout(2000); }

    async canProceedToNextPage() {
        try {
            await this.page.waitForFunction(el => el && !el.disabled, await this.paginationNext.elementHandle(), { timeout: 10000 });
        } catch { return false; }
        return await this.paginationNext.isEnabled();
    }

    async canProceedToPreviousPage() {
        try {
            await this.page.waitForFunction(el => el && !el.disabled, await this.paginationPrevious.elementHandle(), { timeout: 10000 });
        } catch { return false; }
        return await this.paginationPrevious.isEnabled();
    }

    async navigateToNextPage(pageCount) {
        await Promise.all([
            this.clickElement(this.paginationNext, 'Pagination Next: ' + pageCount),
            this.page.waitForLoadState('networkidle', { timeout: 10000 })
        ]);
    }

    async navigateToPreviousPage(pageCount) {
        await Promise.all([
            this.clickElement(this.paginationPrevious, 'Pagination Previous: ' + pageCount),
            this.page.waitForLoadState('networkidle', { timeout: 10000 })
        ]);
    }

    // ============================
    // 🔹 Calculation Helpers
    // ============================
    async calculateDebitAmountsSum(currentDebit) {
        let total = currentDebit;
        const count = await this.debitAmountsElement.count();
        for (let i = 0; i < count; i++) {
            const text = (await this.debitAmountsElement.nth(i).textContent() || "").replace(/[^\d.-]/g, '').trim();
            const amount = parseFloat(text) || 0;
            console.log(`Debit: ${total + amount} = (${total} + ${amount})`); // preserved log
            total += amount;
        }
        return total;
    }

    async calculateCreditAmountsSum(currentCredit) {
        let total = currentCredit;
        const count = await this.creditAmountsElement.count();
        for (let i = 0; i < count; i++) {
            const text = (await this.creditAmountsElement.nth(i).textContent() || "").replace(/[^\d.-]/g, '').trim();
            const amount = parseFloat(text) || 0;
            console.log(`Credit: ${total + amount} = (${total} + ${amount})`); // preserved log
            total += amount;
        }
        return total;
    }

    async getSummaryCardsData() {
        const parse = async (locator) => parseFloat(((await locator.first().textContent()) || '').replace(/[^\d.-]/g, '').trim()) || 0;
        return {
            currentBalanceSummary: await parse(this.currentBalanceSummary),
            TotalIncomeSummary: await parse(this.totalIncome),
            TotalExpenseSummary: await parse(this.totalExpense)
        };
    }

    async validateSummaryCalculations(debitAmount, creditAmount, summaryData, actualCurrentBalance) {
        await this.expectToBe(debitAmount.toFixed(2), summaryData.TotalExpenseSummary.toFixed(2), 'Summary Total expense balance matching');
        await this.expectToBe(creditAmount.toFixed(2), summaryData.TotalIncomeSummary.toFixed(2), 'Summary Total income balance matching');
        await this.expectToBe(actualCurrentBalance.toFixed(2), summaryData.currentBalanceSummary.toFixed(2), 'Summary Current balance matching');
    }

    // ============================
    // 🔹 Transaction Helpers
    // ============================
    async validateImpactOfTransactionAddedOnSummary(before, after, transaction) {
        const amount = parseFloat(transaction.amount);
        let expectedExpense = before.TotalExpenseSummary;
        let expectedIncome = before.TotalIncomeSummary;
        let expectedBalance = before.currentBalanceSummary;

        if (transaction.transactionType.toLowerCase() === 'debit') {
            expectedExpense += amount;
            expectedBalance -= amount;
        } else {
            expectedIncome += amount;
            expectedBalance += amount;
        }

        await this.expectToBe(after.currentBalanceSummary, expectedBalance, 'Current Balance summary impacted');
        await this.expectToBe(after.TotalExpenseSummary, expectedExpense, 'Total Expenses summary impacted');
        await this.expectToBe(after.TotalIncomeSummary, expectedIncome, 'Total Income summary impacted');
    }

    async verifyTransactionSuccessMessage() {
        const displayed = await this.isDisplay(this.successfullMessageTransaction, 5000, 'Transaction Added Message');
        await this.expectToBe(displayed, true, 'Transaction Added Message validation');
    }

    async applyTransactionFilters(transaction) {
        await this.clickElement(this.showFilterButton, 'Show Filter');
        await this.fillInputField(this.startDateFilter, transaction.date_yyyy_mm_dd, 'Start Date');
        await this.fillInputField(this.endDateFilter, transaction.date_yyyy_mm_dd, 'End Date');
        await this.page.waitForTimeout(3000);
    }

    async validateImpactOfTranctionAddedOnTable(transaction) {
        await this.expectToBe(this.formatDateToYYYYMMDD((await this.date1Row_Table.textContent())?.trim()), transaction.date_yyyy_mm_dd, 'Date validation');
        await this.expectToBe((await this.category1Row_Table.textContent())?.trim(), transaction.category, 'Category validation');
        await this.expectToBe((await this.label1Row_Table.textContent())?.trim(), transaction.label, 'Label validation');

        if (transaction.transactionType.toLowerCase() === 'debit') {
            const actual = parseFloat((await this.debitAmount1Row_Table.textContent())?.trim().replace(/,/g, '')).toFixed(2);
            await this.expectToBe(actual, parseFloat(transaction.amount).toFixed(2), 'Debit Amount validation');
        } else {
            const actual = parseFloat((await this.creditAmount1Row_Table.textContent())?.trim().replace(/,/g, '')).toFixed(2);
            await this.expectToBe(actual, parseFloat(transaction.amount).toFixed(2), 'Credit Amount validation');
        }
    }

    // ============================
    // 🔹 Row-wise Table Validation with Logs
    // ============================
    async validateTableCalcualtion(request, pageNo, lastPageNo, expectedBalance, openingBalance) {
        const rowCount = await this.currentBalancesElement.count();

        for (let row = rowCount - 1; row >= 0; row--) {
            let debit, credit;

            let actualBalance = await this.removeSpecialCharFromNumber(this.currentBalancesElement.nth(row));

            if (!expectedBalance && lastPageNo === (pageNo - 1) && row === (rowCount - 1)) {
                const debitText = (await this.allDebitAmountsElement.nth(row).textContent()).trim();
                if (debitText !== "-") {
                    debit = await this.removeSpecialCharFromNumber(this.allDebitAmountsElement.nth(row));
                    expectedBalance = openingBalance - debit;
                } else {
                    credit = await this.removeSpecialCharFromNumber(this.allCreditAmountsElement.nth(row));
                    expectedBalance = openingBalance + credit;
                }
            } else {
                const debitText = (await this.allDebitAmountsElement.nth(row).textContent()).trim();
                if (debitText !== "-") {
                    debit = await this.removeSpecialCharFromNumber(this.allDebitAmountsElement.nth(row));
                    expectedBalance -= debit;
                } else {
                    credit = await this.removeSpecialCharFromNumber(this.allCreditAmountsElement.nth(row));
                    expectedBalance += credit;
                }
            }

            actualBalance = Number(actualBalance.toFixed(2));
            expectedBalance = Number(expectedBalance.toFixed(2));

            await this.expectToBe(actualBalance, expectedBalance, `Current Balance of row: ${row + 1} for Page No: ${(pageNo - 1)}`);

            // ==== PRESERVED CONSOLE LOGS ====
            const logParts = [`Page No: ${pageNo - 1} | Row No: ${row + 1}`];
            if (debit !== undefined) logParts.push(`Debit: ${debit}`);
            if (credit !== undefined) logParts.push(`Credit: ${credit}`);
            logParts.push(`Current Balance: ${actualBalance}`);
            console.log(logParts.join(' | '));
            console.log('-'.repeat(100));
        }

        return expectedBalance;
    }
}

module.exports = HomePage;
