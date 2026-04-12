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
        this.allDateElements = this.page.locator("//table//tbody//tr//td[1]")
        this.pageIndicator = this.page.locator("//div[@class='pagination']//span");

        // Summary cards
        this.currentBalanceSummary = this.page.locator("//div[@class='summary-cards']//div[@class='summary-card balance']//p");
        this.totalIncome = this.page.locator("//div[@class='summary-cards']//div[@class='summary-card income']//p");
        this.totalExpense = this.page.locator("//div[@class='summary-cards']//div[@class='summary-card expense']//p");

        // Transaction messages & filters
        this.successfullMessageTransaction = this.page.locator("//div[text()='Transaction added successfully!']");
        this.deleteMessageTransaction = this.page.locator("//div[text()='Transaction deleted successfully']");
        this.showFilterButton = this.page.locator("//button[text()='Show Filters']");
        this.hideFilterButton = this.page.locator("//button[text()='Hide Filters']");
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
        this.deleteConfirmationYes = this.page.locator("//button[text()='Yes'] | //button[text()='Delete']");
    }

    // ============================
    // 🔹 Main Table Calculation
    // ============================
    async arthmaticalTableCalculation(request) {
        let pageCount = 1;
        let debitAmount = 0;
        let creditAmount = 0;

        await this.staticWait(1)

        // Loop through all pages to sum debit and credit amounts
        while (true) {
            await this.waitForTableData(); // safe wait

            debitAmount = await this.calculateDebitAmountsSum(debitAmount);
            creditAmount = await this.calculateCreditAmountsSum(creditAmount);
            await this.staticWait(1);

            // ✅ ADD DEBUG LOGS HERE
            console.log("➡️ Checking Next button...");
            console.log("Enabled:", await this.paginationNext.isEnabled());
            console.log("Disabled:", await this.paginationNext.isDisabled());

            pageCount++;
            if (!(await this.canProceedToNextPage())) break;
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
        let storedDates = [];

        while (true) {
            expectedCurrentBalance = await this.validateTableCalcualtion(
                request, pageCount, lastPage, expectedCurrentBalance, openingBalance
            );

            storedDates = await this.fetchDates(storedDates);

            pageCount--;
            if (!(await this.canProceedToPreviousPage())) break;
            await this.navigateToPreviousPage(pageCount - 1);
            lastPage = 0;
        }

        // ✅ Validate after fetching all pages
        await this.validateOrderOfDateAsOldToLatestWise(storedDates);

    }


    async deleteTransaction(createdTransaction) {
        // Apply filters and validate transaction appears in table
        await this.applyTransactionFilters(createdTransaction);
        await this.clickElement(this.delete1Row_Table, 'Delete Transaction')
        await this.clickElement(this.deleteConfirmationYes, 'Delete Confirmation Yes')
        let deleteTransaction = await this.isDisplay(this.deleteMessageTransaction, 5000, 'Delete Transaction Toaster Message')
        await this.expectToBe(deleteTransaction, true, 'Delete Transaction Toaster Message')
    }

    // ============================
    // 🔹 Transaction Impact Methods
    // ============================
    async impactCalculationOfCreatedTransaction(createdTransaction, beforeSummary) {
        await this.staticWait(5)

        // Capture summary after transaction
        await this.currentBalancesElement.first().waitFor({
            state: 'visible',
            timeout: 10000
        });
        const afterSummary = await this.getSummaryCardsData();

        // Validate impact on summary cards
        await this.validateImpactOfTransactionAddedOnSummary(beforeSummary, afterSummary, createdTransaction);

        // Apply filters and validate transaction appears in table
        await this.applyTransactionFilters(createdTransaction);
        await this.validateImpactOfTranctionAddedOnTable(createdTransaction);
        await this.clickElement(this.hideFilterButton, 'Hide Filter Button')
    }


    async waitForTableData() {
        // Wait for network requests to finish
        await this.page.waitForLoadState('networkidle');

        const rows = this.page.locator("//table//tbody//tr");
        const rowCount = await rows.count();

        if (rowCount === 0) {
            console.warn("⚠️ No rows found on this page.");
            return; // Return safely if table is empty
        }

        // Wait for first row to be visible
        await rows.first().waitFor({ state: 'visible', timeout: 40000 });
    }


    async canProceedToNextPage() {
        try {
            const text = await this.pageIndicator.textContent(); // "Page 2 of 8"

            console.log("📄 Pagination text:", text);

            const match = text.match(/Page (\d+) of (\d+)/);
            if (!match) return false;

            const current = parseInt(match[1]);
            const total = parseInt(match[2]);

            console.log(`➡️ Current Page: ${current} | Total Pages: ${total}`);

            return current < total;

        } catch (e) {
            return false;
        }
    }

    async canProceedToPreviousPage() {
        try {
            await this.paginationPrevious.waitFor({ state: 'visible', timeout: 5000 });

            const isDisabled = await this.paginationPrevious.isDisabled();
            return !isDisabled;

        } catch (e) {
            return false;
        }
    }

    async navigateToNextPage(pageCount) {
        const previousFirstRowText = await this.getFirstTableRowText();
        await this.paginationNext.click();
        await this.waitForPaginatedTableUpdate(pageCount, previousFirstRowText);
    }

    async navigateToPreviousPage(pageCount) {
        const previousFirstRowText = await this.getFirstTableRowText();
        await this.paginationPrevious.click();
        await this.waitForPaginatedTableUpdate(pageCount, previousFirstRowText);
    }

    async getFirstTableRowText() {
        const firstRow = this.page.locator("//table//tbody//tr").first();
        return ((await firstRow.textContent()) || "").trim();
    }

    async waitForPaginatedTableUpdate(expectedPage, previousFirstRowText) {
        await expect(this.pageIndicator).toContainText(`Page ${expectedPage} of`, { timeout: 10000 });

        await this.page.waitForFunction((previousText) => {
            const rows = [...document.querySelectorAll('table tbody tr')];
            if (rows.length === 0) return false;

            const firstRowText = rows[0].textContent.trim();
            const hasAmount = rows.some((row) => {
                const debitText = row.querySelector('td:nth-child(5)')?.textContent.trim() || '';
                const creditText = row.querySelector('td:nth-child(6)')?.textContent.trim() || '';
                return /\d/.test(debitText) || /\d/.test(creditText);
            });

            return firstRowText !== previousText && hasAmount;
        }, previousFirstRowText, { timeout: 10000 });
    }

    // ============================
    // 🔹 Calculation Helpers
    // ============================
    async calculateDebitAmountsSum(currentDebit) {
        let total = currentDebit;
        const count = await this.allDebitAmountsElement.count();
        for (let i = 0; i < count; i++) {
            const text = (await this.allDebitAmountsElement.nth(i).textContent() || "").replace(/[^\d.-]/g, '').trim();
            const amount = parseFloat(text) || 0;
            console.log(`Debit: ${total + amount} = (${total} + ${amount})`); // preserved log
            total += amount;
        }
        return total;
    }

    async calculateCreditAmountsSum(currentCredit) {
        let total = currentCredit;
        const count = await this.allCreditAmountsElement.count();
        for (let i = 0; i < count; i++) {
            const text = (await this.allCreditAmountsElement.nth(i).textContent() || "").replace(/[^\d.-]/g, '').trim();
            const amount = parseFloat(text) || 0;
            console.log(`Credit: ${total + amount} = (${total} + ${amount})`); // preserved log
            total += amount;
        }
        return total;
    }

    async getSummaryCardsData() {
        await this.staticWait(3)
        await this.currentBalancesElement.first().waitFor({
            state: 'visible',
            timeout: 10000
        });
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
    async validateImpactOfTransactionAddedOnSummary(before, after, createdTransactionDetails) {
        try {
            const round = (num) => parseFloat(parseFloat(num).toFixed(2));

            const type = createdTransactionDetails.transactionType.toLowerCase();
            const amount = parseFloat(createdTransactionDetails.amount);

            console.log("\n🧩 Validating Summary Impact of Transaction...");
            await this.currentBalancesElement.first().waitFor({
                state: 'visible',
                timeout: 10000
            });


            console.log(`Transaction Type       : ${type}`);
            console.log(`Transaction Amount      : ${amount}`);
            console.log(`Before → Total Expense  : ${before.TotalExpenseSummary}`);
            console.log(`Before → Total Income   : ${before.TotalIncomeSummary}`);
            console.log(`Before → Current Balance: ${before.currentBalanceSummary}`);
            console.log("------------------------------------------------------------");

            let expectedTotalExpense = before.TotalExpenseSummary;
            let expectedTotalIncome = before.TotalIncomeSummary;
            let expectedCurrentBalance = before.currentBalanceSummary;

            if (type === 'debit') {
                expectedTotalExpense += amount;
                expectedCurrentBalance -= amount;
            } else if (type === 'credit') {
                expectedTotalIncome += amount;
                expectedCurrentBalance += amount;
            }

            console.log(`Expected → Total Expense  : ${round(expectedTotalExpense)}`);
            console.log(`Expected → Total Income   : ${round(expectedTotalIncome)}`);
            console.log(`Expected → Current Balance: ${round(expectedCurrentBalance)}`);
            console.log("------------------------------------------------------------");
            console.log(`After → Total Expense  : ${after.TotalExpenseSummary}`);
            console.log(`After → Total Income   : ${after.TotalIncomeSummary}`);
            console.log(`After → Current Balance: ${after.currentBalanceSummary}`);
            console.log("------------------------------------------------------------");

            // 🧪 Assertions

            await this.expectToBe(round(after.TotalExpenseSummary), round(expectedTotalExpense), "Total Expense summary impacted");
            await this.expectToBe(round(after.TotalIncomeSummary), round(expectedTotalIncome), "Total Income summary impacted");
            await this.expectToBe(round(after.currentBalanceSummary), round(expectedCurrentBalance), "Current Balance summary impacted");

            console.log("✅ Summary impact validated successfully.\n");

        } catch (error) {
            console.error(`❌ Error in validating impact of transaction: ${error.message}`);
            throw error;
        } finally {
            console.log('-'.repeat(100));
        }
    }


    async verifyTransactionSuccessMessage() {
        const displayed = await this.isDisplay(this.successfullMessageTransaction, 5000, 'Transaction Added Message');
        await this.expectToBe(displayed, true, 'Transaction Added Message validation');
        console.log(`✅ Transaction added successfully`);
    }

    async applyTransactionFilters(transaction) {
        await this.clickElement(this.showFilterButton, 'Show Filter');
        await this.fillInputField(this.startDateFilter, this.formatDate_FromDDMMYYYY_To_YYYYMMDD(transaction.date_dd_mm_yyyy), 'Start Date');
        await this.fillInputField(this.endDateFilter, this.formatDate_FromDDMMYYYY_To_YYYYMMDD(transaction.date_dd_mm_yyyy), 'End Date');
        await this.staticWait(2)
    }

    async validateImpactOfTranctionAddedOnTable(transaction) {
        let actualDate = (await this.date1Row_Table.textContent())?.trim()
        await this.expectToBe(this.formatDateReplace_To_Hyphen(actualDate), transaction.date_dd_mm_yyyy, 'Date validation');
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

    // ============================
    // 🔹 Fetch All Dates
    // ============================
    async fetchDates(storedDates = []) {
        const countOfDateElements = await this.allDateElements.count();

        for (let i = countOfDateElements - 1; i >= 0; i--) {
            const dateText = (await this.allDateElements.nth(i).textContent()).trim();
            storedDates.push(dateText);
        }
        return storedDates;
    }

    // ============================
    // 🔹 Validate Dates Order (Old → Latest)
    // ============================
    async validateOrderOfDateAsOldToLatestWise(storedDates) {
        const parseDate = (dateStr) => {
            const [day, month, year] = dateStr.split(/[\/\-]/).map(Number);
            return new Date(year, month - 1, day);
        };

        const dateObjects = storedDates.map(parseDate);
        const isSorted = dateObjects.every((d, i, arr) => i === 0 || arr[i - 1] <= d);

        console.log(`🗓️ Total Dates Found: ${storedDates.length}`);
        console.log("🗓️ All table dates (full):", JSON.stringify(storedDates, null, 2));
        console.log(`✅ Dates are in order (old → latest): ${isSorted}`);

        await this.expectToBe(isSorted, true, 'Dates are sorted from old → latest');
    }


}

module.exports = HomePage;
