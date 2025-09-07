import { test, expect } from '@playwright/test';
import { SearchPage } from './pom/Search.page';
import { WatchlistPage } from './pom/Watchlist.page';
import { ChartModal } from './pom/Chart.modal';
import { TEST_CONFIG } from './config/test-config';

test.describe('錯誤處理和邊界情況 (Refactored)', () => {
  let searchPage: SearchPage;
  let watchlistPage: WatchlistPage;
  const stock = TEST_CONFIG.testAssets.stocks[0];

  test.beforeEach(async ({ page }) => {
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
  });

  test('搜尋時API錯誤，應顯示錯誤訊息', async ({ page }) => {
    await page.route(`**${TEST_CONFIG.apiEndpoints.stockSearch}**`, route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await searchPage.search(stock.symbol);
    await expect(await searchPage.getErrorMessage()).toContain(TEST_CONFIG.errorMessages.searchFailed);
  });

  test('重複加入已存在的項目，應顯示錯誤訊息', async () => {
    // 第一次加入
    await searchPage.search(stock.symbol);
    await searchPage.addFirstResultToWatchlist();
    await expect(await searchPage.getSuccessMessage()).toContain(TEST_CONFIG.successMessages.addedToWatchlist);

    // 第二次重複加入
    await searchPage.addFirstResultToWatchlist();
    await expect(await searchPage.getErrorMessage()).toContain(TEST_CONFIG.errorMessages.alreadyExists);
  });

  test('圖表API錯誤，應在模態視窗中顯示錯誤', async ({ page }) => {
    const chartModal = new ChartModal(page);
    // Setup: add item to watchlist
    await searchPage.search(stock.symbol);
    await searchPage.addFirstResultToWatchlist();
    await watchlistPage.verifyItemInWatchlist(stock.symbol);

    // Mock API error for chart data
    await page.route(`**${TEST_CONFIG.apiEndpoints.chartData}**`, route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await watchlistPage.openChart(stock.symbol);
    const chartError = page.locator(TEST_CONFIG.selectors.chartError);
    await expect(chartError).toBeVisible();
    await expect(chartError).toContainText(TEST_CONFIG.errorMessages.chartLoadFailed);
  });

  test('網路離線時，應顯示網路錯誤訊息', async ({ context }) => {
    await context.setOffline(true);
    try {
      await searchPage.search(stock.symbol);
      // Depending on implementation, this might throw or show a UI error.
      const offlineError = searchPage.page.locator('[data-testid="offline-message"]');
      await expect(offlineError.or(searchPage.errorMessage)).toBeVisible();
    } catch (error) {
      // Catch network errors thrown by Playwright
      expect(String(error)).toContain('net::ERR_INTERNET_DISCONNECTED');
    }
    await context.setOffline(false);
  });
});
