import { test, expect } from '@playwright/test';
import { SearchPage } from './pom/Search.page';
import { WatchlistPage } from './pom/Watchlist.page';
import { TEST_CONFIG } from './config/test-config';

test.describe('響應式設計 (Refactored)', () => {
  let searchPage: SearchPage;
  let watchlistPage: WatchlistPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    watchlistPage = new WatchlistPage(page);
    await searchPage.goto();
  });

  test('桌面版本佈局應該正確', async ({ page }) => {
    await page.setViewportSize(TEST_CONFIG.viewports.desktop);
    await expect(searchPage.searchInput).toBeVisible();
    await expect(watchlistPage.watchlistTable).toBeVisible();
  });

  test('平板版本佈局應該正確', async ({ page }) => {
    await page.setViewportSize(TEST_CONFIG.viewports.tablet);
    await expect(searchPage.searchInput).toBeVisible();
    // On tablet, it might be a table or cards, so we check the container
    await expect(page.locator(TEST_CONFIG.selectors.watchlistSection)).toBeVisible();
  });

  test('手機版本應該使用卡片佈局', async ({ page }) => {
    await page.setViewportSize(TEST_CONFIG.viewports.mobile);

    // Add an item to see the watchlist layout
    const stock = TEST_CONFIG.testAssets.stocks[0];
    await searchPage.search(stock.symbol);
    await searchPage.addFirstResultToWatchlist();
    await watchlistPage.verifyItemInWatchlist(stock.symbol);

    // On mobile, we expect cards to be visible
    await expect(watchlistPage.watchlistCards).toBeVisible();
    await expect(watchlistPage.watchlistTable).not.toBeVisible();
  });

  for (const [name, viewport] of Object.entries(TEST_CONFIG.viewports)) {
    test(`圖表應該在 ${name} 尺寸下正確顯示`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const stock = TEST_CONFIG.testAssets.stocks[0];
      
      // Setup
      await searchPage.search(stock.symbol);
      await searchPage.addFirstResultToWatchlist();
      await watchlistPage.verifyItemInWatchlist(stock.symbol);

      // Test
      await watchlistPage.openChart(stock.symbol);
      const chartModal = page.locator(TEST_CONFIG.selectors.chartModal);
      await expect(chartModal).toBeVisible();
    });
  }
});
