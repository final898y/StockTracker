import { test, expect } from '@playwright/test';
import { SearchPage } from './pom/Search.page';
import { WatchlistPage } from './pom/Watchlist.page';
import { ChartModal } from './pom/Chart.modal';
import { TEST_CONFIG } from './config/test-config';

test.describe('K線圖表功能 (Refactored)', () => {
  let searchPage: SearchPage;
  let watchlistPage: WatchlistPage;
  let chartModal: ChartModal;
  const stock = TEST_CONFIG.testAssets.stocks[0]; // AAPL

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

    // Mock API calls to avoid rate limits and ensure consistent test data
    await page.route('**/api/stocks/search*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          bestMatches: [
            {
              "1. symbol": stock.symbol,
              "2. name": stock.name,
              "3. type": "Equity",
              "4. region": "United States",
              "5. marketOpen": "09:30",
              "6. marketClose": "16:00",
              "7. timezone": "UTC-05",
              "8. currency": "USD",
              "9. matchScore": "1.0000"
            }
          ]
        })
      });
    });

    // Init POMs
    searchPage = new SearchPage(page);
    watchlistPage = new WatchlistPage(page);
    chartModal = new ChartModal(page);

    // Setup: Add a stock to the watchlist
    await searchPage.goto();
    await searchPage.gotoSearchTab();
    await searchPage.search(stock.symbol, 'stock');
    await searchPage.addFirstResultToWatchlist();
    await watchlistPage.verifyItemInWatchlist(stock.symbol);
  });

  test('應該能夠開啟和關閉股票的K線圖表', async () => {
    await watchlistPage.openChart(stock.symbol);
    await chartModal.isVisible();
    await chartModal.verifyTitle(stock.symbol);

    await chartModal.close();
    await chartModal.isNotVisible();
  });

  test('應該能夠使用ESC鍵關閉圖表', async ({ page }) => {
    await watchlistPage.openChart(stock.symbol);
    await chartModal.isVisible();

    await page.keyboard.press('Escape');
    await chartModal.isNotVisible();
  });

  test('應該能夠切換不同的時間範圍', async () => {
    await watchlistPage.openChart(stock.symbol);
    await chartModal.isVisible();

    for (const range of TEST_CONFIG.timeRanges) {
      await chartModal.changeTimeRange(range);
      // A robust test would check if the chart data actually updated.
      // For now, we just check if the button is active and chart is visible.
      await chartModal.isVisible(); 
    }
  });

  test('應該在API錯誤時顯示圖表載入失敗訊息', async ({ page }) => {
    await page.route(`**${TEST_CONFIG.apiEndpoints.chartData}**`, route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await watchlistPage.openChart(stock.symbol);
    const errorLocator = page.locator(TEST_CONFIG.selectors.chartError);
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toContainText(TEST_CONFIG.errorMessages.chartLoadFailed);
  });
});
