const { expect } = require('@playwright/test');
const Utility = require('../Base/Utility');

class DashboardPage extends Utility {
    constructor(page) {
        super(page);
        this.page = page;
        this.initLocators();
    }

    initLocators() {
        this.insightsPanel = this.page.locator('.insights-panel');
        this.insightsHeader = this.insightsPanel.locator('.insights-header');
        this.insightsBody = this.insightsPanel.locator('.insights-body');
        this.chartCard = this.insightsPanel.locator('.insights-chart-card');
        this.breakdownCard = this.insightsPanel.locator('.insights-breakdown-card');
        this.chartTitle = this.chartCard.locator('.insights-chart-head h4');
        this.chartTotalLabel = this.chartCard.locator('.insights-chart-total span');
        this.chartTotalAmount = this.chartCard.locator('.insights-chart-total strong');
        this.breakdownItemCount = this.breakdownCard.locator('.insights-breakdown-head span');
        this.breakdownTable = this.breakdownCard.locator('.insights-breakdown-table');
        this.breakdownRows = this.breakdownTable.locator('tbody tr');
        this.breakdownTotalRow = this.breakdownTable.locator('tfoot tr');
        this.tabButtons = this.insightsPanel.locator('[role="tab"]');
    }

    async waitForDashboardToLoad() {
        await this.insightsPanel.waitFor({ state: 'visible', timeout: 20000 });
        await expect(this.chartCard).toBeVisible();
        await expect(this.breakdownCard).toBeVisible();
        await expect.poll(async () => await this.getBreakdownItemCount(), {
            timeout: 15000,
            message: 'Wait for dashboard breakdown items to load'
        }).toBeGreaterThan(0);
        await expect(this.breakdownRows.first()).toBeVisible();
    }

    getTab(tabName) {
        return this.insightsPanel.getByRole('tab', { name: new RegExp(`^${tabName}$`, 'i') });
    }

    async openTab(tabName) {
        const tab = this.getTab(tabName);
        await this.clickElement(tab, `${tabName} dashboard tab`);
        await expect(tab).toHaveAttribute('aria-selected', 'true');
        await expect.poll(async () => await this.getActiveTabName(), {
            timeout: 10000,
            message: `Wait for ${tabName} tab to become active`
        }).toBe(tabName);
        await expect.poll(async () => await this.getBreakdownItemCount(), {
            timeout: 10000,
            message: `Wait for ${tabName} dashboard data to load`
        }).toBeGreaterThan(0);
    }

    async getActiveTabName() {
        return ((await this.insightsPanel.locator('[role="tab"][aria-selected="true"]').textContent()) || '').trim();
    }

    async getChartTitle() {
        return ((await this.chartTitle.textContent()) || '').trim();
    }

    async getChartTotal() {
        return this.parseCurrency(await this.chartTotalAmount.textContent());
    }

    async getBreakdownItemCount() {
        const raw = ((await this.breakdownItemCount.textContent()) || '').trim();
        return parseInt(raw.replace(/[^\d]/g, ''), 10) || 0;
    }

    async getBreakdownHeaders() {
        return await this.breakdownTable.locator('thead th').evaluateAll((headers) =>
            headers.map((header) => header.textContent.trim())
        );
    }

    async getBreakdownRowsData() {
        return await this.breakdownRows.evaluateAll((rows) =>
            rows.map((row) => {
                const cells = [...row.querySelectorAll('td')];
                const progressFill = row.querySelector('.insights-progress-fill');
                const name = cells[0]?.innerText.trim() || '';
                const amount = cells[1]?.innerText.trim() || '';
                const percentage = cells[2]?.innerText.trim() || '';
                const title = row.getAttribute('title') || progressFill?.getAttribute('title') || '';
                const width = progressFill?.style.width || '';

                return {
                    name,
                    amount,
                    percentage,
                    title,
                    progressWidth: width
                };
            })
        );
    }

    async getBreakdownTotalRowData() {
        const cells = this.breakdownTotalRow.locator('td');
        return {
            label: ((await cells.nth(0).textContent()) || '').trim(),
            amount: ((await cells.nth(1).textContent()) || '').trim(),
            percentage: ((await cells.nth(2).textContent()) || '').trim(),
            progressWidth: ((await this.breakdownTotalRow.locator('.insights-progress-fill').getAttribute('style')) || '')
        };
    }

