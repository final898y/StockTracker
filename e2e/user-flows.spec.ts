import { test, expect } from '@playwright/test';
import { SearchPage } from './pom/Search.page';
import { WatchlistPage } from './pom/Watchlist.page';
import { ChartModal } from './pom/Chart.modal';
import { TEST_CONFIG } from './config/test-config';

test.describe('完整使用者流程測試 (Refactored)', () => {
  let searchPage: SearchPage;
  let watchlistPage: WatchlistPage;
  let chartModal: ChartModal;

  test.beforeEach(async ({ page }) => {
    // Clean storage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      if ('indexedDB' in window) {
        indexedDB.deleteDatabase('stock-tracker-db');
      }
    });
    await page.reload();

    // Init POMs
    searchPage = new SearchPage(page);
    watchlistPage = new WatchlistPage(page);
    chartModal = new ChartModal(page);
    await searchPage.goto();
  });

  test('完整的股票追蹤流程：搜尋 → 加入 → 查看圖表 → 移除', async () => {
    const stock = TEST_CONFIG.testAssets.stocks[0]; // AAPL

    // 1. 搜尋並加入
    await searchPage.search(stock.symbol, 'stock');
    await searchPage.addFirstResultToWatchlist();
    await expect(await searchPage.getSuccessMessage()).toContain(TEST_CONFIG.successMessages.addedToWatchlist);
    await watchlistPage.verifyItemInWatchlist(stock.symbol);

    // 2. 開啟並驗證圖表
    await watchlistPage.openChart(stock.symbol);
    await chartModal.isVisible();
    await chartModal.verifyTitle(stock.symbol);
    await chartModal.changeTimeRange('1W');
    await chartModal.close();
    await chartModal.isNotVisible();

    // 3. 移除並驗證
    await watchlistPage.removeWatchlistItem(stock.symbol);
    await expect(await watchlistPage.getSuccessMessage()).toContain(TEST_CONFIG.successMessages.removedFromWatchlist);
    await watchlistPage.verifyWatchlistIsEmpty();
  });

  test('多資產管理流程：同時追蹤股票和加密貨幣', async () => {
    const stock = TEST_CONFIG.testAssets.stocks[0]; // AAPL
    const crypto = TEST_CONFIG.testAssets.crypto[0]; // BTC

    // 1. 加入股票
    await searchPage.search(stock.symbol, 'stock');
    await searchPage.addFirstResultToWatchlist();
    await watchlistPage.verifyItemInWatchlist(stock.symbol);

    // 2. 加入加密貨幣
    await searchPage.search(crypto.symbol, 'crypto');
    await searchPage.addFirstResultToWatchlist();
    await watchlistPage.verifyItemInWatchlist(crypto.symbol);

    // 3. 驗證追蹤清單
    const items = await watchlistPage.getWatchlistItems();
    await expect(items).toHaveCount(2);

    // 4. 移除其中一個
    await watchlistPage.removeWatchlistItem(stock.symbol);
    await watchlistPage.verifyItemInWatchlist(stock.symbol, false);
    const itemsAfterRemove = await watchlistPage.getWatchlistItems();
    await expect(itemsAfterRemove).toHaveCount(1);
  });

  test('資料持久化測試：重新載入頁面後資料保持', async ({ page }) => {
    const stock = TEST_CONFIG.testAssets.stocks[0]; // AAPL

    // 1. 加入項目
    await searchPage.search(stock.symbol, 'stock');
    await searchPage.addFirstResultToWatchlist();
    await watchlistPage.verifyItemInWatchlist(stock.symbol);

    // 2. 重新載入
    await page.reload();

    // 3. 驗證資料依然存在
    const reloadedWatchlistPage = new WatchlistPage(page);
    await reloadedWatchlistPage.verifyItemInWatchlist(stock.symbol);
    const items = await reloadedWatchlistPage.getWatchlistItems();
    await expect(items).toHaveCount(1);
  });
});
