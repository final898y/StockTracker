import { type Page, type Locator, expect } from '@playwright/test';
import { TEST_CONFIG } from '../config/test-config';
import { BasePage } from './Base.page';

export class WatchlistPage extends BasePage {
  readonly watchlistTable: Locator;
  readonly watchlistCards: Locator;
  readonly emptyWatchlist: Locator;

  constructor(page: Page) {
    super(page);
    this.watchlistTable = page.locator(TEST_CONFIG.selectors.watchlistTable);
    this.watchlistCards = page.locator(TEST_CONFIG.selectors.watchlistCards);
    this.emptyWatchlist = page.locator(TEST_CONFIG.selectors.emptyWatchlist);
  }

  async getWatchlistItems() {
    return this.page.locator(TEST_CONFIG.selectors.watchlistItem);
  }

  async getWatchlistItem(symbol: string) {
    return this.page.locator(TEST_CONFIG.selectors.watchlistItem, { hasText: symbol });
  }

  async removeWatchlistItem(symbol: string) {
    const item = await this.getWatchlistItem(symbol);
    await item.locator(TEST_CONFIG.selectors.removeFromWatchlist).click();
    await this.page.locator(TEST_CONFIG.selectors.confirmRemove).click();
  }

  async openChart(symbol: string) {
    const item = await this.getWatchlistItem(symbol);
    await item.locator(TEST_CONFIG.selectors.viewChart).click();
  }

  async verifyItemInWatchlist(symbol: string, present = true) {
    const item = await this.getWatchlistItem(symbol);
    if (present) {
      await expect(item).toBeVisible();
    } else {
      await expect(item).not.toBeVisible();
    }
  }

  async verifyWatchlistIsEmpty() {
    await expect(this.emptyWatchlist).toBeVisible();
  }
}
