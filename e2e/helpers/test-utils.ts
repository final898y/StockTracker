import { Page, expect } from '@playwright/test';

/**
 * E2E測試工具函數
 * 提供常用的測試操作和驗證方法
 */

/**
 * 清除所有本地存儲資料
 */
export async function clearAllStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    if ('indexedDB' in window) {
      indexedDB.deleteDatabase('stock-tracker-db');
    }
  });
}

/**
 * 等待頁面完全載入
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toBeVisible();
}

/**
 * 搜尋股票或加密貨幣
 */
export async function searchAsset(page: Page, symbol: string, assetType: 'stock' | 'crypto' = 'stock') {
  // 如果是加密貨幣，先切換到加密貨幣標籤
  if (assetType === 'crypto') {
    const cryptoTab = page.locator('[data-testid="crypto-tab"]');
    if (await cryptoTab.isVisible()) {
      await cryptoTab.click();
    }
  }
  
  const searchInput = page.locator('[data-testid="search-input"]');
  await expect(searchInput).toBeVisible();
  await searchInput.fill(symbol);
  await searchInput.press('Enter');
  
  // 等待搜尋結果或錯誤訊息
  await expect(page.locator('[data-testid="search-results"], [data-testid="no-results"], [data-testid="error-message"]')).toBeVisible();
}

/**
 * 加入資產到追蹤清單
 */
export async function addToWatchlist(page: Page, symbol: string) {
  await searchAsset(page, symbol);
  
  const searchResults = page.locator('[data-testid="search-result-item"]');
  await expect(searchResults.first()).toBeVisible();
  
  const addButton = searchResults.first().locator('[data-testid="add-to-watchlist"]');
  await addButton.click();
  
  // 等待成功訊息
  await expect(page.locator('[data-testid="success-message"]')).toContainText('已加入追蹤清單');
}

/**
 * 從追蹤清單移除資產
 */
export async function removeFromWatchlist(page: Page, index: number = 0) {
  const watchlistItems = page.locator('[data-testid="watchlist-item"]');
  const targetItem = watchlistItems.nth(index);
  
  const removeButton = targetItem.locator('[data-testid="remove-from-watchlist"]');
  await removeButton.click();
  
  // 確認移除
  const confirmButton = page.locator('[data-testid="confirm-remove"]');
  await confirmButton.click();
  
  // 等待成功訊息
  await expect(page.locator('[data-testid="success-message"]')).toContainText('已從追蹤清單移除');
}

/**
 * 開啟圖表模態視窗
 */
export async function openChart(page: Page, index: number = 0) {
  const watchlistItems = page.locator('[data-testid="watchlist-item"]');
  const targetItem = watchlistItems.nth(index);
  
  const chartButton = targetItem.locator('[data-testid="view-chart"]');
  await chartButton.click();
  
  // 等待圖表模態視窗開啟
  const chartModal = page.locator('[data-testid="chart-modal"]');
  await expect(chartModal).toBeVisible();
  
  return chartModal;
}

/**
 * 關閉圖表模態視窗
 */
export async function closeChart(page: Page, method: 'button' | 'escape' = 'button') {
  const chartModal = page.locator('[data-testid="chart-modal"]');
  await expect(chartModal).toBeVisible();
  
  if (method === 'escape') {
    await page.keyboard.press('Escape');
  } else {
    const closeButton = page.locator('[data-testid="close-chart"]');
    await closeButton.click();
  }
  
  await expect(chartModal).not.toBeVisible();
}

/**
 * 切換圖表時間範圍
 */
export async function changeTimeRange(page: Page, range: '1D' | '1W' | '1M' | '3M' | '1Y') {
  const rangeButton = page.locator(`[data-testid="time-range-${range}"]`);
  await rangeButton.click();
  await expect(rangeButton).toHaveClass(/active|selected/);
}

/**
 * 驗證追蹤清單包含指定資產
 */
