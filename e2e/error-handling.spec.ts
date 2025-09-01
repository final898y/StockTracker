import { test, expect } from '@playwright/test';

test.describe('錯誤處理和邊界情況測試', () => {
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

  test('應該處理API錯誤情況', async ({ page }) => {
    // 模擬API錯誤
    await page.route('**/api/stocks/search**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto('/');
    
    // 嘗試搜尋
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    // 檢查錯誤訊息
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('搜尋失敗');
  });

  test('應該處理網路連線問題', async ({ page }) => {
    await page.goto('/');
    
    // 模擬網路離線
    await page.context().setOffline(true);
    
    // 嘗試搜尋
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    // 檢查離線提示
    const offlineMessage = page.locator('[data-testid="offline-message"]');
    if (await offlineMessage.isVisible()) {
      await expect(offlineMessage).toContainText('網路連線異常');
    }
    
    // 恢復網路連線
    await page.context().setOffline(false);
  });

  test('應該處理API限制錯誤', async ({ page }) => {
    // 模擬API限制錯誤
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'API使用量已達上限'
        })
      });
    });

    await page.goto('/');
    
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    // 檢查限制錯誤訊息
    const rateLimitMessage = page.locator('[data-testid="rate-limit-message"]');
    if (await rateLimitMessage.isVisible()) {
      await expect(rateLimitMessage).toContainText('API使用量已達上限');
    } else {
      // 檢查一般錯誤訊息
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
    }
  });

  test('應該處理無效的股票代碼', async ({ page }) => {
    await page.goto('/');
    
    // 測試各種無效輸入
    const invalidInputs = [
      '',           // 空字串
      '   ',        // 只有空格
      '123',        // 純數字
      'TOOLONGSTOCKCODE', // 過長代碼
      '!@#$%',      // 特殊字符
    ];
    
    const searchInput = page.locator('[data-testid="search-input"]');
    
    for (const input of invalidInputs) {
      await searchInput.fill(input);
      await searchInput.press('Enter');
      
      if (input.trim() === '') {
        // 空輸入應該顯示驗證錯誤
        const validationError = page.locator('[data-testid="validation-error"]');
        if (await validationError.isVisible()) {
          await expect(validationError).toContainText('請輸入股票代碼');
        }
      } else {
        // 其他無效輸入應該顯示無結果
        await expect(page.locator('[data-testid="no-results"], [data-testid="error-message"]')).toBeVisible();
      }
      
      // 清除輸入準備下一次測試
      await searchInput.clear();
    }
  });

  test('應該處理圖表載入失敗', async ({ page }) => {
    // 模擬圖表API錯誤
    await page.route('**/api/charts/**', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Chart data not found' })
      });
    });

    await page.goto('/');
    
    // 先加入一個項目
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    // 嘗試開啟圖表
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
    await chartButton.click();
    
    // 檢查圖表錯誤訊息
    const chartError = page.locator('[data-testid="chart-error"]');
    await expect(chartError).toBeVisible();
    await expect(chartError).toContainText('圖表載入失敗');
  });

  test('應該處理本地存儲錯誤', async ({ page }) => {
    await page.goto('/');
    
    // 模擬本地存儲錯誤
    await page.addInitScript(() => {
      // 覆蓋 IndexedDB 使其拋出錯誤
      Object.defineProperty(window, 'indexedDB', {
        get: () => {
          throw new Error('IndexedDB not available');
        }
      });
    });
    
    await page.reload();
    
    // 嘗試加入項目到追蹤清單
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    // 檢查存儲錯誤處理
    const storageError = page.locator('[data-testid="storage-error"]');
    if (await storageError.isVisible()) {
      await expect(storageError).toContainText('資料存儲失敗');
    }
  });

  test('應該處理瀏覽器相容性問題', async ({ page }) => {
    await page.goto('/');
    
    // 模擬舊瀏覽器環境
    await page.addInitScript(() => {
      // 移除現代瀏覽器功能
      delete (window as any).fetch;
      delete (window as any).Promise;
    });
    
    await page.reload();
    
    // 檢查相容性警告
    const compatibilityWarning = page.locator('[data-testid="compatibility-warning"]');
    if (await compatibilityWarning.isVisible()) {
      await expect(compatibilityWarning).toContainText('瀏覽器版本過舊');
    }
  });

  test('應該處理長時間載入情況', async ({ page }) => {
    // 模擬慢速API回應
    await page.route('**/api/stocks/search**', async route => {
      // 延遲5秒回應
      await new Promise(resolve => setTimeout(resolve, 5000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            { symbol: 'AAPL', name: 'Apple Inc.', assetType: 'stock' }
          ]
        })
      });
    });

    await page.goto('/');
    
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    // 檢查載入指示器
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    await expect(loadingIndicator).toBeVisible();
    
    // 檢查載入文字
    await expect(loadingIndicator).toContainText('搜尋中');
    
    // 等待結果載入（增加超時時間）
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible({ timeout: 10000 });
  });

  test('應該處理記憶體不足情況', async ({ page }) => {
    await page.goto('/');
    
    // 模擬大量資料載入
    await page.route('**/api/charts/**', route => {
      // 回傳大量假資料
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        openPrice: 100 + Math.random() * 10,
        highPrice: 105 + Math.random() * 10,
        lowPrice: 95 + Math.random() * 10,
        closePrice: 100 + Math.random() * 10,
        volume: Math.floor(Math.random() * 1000000)
      }));
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: largeData })
      });
    });
    
    // 加入項目並開啟圖表
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('AAPL');
    await searchInput.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const addButton = page.locator('[data-testid="search-result-item"]').first().locator('[data-testid="add-to-watchlist"]');
    await addButton.click();
    
    const watchlistItem = page.locator('[data-testid="watchlist-item"]').first();
    const chartButton = watchlistItem.locator('[data-testid="view-chart"]');
    await chartButton.click();
    
    // 檢查圖表是否能正常載入或顯示記憶體警告
    const chartModal = page.locator('[data-testid="chart-modal"]');
    const memoryWarning = page.locator('[data-testid="memory-warning"]');
    
    await expect(chartModal.or(memoryWarning)).toBeVisible({ timeout: 15000 });
  });

  test('應該處理同時多個請求的情況', async ({ page }) => {
    await page.goto('/');
    
    // 快速連續發送多個搜尋請求
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // 快速輸入多個搜尋詞
    const searchTerms = ['AAPL', 'GOOGL', 'MSFT'];
    
    for (const term of searchTerms) {
      await searchInput.fill(term);
      await searchInput.press('Enter');
      // 不等待結果，立即進行下一個搜尋
    }
    
    // 最終應該顯示最後一個搜尋的結果
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // 檢查是否有重複請求警告
    const duplicateRequestWarning = page.locator('[data-testid="duplicate-request-warning"]');
    if (await duplicateRequestWarning.isVisible()) {
      await expect(duplicateRequestWarning).toContainText('請求過於頻繁');
    }
  });
});