    async getBarChartData() {
        return await this.chartCard.evaluate((chartCard) => {
            const legendCandidates = new Set();
            chartCard.querySelectorAll('strong').forEach((strong) => {
                const container = strong.closest('button, [role="button"]')
                    || strong.parentElement?.parentElement
                    || strong.parentElement;
                if (container) {
                    legendCandidates.add(container);
                }
            });

            const fallbackCandidates = new Set();
            chartCard.querySelectorAll('button, [role="button"]').forEach((element) => fallbackCandidates.add(element));
            chartCard.querySelectorAll('img *').forEach((element) => fallbackCandidates.add(element));

            const candidates = legendCandidates.size > 0
                ? [...legendCandidates]
                : [...fallbackCandidates];
            const seen = new Set();
            const entries = [];

            const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();

            const parseEntry = (element) => {
                const textContent = normalize(
                    element.getAttribute('title') ||
                    element.getAttribute('aria-label') ||
                    element.innerText ||
                    element.textContent
                );
                const strongLabel = normalize(element.querySelector('strong')?.textContent);
                const currencyMatches = textContent.match(/₹[\d,]+(?:\.\d{2})?/g) || [];
                const percentageMatches = textContent.match(/(\d+(?:\.\d+)?)%/g) || [];

                if (currencyMatches.length !== 1 || percentageMatches.length !== 1) {
                    return null;
                }

                const tooltip = normalize(
                    element.getAttribute('title') ||
                    element.getAttribute('aria-label') ||
                    element.innerText ||
                    element.textContent
                );

                const amountMatch = tooltip.match(/₹[\d,]+(?:\.\d{2})?/);
                const percentageMatch = tooltip.match(/(\d+(?:\.\d+)?)%/);

                let label = strongLabel;
                if (!label && amountMatch) {
                    label = normalize(
                        tooltip
                            .slice(0, amountMatch.index)
                            .replace(/[(:•-]+$/, '')
                    );
                }

                if (!label || !amountMatch || !percentageMatch || label.length > 50) {
                    return null;
                }

                return {
                    label,
                    amount: amountMatch[0],
                    percentage: `${percentageMatch[1]}%`,
                    tooltip,
                    height: ''
                };
            };

            for (const element of candidates) {
                const entry = parseEntry(element);
                if (!entry) continue;

                const key = `${entry.label.toLowerCase()}|${entry.amount}|${entry.percentage}`;
                if (seen.has(key)) continue;
                seen.add(key);
                entries.push(entry);
            }

            return entries;
        });
    }

    async getFirstVisibleChartTooltip() {
        const chartItems = await this.getBarChartData();
        return chartItems[0]?.tooltip || '';
    }

    async getVisibleChartTitleAttributes() {
        const chartItems = await this.getBarChartData();
        return chartItems.map((item) => item.tooltip).filter(Boolean);
    }

    async getPieOrChartSegmentsCount() {
        const chartItems = await this.getBarChartData();
        return chartItems.length;
    }

    async waitForTotalToBe(expectedTotal) {
        await expect.poll(async () => {
            const total = await this.getChartTotal();
            return Number(total.toFixed(2));
        }, {
            timeout: 15000,
            message: `Wait for dashboard total to become ${expectedTotal}`
        }).toBe(Number(expectedTotal.toFixed(2)));
    }

    async getBreakdownRowByName(name) {
        const rows = await this.getBreakdownRowsData();
        return rows.find((row) => row.name.toLowerCase() === name.toLowerCase()) || null;
    }

    async assertDashboardLayoutIsStable() {
        await expect(this.insightsPanel).toBeVisible();
        await expect(this.insightsHeader).toBeVisible();
        await expect(this.insightsBody).toBeVisible();
        await expect(this.chartCard).toBeVisible();
        await expect(this.breakdownCard).toBeVisible();

        const layout = await this.insightsPanel.evaluate((panel) => {
            const header = panel.querySelector('.insights-header');
            const activeTab = panel.querySelector('[role="tab"][aria-selected="true"]');
            const chartCard = panel.querySelector('.insights-chart-card');
            const breakdownCard = panel.querySelector('.insights-breakdown-card');
            const tabs = panel.querySelector('.insights-tabs');

            const isVisible = (element) => {
                if (!element) return false;
                const rect = element.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            };

            return {
                headerVisible: isVisible(header),
                tabVisible: isVisible(activeTab),
                tabsVisible: isVisible(tabs),
                chartVisible: isVisible(chartCard),
                breakdownVisible: isVisible(breakdownCard)
            };
        });

        await this.expectToBe(layout.headerVisible, true, 'Dashboard header is visible');
        await this.expectToBe(layout.tabVisible, true, 'Active dashboard tab is visible');
        await this.expectToBe(layout.tabsVisible, true, 'Dashboard tabs are visible');
        await this.expectToBe(layout.chartVisible, true, 'Dashboard chart is visible');
        await this.expectToBe(layout.breakdownVisible, true, 'Dashboard breakdown is visible');
    }

    parseCurrency(value) {
        return parseFloat((value || '').replace(/[^\d.-]/g, '')) || 0;
    }

    parsePercentage(value) {
        return parseFloat((value || '').replace(/[^\d.-]/g, '')) || 0;
    }
}

module.exports = DashboardPage;
