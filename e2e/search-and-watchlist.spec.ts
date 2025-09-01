import { test, expect } from '@playwright/test';

test.describe('搜尋和追蹤清單功能', () => {
  test.beforeEach(async ({ page }) => {
    // 清除本地存儲確保測試環境乾淨
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      // 清除 IndexedDB
      if ('indexedDB' in window) {
        indexedDB.deleteDatabase('stock-tracker-db');
      }
    });
    await page.reload();
  });

  test('應該能夠搜尋美股並加入追蹤清單', async ({ page }) => {
    await page.goto('/');
    
    // 等待頁面載入完成
    await expect(page.locator('h1')).toContainText('股票追蹤');
    
    // 測試搜尋功能
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
    
    // 搜尋 Apple 股票
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    // 等待搜尋結果出現
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // 檢查搜尋結果包含 AAPL
    const searchResults = page.locator('[data-testid="search-result-item"]');
    await expect(searchResults.first()).toContainText('AAPL');
    
    // 點擊加入追蹤清單按鈕
    const addButton = searchResults.first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    // 驗證成功訊息
    await expect(page.locator('[data-testid="success-message"]')).toContainText('已加入追蹤清單');
    
    // 檢查追蹤清單中是否出現 AAPL
    const watchlistTable = page.locator('[data-testid="watchlist-table"]');
    await expect(watchlistTable).toBeVisible();
    await expect(watchlistTable.locator('[data-testid="watchlist-item"]')).toContainText('AAPL');
  });

  test('應該能夠搜尋加密貨幣並加入追蹤清單', async ({ page }) => {
    await page.goto('/');
    
    // 切換到加密貨幣搜尋
    const cryptoTab = page.locator('[data-testid="crypto-tab"]');
    await cryptoTab.click();
    
    // 搜尋比特幣
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('BTC');
    await searchInput.press('Enter');
    
    // 等待搜尋結果
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // 檢查搜尋結果
    const searchResults = page.locator('[data-testid="search-result-item"]');
    await expect(searchResults.first()).toContainText('BTC');
    
    // 加入追蹤清單
    const addButton = searchResults.first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    // 驗證加入成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText('已加入追蹤清單');
    
    // 檢查追蹤清單
    const watchlistTable = page.locator('[data-testid="watchlist-table"]');
    await expect(watchlistTable.locator('[data-testid="watchlist-item"]')).toContainText('BTC');
  });

  test('應該能夠從追蹤清單移除項目', async ({ page }) => {
    await page.goto('/');
    
    // 先加入一個項目到追蹤清單
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    // 等待項目出現在追蹤清單中
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    await expect(watchlistItem).toBeVisible();
    
    // 點擊移除按鈕
    const removeButton = watchlistItem.locator('[data-testid="remove-from-watchlist"]');
    await removeButton.click();
    
    // 確認移除對話框
    const confirmButton = page.locator('[data-testid="confirm-remove"]');
    await confirmButton.click();
    
    // 驗證項目已被移除
    await expect(page.locator('[data-testid="success-message"]')).toContainText('已從追蹤清單移除');
    await expect(page.locator('[data-testid="watchlist-item"]')).toHaveCount(0);
  });

  test('應該顯示空狀態當追蹤清單為空時', async ({ page }) => {
    await page.goto('/');
    
    // 檢查空狀態顯示
    const emptyState = page.locator('[data-testid="empty-watchlist"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('尚未加入任何追蹤項目');
  });

  test('應該處理搜尋錯誤情況', async ({ page }) => {
    await page.goto('/');
    
    // 搜尋不存在的股票代碼
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('INVALIDSTOCK123');
    await searchInput.press('Enter');
    
    // 檢查錯誤訊息或無結果狀態
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-results"]')).toContainText('找不到相關結果');
  });

  test('應該顯示載入狀態', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    
    // 檢查載入指示器
    await searchInput.press('Enter');
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
  });
});