export async function verifyWatchlistContains(page: Page, symbols: string[]) {
  const watchlistTable = page.locator('[data-testid="watchlist-table"]');
  await expect(watchlistTable).toBeVisible();
  
  for (const symbol of symbols) {
    await expect(watchlistTable).toContainText(symbol);
  }
}

/**
 * 驗證追蹤清單項目數量
 */
export async function verifyWatchlistCount(page: Page, count: number) {
  if (count === 0) {
    const emptyState = page.locator('[data-testid="empty-watchlist"]');
    await expect(emptyState).toBeVisible();
  } else {
    const watchlistItems = page.locator('[data-testid="watchlist-item"]');
    await expect(watchlistItems).toHaveCount(count);
  }
}

/**
 * 模擬API錯誤
 */
export async function mockApiError(page: Page, endpoint: string, statusCode: number = 500, errorMessage: string = 'Internal Server Error') {
  await page.route(`**${endpoint}**`, route => {
    route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({ error: errorMessage })
    });
  });
}

/**
 * 模擬網路離線
 */
export async function setOffline(page: Page, offline: boolean = true) {
  await page.context().setOffline(offline);
}

/**
 * 等待載入完成
 */
export async function waitForLoading(page: Page) {
  const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
  
  // 如果有載入指示器，等待它消失
  if (await loadingIndicator.isVisible()) {
    await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
  }
}

/**
 * 驗證錯誤訊息顯示
 */
export async function verifyErrorMessage(page: Page, expectedMessage: string) {
  const errorMessage = page.locator('[data-testid="error-message"]');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toContainText(expectedMessage);
}

/**
 * 驗證成功訊息顯示
 */
export async function verifySuccessMessage(page: Page, expectedMessage: string) {
  const successMessage = page.locator('[data-testid="success-message"]');
  await expect(successMessage).toBeVisible();
  await expect(successMessage).toContainText(expectedMessage);
}

/**
 * 設定視窗大小（響應式測試用）
 */
export async function setViewport(page: Page, device: 'desktop' | 'tablet' | 'mobile') {
  const viewports = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  };
  
  await page.setViewportSize(viewports[device]);
}

/**
 * 驗證響應式佈局
 */
export async function verifyResponsiveLayout(page: Page, device: 'desktop' | 'tablet' | 'mobile') {
  await setViewport(page, device);
  
  // 檢查主要元素可見性
  await expect(page.locator('[data-testid="header"]')).toBeVisible();
  await expect(page.locator('[data-testid="search-section"]')).toBeVisible();
  
  if (device === 'mobile') {
    // 檢查行動版本特定元素
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toBeVisible();
    }
  }
}

/**
 * 執行完整的使用者流程測試
 */
export async function performCompleteUserFlow(page: Page, symbol: string, assetType: 'stock' | 'crypto' = 'stock') {
  // 1. 搜尋資產
  await searchAsset(page, symbol, assetType);
  
  // 2. 加入追蹤清單
  const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
  await addButton.click();
  await verifySuccessMessage(page, '已加入追蹤清單');
  
  // 3. 驗證追蹤清單
  await verifyWatchlistContains(page, [symbol]);
  
  // 4. 開啟圖表
  await openChart(page);
  
  // 5. 測試時間範圍切換
  await changeTimeRange(page, '1W');
  
  // 6. 關閉圖表
  await closeChart(page);
  
  // 7. 移除追蹤項目
  await removeFromWatchlist(page);
  
  // 8. 驗證清單為空
  await verifyWatchlistCount(page, 0);
}

/**
 * 生成測試報告摘要
 */
export function generateTestSummary(testName: string, passed: boolean, duration: number, details?: string) {
  const status = passed ? '✅ 通過' : '❌ 失敗';
  const summary = `${status} ${testName} (${duration}ms)`;
  
  if (details) {
    return `${summary}\n   詳情: ${details}`;
  }
  
  return summary;
}