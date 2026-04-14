const { test, expect } = require('@playwright/test');
const DashboardPage = require('../../Pages/DashboardPage');
const HomePage = require('../../Pages/HomePage');
const TransactionPage = require('../../Pages/TransactionPage');
const LoginPage = require("../../Pages/LoginPage");


// ===================== TEST SUITE =====================
test.describe('Dashboard Insights Validation Suite', () => {

    // ✅ Login before each test
    test.beforeEach(async ({ page, request }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login_through_post_API(request)
    });

    // ==================================================
    // ✅ TEST 1: Debit Dashboard Validation
    // ==================================================
    test('Verify Debit Dashboard - Chart, Tooltip, and Breakdown Data Consistency', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);

        await dashboardPage.waitForDashboardToLoad();

        // Validate default tab and UI labels
        await expect(dashboardPage.getTab('Debit')).toHaveAttribute('aria-selected', 'true');
        await expect(dashboardPage.chartTitle).toContainText(/Debit/i);
        await expect(dashboardPage.chartTotalLabel).toContainText(/Debit total/i);

        // Validate table headers
        const headers = await dashboardPage.getBreakdownHeaders();
        await dashboardPage.expectToEqual(headers, ['Category', 'Amount', 'Percentage', 'Progress'], 'Dashboard breakdown headers');

        // Fetch UI data
        const chartBars = await dashboardPage.getBarChartData();
        const breakdownRows = await dashboardPage.getBreakdownRowsData();
        const totalRow = await dashboardPage.getBreakdownTotalRowData();
        const itemCount = await dashboardPage.getBreakdownItemCount();

        // Basic validations
        await dashboardPage.expectToBeGreaterThan(chartBars.length, 0, 'Debit chart contains category slices');
        await dashboardPage.expectToBe(breakdownRows.length, chartBars.length, 'Debit chart items match breakdown rows');
        await dashboardPage.expectToBe(itemCount, breakdownRows.length, 'Debit item count matches breakdown rows');

        // Validate total row
        await dashboardPage.expectToBe(totalRow.label, 'Total', 'Debit total row label');
        await dashboardPage.expectToBe(totalRow.percentage, '100%', 'Debit total row percentage');
        await dashboardPage.expectToContain(totalRow.progressWidth, '100%', 'Debit total row progress width');

        // Validate total amount
        const displayedTotal = await dashboardPage.getChartTotal();
        await dashboardPage.expectToBe(normalizeAmount(totalRow.amount), displayedTotal.toFixed(2), 'Debit total amount matches chart total');

        // Validate first item consistency (chart vs table)
        const firstBar = chartBars[0];
        const firstRow = breakdownRows[0];

        await dashboardPage.expectToBe(firstBar.label, firstRow.name, 'First debit chart label matches breakdown row');
        await dashboardPage.expectToBe(normalizeAmount(firstBar.amount), normalizeAmount(firstRow.amount), 'First debit chart amount matches breakdown row');
        await dashboardPage.expectToBe(firstBar.percentage, firstRow.percentage, 'First debit chart percentage matches breakdown row');

        // Tooltip validations
        await dashboardPage.expectToContain(firstBar.tooltip, firstBar.label, 'First debit chart tooltip contains category');
        await dashboardPage.expectToContain(firstBar.tooltip, firstBar.amount, 'First debit chart tooltip contains amount');
        await dashboardPage.expectToContain(firstBar.tooltip, firstBar.percentage, 'First debit chart tooltip contains percentage');

        // Row tooltip validations
        await dashboardPage.expectToContain(firstRow.title, firstRow.name, 'First debit row tooltip contains category');
        await dashboardPage.expectToContain(firstRow.title, firstRow.amount, 'First debit row tooltip contains amount');
        await dashboardPage.expectToContain(firstRow.title, firstRow.percentage, 'First debit row tooltip contains percentage');
    });

    // ==================================================
    // ✅ TEST 2: Tab Switching Validation
    // ==================================================
    test('Verify Tab Switching (Credit & Labels) and Ensure Data Integrity', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);

        await dashboardPage.waitForDashboardToLoad();

        // Switch to Credit tab
        await dashboardPage.openTab('Credit');
        await dashboardPage.expectToBe(await dashboardPage.getActiveTabName(), 'Credit', 'Credit tab is active');
        await expect(dashboardPage.chartTitle).toContainText(/Credit/i);
        await expect(dashboardPage.chartTotalLabel).toContainText(/Credit total/i);

        const creditRows = await dashboardPage.getBreakdownRowsData();
        const creditTotal = await dashboardPage.getBreakdownTotalRowData();
        const creditBars = await dashboardPage.getBarChartData();

        await dashboardPage.expectToBeGreaterThan(creditRows.length, 0, 'Credit breakdown contains rows');
        await dashboardPage.expectToBe(creditRows.length, creditBars.length, 'Credit chart items match breakdown rows');
        await dashboardPage.expectToBe(creditTotal.percentage, '100%', 'Credit total row percentage');
        await dashboardPage.expectNotToBeEmpty(await dashboardPage.getFirstVisibleChartTooltip(), 'Credit chart tooltip is available');

        // Switch to Labels tab
        await dashboardPage.openTab('Labels');
        await dashboardPage.expectToBe(await dashboardPage.getActiveTabName(), 'Labels', 'Labels tab is active');
        await expect(dashboardPage.chartTitle).toContainText(/Label/i);

        const labelRows = await dashboardPage.getBreakdownRowsData();
        const labelTotal = await dashboardPage.getBreakdownTotalRowData();
        const visibleTitles = await dashboardPage.getVisibleChartTitleAttributes();
        const segmentsCount = await dashboardPage.getPieOrChartSegmentsCount();

        await dashboardPage.expectToBeGreaterThan(labelRows.length, 0, 'Labels breakdown contains rows');
        await dashboardPage.expectToBe(labelTotal.percentage, '100%', 'Labels total row percentage');
        await dashboardPage.expectToBeGreaterThan(segmentsCount, 0, 'Labels chart contains segments');
        await dashboardPage.expectToBeGreaterThan(visibleTitles.length, 0, 'Labels chart exposes tooltips');
        await dashboardPage.expectToMatch(visibleTitles[0], /%/, 'First labels chart tooltip includes percentage');
    });

    // ==================================================
    // ✅ TEST 3: Dashboard Update After Transaction
    // ==================================================
    test('Verify Dashboard Updates After Adding New Transaction', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        const homePage = new HomePage(page);
        const transactionPage = new TransactionPage(page);

        const newTransaction = {
            date_dd_mm_yyyy: '14-04-2026',
            transactionType: 'debit',
            category: 'Food',
            amount: '1000',
            label: 'Essentials',
            comments: `Dashboard E2E ${Date.now()}`
        };

        await dashboardPage.waitForDashboardToLoad();

        // Capture initial values
        const debitTotalBefore = await dashboardPage.getChartTotal();
        const foodBefore = await dashboardPage.getBreakdownRowByName('Food');
        await dashboardPage.expectToBe(foodBefore !== null, true, 'Food row exists before transaction');

        await dashboardPage.openTab('Labels');
        const essentialsBefore = await dashboardPage.getBreakdownRowByName('Essentials');
        await dashboardPage.expectToBe(essentialsBefore !== null, true, 'Essentials row exists before transaction');

        await dashboardPage.openTab('Debit');

        // Create new transaction
        await transactionPage.createTransaction(
            newTransaction.date_dd_mm_yyyy,
            newTransaction.transactionType,
            newTransaction.category,
            newTransaction.amount,
            newTransaction.label,
            newTransaction.comments
        );

        await homePage.verifyTransactionSuccessMessage();

        try {
            const expectedDebitTotal = debitTotalBefore + parseFloat(newTransaction.amount);

            // Validate Debit tab updates
            await dashboardPage.openTab('Debit');
            await dashboardPage.waitForTotalToBe(expectedDebitTotal);

            const foodAfter = await dashboardPage.getBreakdownRowByName('Food');
            const debitTotalRow = await dashboardPage.getBreakdownTotalRowData();

            await dashboardPage.expectToBe(foodAfter !== null, true, 'Food row exists after transaction');
            await dashboardPage.expectToBe(normalizeAmount(foodAfter.amount), (
                (parseFloat(normalizeAmount(foodBefore.amount)) + parseFloat(newTransaction.amount)).toFixed(2)
            ), 'Food amount is updated after transaction');

            await dashboardPage.expectToBe(normalizeAmount(debitTotalRow.amount), expectedDebitTotal.toFixed(2), 'Debit total row amount is updated');
            await dashboardPage.expectToBe(debitTotalRow.percentage, '100%', 'Debit total row remains at 100 percent');

            // Validate Labels tab updates
            await dashboardPage.openTab('Labels');
            const essentialsAfter = await dashboardPage.getBreakdownRowByName('Essentials');

            await dashboardPage.expectToBe(essentialsAfter !== null, true, 'Essentials row exists after transaction');
            await dashboardPage.expectToBe(parseFloat(normalizeAmount(essentialsAfter.amount)), (
                parseFloat(normalizeAmount(essentialsBefore.amount)) + parseFloat(newTransaction.amount)
            ), 'Essentials label amount is updated after transaction');

        } finally {
            // Cleanup: delete created transaction
            await homePage.deleteTransaction(newTransaction);
        }
    });

    // ==================================================
    // ✅ TEST 4: Responsive UI Validation
    // ==================================================
    test('Verify Dashboard Responsiveness Across Multiple Viewports', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);

        const viewports = [
            { name: 'desktop', width: 1440, height: 900 },
            { name: 'tablet', width: 820, height: 1180 },
            { name: 'mobile', width: 390, height: 844 }
        ];

        await dashboardPage.waitForDashboardToLoad();

        for (const viewport of viewports) {

            // Change viewport
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.reload({ waitUntil: 'networkidle' });

            await dashboardPage.waitForDashboardToLoad();

            // Validate layout stability across tabs
            await dashboardPage.openTab('Debit');
            await dashboardPage.assertDashboardLayoutIsStable();

            await dashboardPage.openTab('Credit');
            await dashboardPage.assertDashboardLayoutIsStable();

            await dashboardPage.openTab('Labels');
            await dashboardPage.assertDashboardLayoutIsStable();
        }
    });

});

// ✅ Utility to normalize currency values for comparison
function normalizeAmount(value) {
    return (parseFloat((value || '').replace(/[^\d.-]/g, '')) || 0).toFixed(2);
}
