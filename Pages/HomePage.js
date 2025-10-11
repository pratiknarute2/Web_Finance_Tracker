const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility');
const Get = require('../API/Get.js');
const { UI_URL, API_URL } = require('../playwright.config.js'); // Import dynamic URLs
const TransactionPage = require('./TransactionPage.js');

class HomePage extends Utility {
    constructor(page) {
        super(page);
        this.page = page;

        // ============================
        // 🔹 Locators
        // ============================
        this.paginationNext = page.locator("//button[contains(text(),'Next')]");
        this.debitAmountsElement = page.locator("//table//tbody//tr//td[@class='debit-amount']");
        this.creditAmountsElement = page.locator("//table//tbody//tr//td[@class='credit-amount']");
        this.currentBalance = page.locator("//div[@class='summary-cards']//div[@class='summary-card balance']//p");
        this.totalIncome = page.locator("//div[@class='summary-cards']//div[@class='summary-card income']//p");
        this.totalExpense = page.locator("//div[@class='summary-cards']//div[@class='summary-card expense']//p");
        this.successfullMessageTransaction = page.locator("//div[text()='Transaction added successfully!']");
        this.showFilterButton = page.locator("//button[text()='Show Filters']");
        this.startDateFilter = page.locator("//label[text()='Start Date:']//input");
        this.endDateFilter = page.locator("//label[text()='End Date:']//input");

        // ============================
        // 🔹 Table Row Locators (First row)
        // ============================
        this.date1Row_Table = page.locator("//table//tbody//tr[1]//td[1]");
        this.category1Row_Table = page.locator("//table//tbody//tr[1]//td[2]");
        this.comments1Row_Table = page.locator("//table//tbody//tr[1]//td[3]");
        this.label1Row_Table = page.locator("//table//tbody//tr[1]//td[4]");
        this.debitAmount1Row_Table = page.locator("//table//tbody//tr[1]//td[5]");
        this.creditAmount1Row_Table = page.locator("//table//tbody//tr[1]//td[6]");
        this.balance1Row_Table = page.locator("//table//tbody//tr[1]//td[7]");
        this.edit1Row_Table = page.locator("//table//tbody//tr[1]//td[8]//span[@title='Edit']]");
        this.delete1Row_Table = page.locator("//table//tbody//tr[1]//td[8]//span[@title='Delete']");
    }

    // ============================
    // 🔹 Main Table Calculation Function
    // ============================
    async arthmaticalTableCalculation(request) {
        let pageCount = 1;
        let debitAmount = 0;
        let creditAmount = 0;

        // Wait until the "Next" button becomes interactable initially
        await this.waitForInitialNextButton();

        while (true) {
            // Wait until table data (first debit row) is visible before reading
            await this.waitForTableData();

            // --- SUM DEBIT AMOUNTS ---
            debitAmount = await this.calculateDebitAmounts(debitAmount);

            // --- SUM CREDIT AMOUNTS ---
            creditAmount = await this.calculateCreditAmounts(creditAmount);

            // Small buffer to allow dynamic table data to stabilize
            await this.waitForDataStabilization();

            pageCount++;

            // Check if we can proceed to next page
            const canProceed = await this.canProceedToNextPage();
            if (!canProceed) {
                console.log(`🚫 Next button is disabled — last page (${pageCount}) reached!`);
                break;
            }

            // Move to the next page and wait until data finishes loading
            await this.navigateToNextPage(pageCount);
        }

        console.log(`✅ Processed ${(pageCount - 1)} pages successfully.`);
        console.log(`💰 Total Debit Amount: ${debitAmount.toFixed(2)} | Total Credit Amount: ${creditAmount.toFixed(2)} `);

        // Fetch Summary Cards and Clean Data
        const summaryData = await this.getSummaryCardsData();

        // Calculate actual current balance using opening balance from API
        const get = new Get(request);
        const openingBalance = await get.getOpeningBalanceAPI();
        const actualCurrentBalance = openingBalance + summaryData.TotalIncomeSummary - summaryData.TotalExpenseSummary;

        // Validate table calculations against summary
        await this.performArthmaticalTableCalculationValidations(debitAmount, creditAmount, summaryData, actualCurrentBalance);
    }

    // ============================
    // 🔹 Helper Methods
    // ============================
    async waitForInitialNextButton() {
        await this.page.waitForFunction(
            el => el && !el.disabled,
            await this.paginationNext.elementHandle(),
            { timeout: 15000 }
        );
    }

