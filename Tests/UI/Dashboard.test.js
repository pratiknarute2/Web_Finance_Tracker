const { test, expect } = require('@playwright/test');
const fs = require('fs/promises');
const DashboardPage = require('../../Pages/DashboardPage');
const HomePage = require('../../Pages/HomePage');
const TransactionPage = require('../../Pages/TransactionPage');
const { UI_URL, API_URL } = require('../../playwright.config');
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
        expect(headers).toEqual(['Category', 'Amount', 'Percentage', 'Progress']);

        // Fetch UI data
        const chartBars = await dashboardPage.getBarChartData();
        const breakdownRows = await dashboardPage.getBreakdownRowsData();
        const totalRow = await dashboardPage.getBreakdownTotalRowData();
        const itemCount = await dashboardPage.getBreakdownItemCount();

        // Basic validations
        expect(chartBars.length).toBeGreaterThan(0);
        expect(breakdownRows.length).toBe(chartBars.length);
        expect(itemCount).toBe(breakdownRows.length);

        // Validate total row
        expect(totalRow.label).toBe('Total');
        expect(totalRow.percentage).toBe('100%');
        expect(totalRow.progressWidth).toContain('100%');

        // Validate total amount
        const displayedTotal = await dashboardPage.getChartTotal();
        expect(normalizeAmount(totalRow.amount)).toBe(displayedTotal.toFixed(2));

        // Validate first item consistency (chart vs table)
        const firstBar = chartBars[0];
        const firstRow = breakdownRows[0];

        expect(firstBar.label).toBe(firstRow.name);
        expect(normalizeAmount(firstBar.amount)).toBe(normalizeAmount(firstRow.amount));
        expect(firstBar.percentage).toBe(firstRow.percentage);

        // Tooltip validations
        expect(firstBar.tooltip).toContain(firstBar.label);
        expect(firstBar.tooltip).toContain(firstBar.amount);
        expect(firstBar.tooltip).toContain(firstBar.percentage);

        // Row tooltip validations
        expect(firstRow.title).toContain(firstRow.name);
        expect(firstRow.title).toContain(firstRow.amount);
        expect(firstRow.title).toContain(firstRow.percentage);
    });

    // ==================================================
    // ✅ TEST 2: Tab Switching Validation
    // ==================================================
    test('Verify Tab Switching (Credit & Labels) and Ensure Data Integrity', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);

        await dashboardPage.waitForDashboardToLoad();

        // Switch to Credit tab
        await dashboardPage.openTab('Credit');
        expect(await dashboardPage.getActiveTabName()).toBe('Credit');
        await expect(dashboardPage.chartTitle).toContainText(/Credit/i);
        await expect(dashboardPage.chartTotalLabel).toContainText(/Credit total/i);

        const creditRows = await dashboardPage.getBreakdownRowsData();
        const creditTotal = await dashboardPage.getBreakdownTotalRowData();
        const creditBars = await dashboardPage.getBarChartData();

        expect(creditRows.length).toBeGreaterThan(0);
        expect(creditRows.length).toBe(creditBars.length);
        expect(creditTotal.percentage).toBe('100%');
        expect(await dashboardPage.getFirstVisibleChartTooltip()).not.toBe('');

        // Switch to Labels tab
        await dashboardPage.openTab('Labels');
        expect(await dashboardPage.getActiveTabName()).toBe('Labels');
        await expect(dashboardPage.chartTitle).toContainText(/Label/i);

        const labelRows = await dashboardPage.getBreakdownRowsData();
        const labelTotal = await dashboardPage.getBreakdownTotalRowData();
        const visibleTitles = await dashboardPage.getVisibleChartTitleAttributes();
        const segmentsCount = await dashboardPage.getPieOrChartSegmentsCount();

        expect(labelRows.length).toBeGreaterThan(0);
        expect(labelTotal.percentage).toBe('100%');
        expect(segmentsCount).toBeGreaterThan(0);
        expect(visibleTitles.length).toBeGreaterThan(0);
        expect(visibleTitles[0]).toMatch(/%/);
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
        expect(foodBefore).not.toBeNull();

        await dashboardPage.openTab('Labels');
        const essentialsBefore = await dashboardPage.getBreakdownRowByName('Essentials');
        expect(essentialsBefore).not.toBeNull();

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

            expect(foodAfter).not.toBeNull();
            expect(normalizeAmount(foodAfter.amount)).toBe(
                (parseFloat(normalizeAmount(foodBefore.amount)) + parseFloat(newTransaction.amount)).toFixed(2)
            );

            expect(normalizeAmount(debitTotalRow.amount)).toBe(expectedDebitTotal.toFixed(2));
            expect(debitTotalRow.percentage).toBe('100%');

            // Validate Labels tab updates
            await dashboardPage.openTab('Labels');
            const essentialsAfter = await dashboardPage.getBreakdownRowByName('Essentials');

            expect(essentialsAfter).not.toBeNull();
            expect(parseFloat(normalizeAmount(essentialsAfter.amount))).toBe(
                parseFloat(normalizeAmount(essentialsBefore.amount)) + parseFloat(newTransaction.amount)
            );

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