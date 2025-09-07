import { test, expect } from '@playwright/test';
import { SearchPage } from './pom/Search.page';
import { WatchlistPage } from './pom/Watchlist.page';
import { TEST_CONFIG } from './config/test-config';

test.describe('搜尋和追蹤清單功能 (Refactored)', () => {
  let searchPage: SearchPage;
  let watchlistPage: WatchlistPage;

  test.beforeEach(async ({ page }) => {
    // 清除本地存儲確保測試環境乾淨
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      if ('indexedDB' in window) {
        indexedDB.deleteDatabase('stock-tracker-db');
      }
    });
    await page.reload();

    searchPage = new SearchPage(page);
    watchlistPage = new WatchlistPage(page);
    await searchPage.goto();
    await page.screenshot({ path: 'test-results/screenshot-before-search-input-fail.png' });
    await expect(searchPage.searchInput).toBeVisible({ timeout: 10000 });
  });

  test('應該能夠搜尋美股並加入追蹤清單', async () => {
    const stock = TEST_CONFIG.testAssets.stocks[0]; // AAPL

    await searchPage.search(stock.symbol, 'stock');
    await searchPage.addFirstResultToWatchlist();

    await expect(await searchPage.getSuccessMessage()).toContain(TEST_CONFIG.successMessages.addedToWatchlist);
    await watchlistPage.verifyItemInWatchlist(stock.symbol);
  });

  test('應該能夠搜尋加密貨幣並加入追蹤清單', async () => {
    const crypto = TEST_CONFIG.testAssets.crypto[0]; // BTC

    await searchPage.search(crypto.symbol, 'crypto');
    await searchPage.addFirstResultToWatchlist();

    await expect(await searchPage.getSuccessMessage()).toContain(TEST_CONFIG.successMessages.addedToWatchlist);
    await watchlistPage.verifyItemInWatchlist(crypto.symbol);
  });

  test('應該能夠從追蹤清單移除項目', async () => {
    const stock = TEST_CONFIG.testAssets.stocks[0]; // AAPL
    
    // Setup: Add an item to the watchlist
    await searchPage.search(stock.symbol, 'stock');
    await searchPage.addFirstResultToWatchlist();
    await watchlistPage.verifyItemInWatchlist(stock.symbol);

    // Test: Remove the item
    await watchlistPage.removeWatchlistItem(stock.symbol);

    await expect(await watchlistPage.getSuccessMessage()).toContain(TEST_CONFIG.successMessages.removedFromWatchlist);
    await watchlistPage.verifyItemInWatchlist(stock.symbol, false);
    await watchlistPage.verifyWatchlistIsEmpty();
  });

  test('應該顯示空狀態當追蹤清單為空時', async () => {
    await watchlistPage.verifyWatchlistIsEmpty();
  });

  test('應該處理無效的搜尋結果', async () => {
    const invalidSymbol = TEST_CONFIG.testAssets.invalid[0];
    await searchPage.search(invalidSymbol, 'stock');

    await expect(searchPage.noResults).toBeVisible();
    await expect(searchPage.noResults).toContainText(TEST_CONFIG.errorMessages.noResults);
  });
});
