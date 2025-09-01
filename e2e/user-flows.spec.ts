import { test, expect } from '@playwright/test';

test.describe('完整使用者流程測試', () => {
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
  });

  test('完整的股票追蹤流程：搜尋 → 加入 → 查看圖表 → 移除', async ({ page }) => {
    await page.goto('/');
    
    // 步驟1: 搜尋股票
    console.log('步驟1: 搜尋 Apple 股票');
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    // 等待搜尋結果
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const searchResults = page.locator('[data-testid="search-result-item"]');
    await expect(searchResults.first()).toContainText('AAPL');
    
    // 步驟2: 加入追蹤清單
    console.log('步驟2: 加入到追蹤清單');
    const addButton = searchResults.first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    // 驗證成功訊息
    await expect(page.locator('[data-testid="success-message"]')).toContainText('已加入追蹤清單');
    
    // 驗證項目出現在追蹤清單中
    const watchlistTable = page.locator('[data-testid="watchlist-table"]');
    await expect(watchlistTable).toBeVisible();
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    await expect(watchlistItem).toContainText('AAPL');
    
    // 步驟3: 查看K線圖表
    console.log('步驟3: 開啟K線圖表');
    const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
    await chartButton.click();
    
    // 驗證圖表模態視窗開啟
    const chartModal = page.locator('[data-testid="chart-modal"]');
    await expect(chartModal).toBeVisible();
    
    // 驗證圖表內容
    const chartContainer = page.locator('[data-testid="chart-container"]');
    await expect(chartContainer).toBeVisible();
    
    const chartTitle = page.locator('[data-testid="chart-title"]');
    await expect(chartTitle).toContainText('AAPL');
    
    // 測試時間範圍切換
    console.log('步驟3.1: 測試時間範圍切換');
    const timeRangeSelector = page.locator('[data-testid="time-range-selector"]');
    await expect(timeRangeSelector).toBeVisible();
    
    const weekButton = page.locator('[data-testid="time-range-1W"]');
    await weekButton.click();
    await expect(weekButton).toHaveClass(/active|selected/);
    
    // 關閉圖表
    console.log('步驟3.2: 關閉圖表');
    const closeButton = page.locator('[data-testid="close-chart"]');
    await closeButton.click();
    await expect(chartModal).not.toBeVisible();
    
    // 步驟4: 移除追蹤項目
    console.log('步驟4: 從追蹤清單移除');
    const removeButton = watchlistItem.locator('[data-testid="remove-from-watchlist"]');
    await removeButton.click();
    
    // 確認移除
    const confirmButton = page.locator('[data-testid="confirm-remove"]');
    await confirmButton.click();
    
    // 驗證移除成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText('已從追蹤清單移除');
    await expect(page.locator('[data-testid="watchlist-item"]')).toHaveCount(0);
    
    // 驗證空狀態顯示
    const emptyState = page.locator('[data-testid="empty-watchlist"]');
    await expect(emptyState).toBeVisible();
    
    console.log('✓ 完整股票追蹤流程測試通過');
  });

  test('完整的加密貨幣追蹤流程', async ({ page }) => {
    await page.goto('/');
    
    // 步驟1: 切換到加密貨幣搜尋
    console.log('步驟1: 切換到加密貨幣搜尋');
    const cryptoTab = page.locator('[data-testid="crypto-tab"]');
    await cryptoTab.click();
    
    // 步驟2: 搜尋比特幣
    console.log('步驟2: 搜尋比特幣');
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('BTC');
    await searchInput.press('Enter');
    
    // 等待搜尋結果
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const searchResults = page.locator('[data-testid="search-result-item"]');
    await expect(searchResults.first()).toContainText('BTC');
    
    // 步驟3: 加入追蹤清單
    console.log('步驟3: 加入到追蹤清單');
    const addButton = searchResults.first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    // 驗證成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText('已加入追蹤清單');
    
    // 步驟4: 驗證追蹤清單顯示
    const watchlistTable = page.locator('[data-testid="watchlist-table"]');
    await expect(watchlistTable).toBeVisible();
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    await expect(watchlistItem).toContainText('BTC');
    
    // 步驟5: 查看圖表
    console.log('步驟5: 查看BTC圖表');
    const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
    await chartButton.click();
    
    const chartModal = page.locator('[data-testid="chart-modal"]');
    await expect(chartModal).toBeVisible();
    
    const chartTitle = page.locator('[data-testid="chart-title"]');
    await expect(chartTitle).toContainText('BTC');
    
    // 關閉圖表
    await page.keyboard.press('Escape');
    await expect(chartModal).not.toBeVisible();
    
    console.log('✓ 完整加密貨幣追蹤流程測試通過');
  });

  test('多資產管理流程：同時追蹤股票和加密貨幣', async ({ page }) => {
    await page.goto('/');
    
    // 步驟1: 加入股票
    console.log('步驟1: 加入 Apple 股票');
    let searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    let addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('已加入追蹤清單');
    
    // 步驟2: 切換到加密貨幣並加入比特幣
    console.log('步驟2: 切換到加密貨幣並加入比特幣');
    const cryptoTab = page.locator('[data-testid="crypto-tab"]');
    await cryptoTab.click();
    
    searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('BTC');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('已加入追蹤清單');
    
    // 步驟3: 驗證追蹤清單包含兩個項目
    console.log('步驟3: 驗證追蹤清單包含股票和加密貨幣');
    const watchlistItems = page.locator('[data-testid="watchlist-item"]');
    await expect(watchlistItems).toHaveCount(2);
    
    // 檢查兩個項目都存在
    await expect(page.locator('[data-testid="watchlist-table"]')).toContainText('AAPL');
    await expect(page.locator('[data-testid="watchlist-table"]')).toContainText('BTC');
    
    // 步驟4: 分別查看兩個資產的圖表
    console.log('步驟4: 查看不同資產的圖表');
    
    // 查看第一個資產的圖表
    const firstChartButton = watchlistItems.first().locator('[data-testid="view-chart"]');
    await firstChartButton.click();
    
    let chartModal = page.locator('[data-testid="chart-modal"]');
    await expect(chartModal).toBeVisible();
    
    // 關閉第一個圖表
    await page.keyboard.press('Escape');
    await expect(chartModal).not.toBeVisible();
    
    // 查看第二個資產的圖表
    const secondChartButton = watchlistItems.nth(1).locator('[data-testid="view-chart"]');
    await secondChartButton.click();
    
    chartModal = page.locator('[data-testid="chart-modal"]');
    await expect(chartModal).toBeVisible();
    
    // 關閉第二個圖表
    const closeButton = page.locator('[data-testid="close-chart"]');
    await closeButton.click();
    await expect(chartModal).not.toBeVisible();
    
    // 步驟5: 移除一個項目
    console.log('步驟5: 移除一個追蹤項目');
    const removeButton = watchlistItems.first().locator('[data-testid="remove-from-watchlist"]');
    await removeButton.click();
    
    const confirmButton = page.locator('[data-testid="confirm-remove"]');
    await confirmButton.click();
    
    // 驗證只剩一個項目
    await expect(page.locator('[data-testid="watchlist-item"]')).toHaveCount(1);
    
    console.log('✓ 多資產管理流程測試通過');
  });

  test('錯誤處理和恢復流程', async ({ page }) => {
    await page.goto('/');
    
    // 步驟1: 測試無效搜尋
    console.log('步驟1: 測試無效股票代碼搜尋');
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('INVALIDSTOCK123');
    await searchInput.press('Enter');
    
    // 檢查錯誤處理
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-results"]')).toContainText('找不到相關結果');
    
    // 步驟2: 恢復正常搜尋
    console.log('步驟2: 恢復正常搜尋');
    await searchInput.clear();
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const searchResults = page.locator('[data-testid="search-result-item"]');
    await expect(searchResults.first()).toContainText('AAPL');
    
    // 步驟3: 正常加入追蹤清單
    const addButton = searchResults.first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('已加入追蹤清單');
    
    // 步驟4: 測試重複加入
    console.log('步驟4: 測試重複加入相同項目');
    await addButton.click();
    
    // 檢查重複加入的處理
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('已存在於追蹤清單');
    }
    
    // 驗證追蹤清單仍然只有一個項目
    await expect(page.locator('[data-testid="watchlist-item"]')).toHaveCount(1);
    
    console.log('✓ 錯誤處理和恢復流程測試通過');
  });

  test('資料持久化測試：重新載入頁面後資料保持', async ({ page }) => {
    await page.goto('/');
    
    // 步驟1: 加入項目到追蹤清單
    console.log('步驟1: 加入項目到追蹤清單');
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('已加入追蹤清單');
    await expect(page.locator('[data-testid="watchlist-item"]')).toHaveCount(1);
    
    // 步驟2: 重新載入頁面
    console.log('步驟2: 重新載入頁面');
    await page.reload();
    
    // 步驟3: 驗證資料仍然存在
    console.log('步驟3: 驗證追蹤清單資料持久化');
    await expect(page.locator('[data-testid="watchlist-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="watchlist-table"]')).toContainText('AAPL');
    
    // 步驟4: 驗證功能仍然正常
    console.log('步驟4: 驗證功能仍然正常');
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
    await chartButton.click();
    
    const chartModal = page.locator('[data-testid="chart-modal"]');
    await expect(chartModal).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(chartModal).not.toBeVisible();
    
    console.log('✓ 資料持久化測試通過');
  });

  test('效能測試：快速操作不會造成問題', async ({ page }) => {
    await page.goto('/');
    
    console.log('步驟1: 快速連續搜尋測試');
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // 快速連續搜尋
    const searchTerms = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
    
    for (const term of searchTerms) {
      await searchInput.fill(term);
      await searchInput.press('Enter');
      
      // 等待搜尋結果或載入狀態
      await expect(page.locator('[data-testid="search-results"], [data-testid="loading-indicator"]')).toBeVisible();
      
      // 短暫等待避免過快操作
      await page.waitForTimeout(500);
    }
    
    // 最後一次搜尋應該顯示結果
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    console.log('步驟2: 快速加入多個項目');
    // 加入最後搜尋的結果
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('已加入追蹤清單');
    
    console.log('✓ 效能測試通過');
  });
});