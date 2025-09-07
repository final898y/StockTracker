import { type Page, type Locator, expect } from '@playwright/test';
import { TEST_CONFIG } from '../config/test-config';
import { BasePage } from './Base.page';

export class SearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly stockTab: Locator;
  readonly cryptoTab: Locator;
  readonly searchResults: Locator;
  readonly noResults: Locator;
  readonly searchTab: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator(TEST_CONFIG.selectors.searchInput);
    this.searchButton = page.locator(TEST_CONFIG.selectors.searchButton);
    this.stockTab = page.locator(TEST_CONFIG.selectors.stockTab);
    this.cryptoTab = page.locator(TEST_CONFIG.selectors.cryptoTab);
    this.searchResults = page.locator(TEST_CONFIG.selectors.searchResults);
    this.noResults = page.locator(TEST_CONFIG.selectors.noResults);
    this.searchTab = page.locator(TEST_CONFIG.selectors.searchTab);
  }

  async gotoSearchTab() {
    await this.searchTab.click();
    await expect(this.page.locator(TEST_CONFIG.selectors.searchSection)).toBeVisible();
  }

  async search(symbol: string, assetType: 'stock' | 'crypto' = 'stock') {
    if (assetType === 'crypto') {
      await this.cryptoTab.click();
    }
    await this.searchInput.fill(symbol);
    await this.searchInput.press('Enter');
    await this.waitForLoadingComplete();
  }

  async getFirstSearchResult() {
    await expect(this.searchResults).toBeVisible({ timeout: TEST_CONFIG.timeouts.medium });
    return this.searchResults.locator(TEST_CONFIG.selectors.searchResultItem).first();
  }

  async addFirstResultToWatchlist() {
    const firstResult = await this.getFirstSearchResult();
    await firstResult.locator(TEST_CONFIG.selectors.addToWatchlist).click();
  }
}
