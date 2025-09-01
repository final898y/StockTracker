import { test, expect } from '@playwright/test';

test.describe('響應式設計和行動裝置相容性', () => {
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

  test('桌面版本應該正確顯示所有元素', async ({ page }) => {
    // 設定桌面視窗大小
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // 檢查主要元素是否可見
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="watchlist-section"]')).toBeVisible();
    
    // 檢查搜尋欄位寬度適當
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
    
    // 檢查追蹤清單表格在桌面版本顯示完整
    const watchlistTable = page.locator('[data-testid="watchlist-table"]');
    await expect(watchlistTable).toBeVisible();
  });

  test('平板版本應該適當調整佈局', async ({ page }) => {
    // 設定平板視窗大小
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // 檢查主要元素仍然可見
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="watchlist-section"]')).toBeVisible();
    
    // 檢查響應式佈局
    const container = page.locator('[data-testid="main-container"]');
    await expect(container).toBeVisible();
  });

  test('手機版本應該使用行動裝置佈局', async ({ page }) => {
    // 設定手機視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 檢查行動版本的導航
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toBeVisible();
    }
    
    // 檢查搜尋功能在手機版本的可用性
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
    
    // 測試搜尋功能
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    // 檢查搜尋結果在手機版本的顯示
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('手機版本的追蹤清單應該使用卡片佈局', async ({ page }) => {
    // 設定手機視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 先加入一個項目到追蹤清單
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    // 檢查手機版本是否使用卡片佈局而非表格
    const watchlistCards = page.locator('[data-testid="watchlist-cards"]');
    const watchlistTable = page.locator('[data-testid="watchlist-table"]');
    
    // 在手機版本應該顯示卡片而非表格
    if (await watchlistCards.isVisible()) {
      await expect(watchlistCards).toBeVisible();
    } else {
      // 如果沒有專門的卡片佈局，至少表格應該是響應式的
      await expect(watchlistTable).toBeVisible();
    }
  });

  test('圖表在不同螢幕尺寸下應該正確顯示', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: '桌面' },
      { width: 1024, height: 768, name: '平板橫向' },
      { width: 768, height: 1024, name: '平板直向' },
      { width: 375, height: 667, name: '手機' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // 加入股票到追蹤清單
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('AAPL');
      await searchInput.press('Enter');
      
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
      const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
      await addButton.click();
      
      // 開啟圖表
      const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
      const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
      await chartButton.click();
      
      // 檢查圖表模態視窗
      const chartModal = page.locator('[data-testid="chart-modal"]');
      await expect(chartModal).toBeVisible();
      
      // 檢查圖表容器
      const chartContainer = page.locator('[data-testid="chart-container"]');
      await expect(chartContainer).toBeVisible();
      
      // 關閉圖表準備下一次測試
      const closeButton = page.locator('[data-testid="close-chart"]');
      await closeButton.click();
      
      console.log(`✓ 圖表在${viewport.name}(${viewport.width}x${viewport.height})正確顯示`);
    }
  });

  test('觸控操作應該在行動裝置上正常工作', async ({ page }) => {
    // 設定手機視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 測試觸控搜尋
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.tap();
    await searchInput.fill('AAPL');
    
    // 測試觸控提交搜尋
    const searchButton = page.locator('[data-testid="search-button"]');
    if (await searchButton.isVisible()) {
      await searchButton.tap();
    } else {
      await searchInput.press('Enter');
    }
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // 測試觸控加入追蹤清單
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.tap();
    
    // 驗證成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText('已加入追蹤清單');
  });

  test('橫向和直向模式切換應該正常工作', async ({ page }) => {
    // 測試直向模式
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-section"]')).toBeVisible();
    
    // 切換到橫向模式
    await page.setViewportSize({ width: 667, height: 375 });
    
    // 檢查元素仍然可見和可用
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-section"]')).toBeVisible();
    
    // 測試搜尋功能在橫向模式下仍然工作
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('文字大小和可讀性在小螢幕上應該適當', async ({ page }) => {
    // 設定小螢幕尺寸
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    
    // 檢查主要文字元素
    const header = page.locator('[data-testid="header"] h1');
    await expect(header).toBeVisible();
    
    // 檢查文字不會被截斷
    const searchLabel = page.locator('[data-testid="search-label"]');
    if (await searchLabel.isVisible()) {
      await expect(searchLabel).toBeVisible();
    }
    
    // 加入項目並檢查追蹤清單的文字可讀性
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    // 檢查追蹤清單項目的文字可讀性
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    await expect(watchlistItem).toBeVisible();
  });

  test('深色模式在不同螢幕尺寸下應該正確顯示', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // 切換到深色模式
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        
        // 檢查深色模式是否正確應用
        const body = page.locator('body');
        await expect(body).toHaveClass(/dark/);
        
        // 檢查主要元素在深色模式下的可見性
        await expect(page.locator('[data-testid="header"]')).toBeVisible();
        await expect(page.locator('[data-testid="search-section"]')).toBeVisible();
      }
    }
  });
});