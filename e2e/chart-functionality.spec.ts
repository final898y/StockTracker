import { test, expect } from '@playwright/test';

test.describe('K線圖表功能', () => {
  test.beforeEach(async ({ page }) => {
    // 清除本地存儲
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      if ('indexedDB' in window) {
        indexedDB.deleteDatabase('stock-tracker-db');
      }
    });
    await page.reload();
  });

  test('應該能夠開啟股票的K線圖表', async ({ page }) => {
    await page.goto('/');
    
    // 先加入一個股票到追蹤清單
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    // 等待追蹤清單項目出現
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    await expect(watchlistItem).toBeVisible();
    
    // 點擊查看圖表按鈕
    const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
    await chartButton.click();
    
    // 檢查圖表模態視窗是否開啟
    const chartModal = page.locator('[data-testid="chart-modal"]');
    await expect(chartModal).toBeVisible();
    
    // 檢查圖表容器是否存在
    const chartContainer = page.locator('[data-testid="chart-container"]');
    await expect(chartContainer).toBeVisible();
    
    // 檢查圖表標題
    const chartTitle = page.locator('[data-testid="chart-title"]');
    await expect(chartTitle).toContainText('AAPL');
  });

  test('應該能夠切換不同的時間範圍', async ({ page }) => {
    await page.goto('/');
    
    // 準備測試環境 - 加入股票並開啟圖表
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
    await chartButton.click();
    
    const chartModal = page.locator('[data-testid="chart-modal"]');
    await expect(chartModal).toBeVisible();
    
    // 測試時間範圍選擇器
    const timeRangeSelector = page.locator('[data-testid="time-range-selector"]');
    await expect(timeRangeSelector).toBeVisible();
    
    // 測試不同時間範圍
    const timeRanges = ['1D', '1W', '1M', '3M', '1Y'];
    
    for (const range of timeRanges) {
      const rangeButton = page.locator(`[data-testid="time-range-${range}"]`);
      await rangeButton.click();
      
      // 檢查按鈕是否被選中
      await expect(rangeButton).toHaveClass(/active|selected/);
      
      // 等待圖表更新
      await page.waitForTimeout(1000);
      
      // 檢查圖表容器仍然可見
      await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
    }
  });

  test('應該能夠關閉圖表模態視窗', async ({ page }) => {
    await page.goto('/');
    
    // 準備測試環境
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
    await chartButton.click();
    
    const chartModal = page.locator('[data-testid="chart-modal"]');
    await expect(chartModal).toBeVisible();
    
    // 測試關閉按鈕
    const closeButton = page.locator('[data-testid="close-chart"]');
    await closeButton.click();
    
    // 檢查模態視窗是否關閉
    await expect(chartModal).not.toBeVisible();
  });

  test('應該能夠使用ESC鍵關閉圖表', async ({ page }) => {
    await page.goto('/');
    
    // 準備測試環境
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
    await chartButton.click();
    
    const chartModal = page.locator('[data-testid="chart-modal"]');
    await expect(chartModal).toBeVisible();
    
    // 按ESC鍵關閉
    await page.keyboard.press('Escape');
    
    // 檢查模態視窗是否關閉
    await expect(chartModal).not.toBeVisible();
  });

  test('應該顯示圖表載入狀態', async ({ page }) => {
    await page.goto('/');
    
    // 準備測試環境
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
    await chartButton.click();
    
    // 檢查載入指示器
    const loadingIndicator = page.locator('[data-testid="chart-loading"]');
    await expect(loadingIndicator).toBeVisible();
  });

  test('應該處理圖表載入錯誤', async ({ page }) => {
    await page.goto('/');
    
    // 模擬網路錯誤情況
    await page.route('**/api/charts/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // 準備測試環境
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
    await chartButton.click();
    
    // 檢查錯誤訊息
    const errorMessage = page.locator('[data-testid="chart-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('圖表載入失敗');
  });

  test('應該支援全螢幕模式', async ({ page }) => {
    await page.goto('/');
    
    // 準備測試環境
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
    await chartButton.click();
    
    const chartModal = page.locator('[data-testid="chart-modal"]');
    await expect(chartModal).toBeVisible();
    
    // 點擊全螢幕按鈕
    const fullscreenButton = page.locator('[data-testid="fullscreen-chart"]');
    await fullscreenButton.click();
    
    // 檢查全螢幕模式
    await expect(chartModal).toHaveClass(/fullscreen/);
  });
});