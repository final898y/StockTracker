import { type Page, type Locator, expect } from '@playwright/test';
import { TEST_CONFIG, getTimeRangeSelector } from '../config/test-config';
import { BasePage } from './Base.page';

export class ChartModal extends BasePage {
  readonly chartModal: Locator;
  readonly chartContainer: Locator;
  readonly chartTitle: Locator;
  readonly closeButton: Locator;
  readonly timeRangeSelector: Locator;

  constructor(page: Page) {
    super(page);
    this.chartModal = page.locator(TEST_CONFIG.selectors.chartModal);
    this.chartContainer = page.locator(TEST_CONFIG.selectors.chartContainer);
    this.chartTitle = page.locator(TEST_CONFIG.selectors.chartTitle);
    this.closeButton = page.locator(TEST_CONFIG.selectors.closeChart);
    this.timeRangeSelector = page.locator(TEST_CONFIG.selectors.timeRangeSelector);
  }

  async isVisible() {
    await expect(this.chartModal).toBeVisible();
    await expect(this.chartContainer).toBeVisible();
  }

  async isNotVisible() {
    await expect(this.chartModal).not.toBeVisible();
  }

  async close() {
    await this.closeButton.click();
  }

  async changeTimeRange(range: typeof TEST_CONFIG.timeRanges[number]) {
    const rangeButton = this.page.locator(getTimeRangeSelector(range));
    await rangeButton.click();
    await expect(rangeButton).toHaveClass(/active|selected/);
    await this.waitForLoadingComplete();
  }

  async verifyTitle(symbol: string) {
    await expect(this.chartTitle).toContainText(symbol);
  }
}
