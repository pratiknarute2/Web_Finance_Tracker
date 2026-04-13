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
        this.paginationNext = this.page.locator("//button[normalize-space()='Next' or normalize-space()='›']").last();
        this.paginationPrevious = this.page.locator("//button[normalize-space()='Previous' or normalize-space()='‹']").last();
        this.pageIndicator = this.page.locator("//button[normalize-space()='›' or normalize-space()='Next']/following-sibling::*[contains(normalize-space(),'/')][1] | //div[contains(@class,'pagination')]//span").last();

        this.transactionsTable = this.page.locator("//h2[normalize-space()='Transactions']/following::table[1]");
        this.transactionRows = this.transactionsTable.locator("tbody tr");

        // Table amounts
        this.debitAmountsElement = this.transactionsTable.locator("tbody tr td.debit-amount");
        this.allDebitAmountsElement = this.transactionsTable.locator("tbody tr td:nth-child(5)");
        this.creditAmountsElement = this.transactionsTable.locator("tbody tr td.credit-amount");
        this.allCreditAmountsElement = this.transactionsTable.locator("tbody tr td:nth-child(6)");
        this.currentBalancesElement = this.transactionsTable.locator("tbody tr td:nth-child(7)");
        this.allDateElements = this.transactionsTable.locator("tbody tr td:nth-child(1)")

        // Summary cards
        this.currentBalanceSummary = this.page.locator("//h3[normalize-space()='Current Balance']/following-sibling::p[1]");
        this.totalIncome = this.page.locator("//h3[normalize-space()='Total Income']/following-sibling::p[1]");
        this.totalExpense = this.page.locator("//h3[normalize-space()='Total Expense']/following-sibling::p[1]");

        // Transaction messages & filters
        this.successfullMessageTransaction = this.page.locator("//div[text()='Transaction added successfully!']");
        this.deleteMessageTransaction = this.page.locator("//div[text()='Transaction deleted successfully']");
        this.showFilterButton = this.page.locator("//button[text()='Show Filters']");
        this.hideFilterButton = this.page.locator("//button[text()='Hide Filters']");
        this.categoryFilter = this.page.getByLabel('Category:');
        this.startDateFilter = this.page.getByLabel('Start Date:');
        this.endDateFilter = this.page.getByLabel('End Date:');
        this.labelFilter = this.page.getByLabel('Label:');

        // First row table locators
        const firstTransactionRow = this.transactionRows.first();
        this.date1Row_Table = firstTransactionRow.locator("td").nth(0);
        this.category1Row_Table = firstTransactionRow.locator("td").nth(1);
        this.comments1Row_Table = firstTransactionRow.locator("td").nth(2);
        this.label1Row_Table = firstTransactionRow.locator("td").nth(3);
        this.debitAmount1Row_Table = firstTransactionRow.locator("td").nth(4);
        this.creditAmount1Row_Table = firstTransactionRow.locator("td").nth(5);
        this.balance1Row_Table = firstTransactionRow.locator("td").nth(6);
        this.edit1Row_Table = this.getRowAction(firstTransactionRow, 'Edit');
        this.delete1Row_Table = this.getRowAction(firstTransactionRow, 'Delete');
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
            const canGoNext = await this.canProceedToNextPage();
            console.log("Enabled:", canGoNext);
            console.log("Disabled:", !canGoNext);

            pageCount++;
            if (!canGoNext) break;
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
        const transactionRow = await this.getTransactionRow(createdTransaction);
        await this.clickElement(this.getRowAction(transactionRow, 'Delete'), 'Delete Transaction')
        await this.clickElement(this.deleteConfirmationYes, 'Delete Confirmation Yes')
        let deleteTransaction = await this.isDisplay(this.deleteMessageTransaction, 5000, 'Delete Transaction Toaster Message')
        await this.expectToBe(deleteTransaction, true, 'Delete Transaction Toaster Message')
    }

    // ============================
    // 🔹 Transaction Impact Methods
    // ============================
    async impactCalculationOfCreatedTransaction(createdTransaction, beforeSummary) {
        const afterSummary = await this.waitForSummaryImpact(beforeSummary, createdTransaction);

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

        const rows = this.transactionRows;
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
            await this.paginationNext.waitFor({ state: 'visible', timeout: 10000 });
            const paginationText = await this.getPaginationText();

            if (paginationText) {
                console.log("📄 Pagination text:", paginationText);
            }

            return !(await this.paginationNext.isDisabled());

        } catch (e) {
            console.warn(`⚠️ Next pagination check failed: ${e.message}`);
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
        const firstRow = this.transactionRows.first();
        return ((await firstRow.textContent()) || "").trim();
    }

    async waitForPaginatedTableUpdate(expectedPage, previousFirstRowText) {
        const expectedPageText = new RegExp(`(?:Page\\s+)?${expectedPage}\\s*(?:/|of)\\s*\\d+`, 'i');
        try {
            await expect(this.pageIndicator).toContainText(expectedPageText, { timeout: 5000 });
        } catch (e) {
            console.warn(`⚠️ Pagination indicator did not match page ${expectedPage}: ${e.message}`);
        }

        await this.page.waitForFunction((previousText) => {
            const transactionHeading = [...document.querySelectorAll('h2')]
                .find((heading) => heading.textContent.trim() === 'Transactions');
            const table = transactionHeading?.nextElementSibling?.matches('table')
                ? transactionHeading.nextElementSibling
                : transactionHeading?.parentElement?.querySelector('table');
            const rows = [...(table?.querySelectorAll('tbody tr') || [])];
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

    async getPaginationText() {
        try {
            if (await this.pageIndicator.count()) {
                return ((await this.pageIndicator.textContent()) || '').trim();
            }
        } catch (e) {
            return '';
        }

        return '';
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
        await this.selectDropdown(this.categoryFilter, transaction.category, 'Category Filter');
        await this.fillInputField(this.startDateFilter, this.formatDate_FromDDMMYYYY_To_YYYYMMDD(transaction.date_dd_mm_yyyy), 'Start Date');
        await this.fillInputField(this.endDateFilter, this.formatDate_FromDDMMYYYY_To_YYYYMMDD(transaction.date_dd_mm_yyyy), 'End Date');
        await this.selectDropdown(this.labelFilter, transaction.label, 'Label Filter');
        await this.waitForFilteredTransaction(transaction);
    }

    async validateImpactOfTranctionAddedOnTable(transaction) {
        const transactionRow = await this.getTransactionRow(transaction);
        const cells = transactionRow.locator("td");

        let actualDate = (await cells.nth(0).textContent())?.trim()
        await this.expectToBe(this.formatDateReplace_To_Hyphen(actualDate), transaction.date_dd_mm_yyyy, 'Date validation');
        await this.expectToBe((await cells.nth(1).textContent())?.trim(), transaction.category, 'Category validation');
        await this.expectToBe((await cells.nth(2).textContent())?.trim(), transaction.comments, 'Comments validation');
        await this.expectToBe((await cells.nth(3).textContent())?.trim(), transaction.label, 'Label validation');

        if (transaction.transactionType.toLowerCase() === 'debit') {
            const actual = parseFloat((await cells.nth(4).textContent())?.trim().replace(/,/g, '')).toFixed(2);
            await this.expectToBe(actual, parseFloat(transaction.amount).toFixed(2), 'Debit Amount validation');
        } else {
            const actual = parseFloat((await cells.nth(5).textContent())?.trim().replace(/,/g, '')).toFixed(2);
            await this.expectToBe(actual, parseFloat(transaction.amount).toFixed(2), 'Credit Amount validation');
        }
    }

    async waitForFilteredTransaction(transaction) {
        await expect.poll(async () => {
            return this.findTransactionInFilteredPages(transaction);
        }, {
            message: 'Wait for filtered transaction row',
            timeout: 20000
        }).toBe(true);
    }

    async getTransactionRow(transaction) {
        const rowIndex = await this.getMatchingTransactionRowIndex(transaction);

        if (rowIndex !== -1) {
            return this.transactionRows.nth(rowIndex);
        }

        throw new Error(`Transaction row not found for ${transaction.date_dd_mm_yyyy} | ${transaction.category} | ${transaction.amount} | ${transaction.comments}`);
    }

    async readTransactionRows() {
        return await this.transactionRows.evaluateAll((rows) => rows.map((row) => {
            const cells = [...row.querySelectorAll('td')].map((cell) => cell.textContent.trim());
            const normalizeAmount = (value) => {
                const parsed = parseFloat((value || '').replace(/,/g, '').trim());
                return Number.isNaN(parsed) ? '0.00' : parsed.toFixed(2);
            };

            return {
                date: cells[0] || '',
                category: cells[1] || '',
                comments: cells[2] || '',
                label: cells[3] || '',
                debit: normalizeAmount(cells[4]),
                credit: normalizeAmount(cells[5])
            };
        }));
    }

    getExpectedSummaryAfterTransaction(before, createdTransactionDetails) {
        const type = createdTransactionDetails.transactionType.toLowerCase();
        const amount = parseFloat(createdTransactionDetails.amount);

        const expected = {
            currentBalanceSummary: before.currentBalanceSummary,
            TotalIncomeSummary: before.TotalIncomeSummary,
            TotalExpenseSummary: before.TotalExpenseSummary
        };

        if (type === 'debit') {
            expected.TotalExpenseSummary += amount;
            expected.currentBalanceSummary -= amount;
        } else if (type === 'credit') {
            expected.TotalIncomeSummary += amount;
            expected.currentBalanceSummary += amount;
        }

        return Object.fromEntries(
            Object.entries(expected).map(([key, value]) => [key, Number(value.toFixed(2))])
        );
    }

    async waitForSummaryImpact(beforeSummary, createdTransaction) {
        const expected = this.getExpectedSummaryAfterTransaction(beforeSummary, createdTransaction);

        await expect.poll(async () => {
            const summary = await this.getSummaryCardsData();
            return {
                currentBalanceSummary: Number(summary.currentBalanceSummary.toFixed(2)),
                TotalIncomeSummary: Number(summary.TotalIncomeSummary.toFixed(2)),
                TotalExpenseSummary: Number(summary.TotalExpenseSummary.toFixed(2))
            };
        }, {
            message: 'Wait for summary cards to reflect the created transaction',
            timeout: 15000
        }).toEqual(expected);

        return this.getSummaryCardsData();
    }

    getRowAction(row, actionName) {
        return row.locator(`[title="${actionName}"], [aria-label="${actionName}"]`)
            .or(row.getByText(actionName, { exact: true }))
            .first();
    }

    async findTransactionInFilteredPages(transaction) {
        while (true) {
            const rowIndex = await this.getMatchingTransactionRowIndex(transaction);
            if (rowIndex !== -1) {
                return true;
            }

            if (!(await this.canProceedToNextPage())) {
                return false;
            }

            const currentPageText = await this.getPaginationText();
            await this.paginationNext.click();
            await this.waitForPaginatedTableUpdateByTextChange(currentPageText);
        }
    }

    async getMatchingTransactionRowIndex(transaction) {
        const expectedDate = transaction.date_dd_mm_yyyy.replaceAll('-', '/');
        const expectedAmount = parseFloat(transaction.amount).toFixed(2);
        const rowsCount = await this.transactionRows.count();

        for (let i = 0; i < rowsCount; i++) {
            const row = this.transactionRows.nth(i);
            const cells = row.locator("td");
            const amountLocator = transaction.transactionType.toLowerCase() === 'debit' ? cells.nth(4) : cells.nth(5);
            const amount = parseFloat(((await amountLocator.textContent()) || '').replace(/,/g, '').trim()).toFixed(2);

            if (
                ((await cells.nth(0).textContent()) || '').trim() === expectedDate &&
                ((await cells.nth(1).textContent()) || '').trim() === transaction.category &&
                ((await cells.nth(2).textContent()) || '').trim() === transaction.comments &&
                ((await cells.nth(3).textContent()) || '').trim() === transaction.label &&
                amount === expectedAmount
            ) {
                return i;
            }
        }

        return -1;
    }

    async waitForPaginatedTableUpdateByTextChange(previousPageText) {
        await expect.poll(async () => {
            return this.getPaginationText();
        }, {
            message: 'Wait for pagination indicator to change',
            timeout: 10000
        }).not.toBe(previousPageText);

        await this.waitForTableData();
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
