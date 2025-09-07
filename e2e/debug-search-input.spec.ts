import { test, expect } from '@playwright/test';
import { SearchPage } from './pom/Search.page';
import { WatchlistPage } from './pom/Watchlist.page';
import { TEST_CONFIG } from './config/test-config';

test.describe('偵錯搜尋輸入框可見性', () => {
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
    await searchPage.gotoSearchTab(); // Add this line
    await page.screenshot({ path: 'test-results/debug-search-input-fail.png' });
    await expect(searchPage.searchInput).toBeVisible({ timeout: 10000 });
  });

  test('搜尋輸入框應該可見', async () => {
    // 如果 beforeEach 通過，這個測試也會通過
    // 這裡不需要額外的斷言，因為 beforeEach 已經包含了關鍵檢查
  });
});