    async waitForTableData() {
        await this.debitAmountsElement.first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async calculateDebitAmounts(currentDebitAmount) {
        let debitAmount = currentDebitAmount;
        const debitCount = await this.debitAmountsElement.count();

        for (let i = 0; i < debitCount; i++) {
            // Remove non-numeric characters and convert to float
            const text = (await this.debitAmountsElement.nth(i).textContent() || "")
                .replace(/[^\d.-]/g, '').trim();
            const amount = parseFloat(text) || 0;
            debitAmount += amount;
            console.log(`Debit: ${debitAmount} = (${debitAmount - amount} + ${amount})`);
        }

        return debitAmount;
    }

    async calculateCreditAmounts(currentCreditAmount) {
        let creditAmount = currentCreditAmount;
        const creditCount = await this.creditAmountsElement.count();

        for (let i = 0; i < creditCount; i++) {
            // Remove non-numeric characters and convert to float
            const text = (await this.creditAmountsElement.nth(i).textContent() || "")
                .replace(/[^\d.-]/g, '').trim();
            const amount = parseFloat(text) || 0;
            creditAmount += amount;
            console.log(`Credit: ${creditAmount} = (${creditAmount - amount} + ${amount})`);
        }

        return creditAmount;
    }

    async waitForDataStabilization() {
        await this.page.waitForTimeout(3000);
    }

    async canProceedToNextPage() {
        try {
            await this.page.waitForFunction(
                el => el && !el.disabled,
                await this.paginationNext.elementHandle(),
                { timeout: 10000 }
            );
        } catch {
            console.log(`⚠️ Next button did not re-enable — likely last page.`);
            return false;
        }
        return await this.paginationNext.isEnabled();
    }

    async navigateToNextPage(pageCount) {
        await Promise.all([
            this.clickElement(this.paginationNext, 'Pagination Next: ' + pageCount),
            this.page.waitForLoadState('networkidle', { timeout: 10000 })
        ]);
    }

    async getSummaryCardsData() {
        const currentBalanceText = ((await this.currentBalance.first().textContent()) || '')
            .replace(/[^\d.-]/g, '').trim();
        const currentBalanceSummary = parseFloat(currentBalanceText) || 0;

        const totalIncomeText = ((await this.totalIncome.first().textContent()) || '')
            .replace(/[^\d.-]/g, '').trim();
        const TotalIncomeSummary = parseFloat(totalIncomeText) || 0;

        const totalExpenseText = ((await this.totalExpense.first().textContent()) || '')
            .replace(/[^\d.-]/g, '').trim();
        const TotalExpenseSummary = parseFloat(totalExpenseText) || 0;

        return {
            currentBalanceSummary,
            TotalIncomeSummary,
            TotalExpenseSummary
        };
    }

    async performArthmaticalTableCalculationValidations(debitAmount, creditAmount, summaryData, actualCurrentBalance) {
        // Validate debit, credit, and current balance values using toFixed(2) for accuracy
        await this.expectToBe(
            debitAmount.toFixed(2),
            summaryData.TotalExpenseSummary.toFixed(2),
            'Summary Total expense balance matching with all debit transaction'
        );

        await this.expectToBe(
            creditAmount.toFixed(2),
            summaryData.TotalIncomeSummary.toFixed(2),
            'Summary Total income balance matching with all credit transaction'
        );

        await this.expectToBe(
            actualCurrentBalance.toFixed(2),
            summaryData.currentBalanceSummary.toFixed(2),
            'Summary Current balance matching'
        );
    }

    // ============================
    // 🔹 Transaction Impact Methods
    // ============================
    async impactCalculationOfCreatedTransaction() {
        const transactionPage = new TransactionPage(this.page);

        await this.waitForTableData();

        // Capture summary before add transaaction
        const beforeTransactionAddedSummaryData = await this.getSummaryCardsData()

        // Create a new transaction
        const createdTransactionDetails = await transactionPage.createTransaction(
            '2025-10-09', 'debit', 'Food', '1000', 'Essentials', 'Autoamtion Testing'
        );

        // Verify success message
        await this.verifyTransactionSuccessMessage();

        await this.waitForDataStabilization()

        // Capture summary after add transaaction
        const afterTransactionAddedSummaryData = await this.getSummaryCardsData()

        // validate summary data
        await this.validateImpactOfTransactionAddedOnSummary(beforeTransactionAddedSummaryData, afterTransactionAddedSummaryData, createdTransactionDetails)

        // Apply filters for the created transaction
        await this.applyTransactionFilters(createdTransactionDetails);

        // Validate transaction appears correctly in the table
        await this.validateImpactOfTranctionAddedOnTable(createdTransactionDetails);
    }

    async validateImpactOfTransactionAddedOnSummary(before, after, createdTransactionDetails) {
        // Parse transaction amount as number
        const amount = parseFloat(createdTransactionDetails.amount);

        // Initialize expected values based on transaction type
        let expectedTotalExpenses = before.TotalExpenseSummary;
        let expectedTotalIncome = before.TotalIncomeSummary;
        let expectedCurrentBalance = before.currentBalanceSummary;

        if (createdTransactionDetails.transactionType.toLowerCase() === 'debit') {
            // For debit transaction: expense increases, balance decreases
            expectedTotalExpenses += amount;
            expectedCurrentBalance -= amount;
        } else {
            // For credit transaction: income increases, balance increases
            expectedTotalIncome += amount;
            expectedCurrentBalance += amount;
        }

        // ✅ Perform validations using Utility.expectToBe
        await this.expectToBe(after.currentBalanceSummary, expectedCurrentBalance, 'Current Balance summary impacted by Added Transaction');
        await this.expectToBe(after.TotalExpenseSummary, expectedTotalExpenses, 'Total Expenses summary impacted by Added Transaction');
        await this.expectToBe(after.TotalIncomeSummary, expectedTotalIncome, 'Total Income summary impacted by Added Transaction');
    }


    async verifyTransactionSuccessMessage() {
        const messageDisplayed = await this.isDisplay(
            this.successfullMessageTransaction,
            5000,
            'Transaction Added Successfull Toaster Message'
        );

        await this.expectToBe(
            messageDisplayed,
            true,
            'Transaction Added Successfull Toaster Message'
        );
    }

    async applyTransactionFilters(createdTransactionDetails) {
        // Open filters
        await this.clickElement(this.showFilterButton, 'Show Filter');

        // Apply date filters
        await this.fillInputField(this.startDateFilter, createdTransactionDetails.date_yyyy_mm_dd, 'Start Date');
        await this.fillInputField(this.endDateFilter, createdTransactionDetails.date_yyyy_mm_dd, 'End Date');

        await this.page.waitForTimeout(3000); // wait for table to refresh
    }

    async validateImpactOfTranctionAddedOnTable(createdTransactionDetails) {
        // ============================
        // 🔹 Date validation (normalize format)
        // ============================
        const dateText = (await this.date1Row_Table.textContent())?.trim();
        await this.expectToBe(
            this.formatDateToYYYYMMDD(dateText),
            createdTransactionDetails.date_yyyy_mm_dd,
            'Date validation'
        );

        // ============================
        // 🔹 Category validation
        // ============================
        const categoryText = (await this.category1Row_Table.textContent())?.trim();
        await this.expectToBe(categoryText, createdTransactionDetails.category, 'Category validation');

        // ============================
        // 🔹 Label validation
        // ============================
        const labelText = (await this.label1Row_Table.textContent())?.trim();
        await this.expectToBe(labelText, createdTransactionDetails.label, 'Label validation');

        // ============================
        // 🔹 Amount validation
        // Normalize numbers to remove commas and force 2 decimal places
        // ============================
        if (createdTransactionDetails.transactionType.toLowerCase() === 'debit') {
            const debitText = (await this.debitAmount1Row_Table.textContent())?.trim();
            const actualDebit = parseFloat(debitText.replace(/,/g, '')).toFixed(2);
            const expectedDebit = parseFloat(createdTransactionDetails.amount).toFixed(2);
            await this.expectToBe(actualDebit, expectedDebit, 'Debit Amount validation');
        } else {
            const creditText = (await this.creditAmount1Row_Table.textContent())?.trim();
            const actualCredit = parseFloat(creditText.replace(/,/g, '')).toFixed(2);
            const expectedCredit = parseFloat(createdTransactionDetails.amount).toFixed(2);
            await this.expectToBe(actualCredit, expectedCredit, 'Credit Amount validation');
        }
    }

    // ============================
    // 🔹 Date formatting utility
    // Converts UI date like "9/20/2025" to "2025-09-20"
    // ============================
    formatDateToYYYYMMDD(uiDate) {
        const [month, day, year] = uiDate.split('/'); // Split by '/'
        const mm = month.padStart(2, '0'); // pad month to 2 digits
        const dd = day.padStart(2, '0');   // pad day to 2 digits
        return `${year}-${mm}-${dd}`;
    }
}

module.exports = HomePage;
