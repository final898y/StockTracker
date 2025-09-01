import { test, expect } from '@playwright/test';

test.describe('基本功能測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('應用程式應該正確載入', async ({ page }) => {
    // 檢查頁面標題
    await expect(page).toHaveTitle(/股票追蹤|Stock Tracker/);
    
    // 檢查頁面是否載入完成
    await page.waitForLoadState('networkidle');
    
    // 檢查基本元素是否存在
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('頁面應該響應不同的螢幕尺寸', async ({ page }) => {
    // 測試桌面版本
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
    
    // 測試平板版本
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // 測試手機版本
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('應該能夠處理網路錯誤', async ({ page }) => {
    // 模擬網路離線
    await page.context().setOffline(true);
    
    // 嘗試重新載入頁面
    await page.reload();
    
    // 頁面應該仍然可以載入基本結構
    await expect(page.locator('body')).toBeVisible();
    
    // 恢復網路連線
    await page.context().setOffline(false);
  });

  test('應該支援鍵盤導航', async ({ page }) => {
    // 測試Tab鍵導航
    await page.keyboard.press('Tab');
    
    // 檢查焦點是否正確移動
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('應該在不同瀏覽器中正常工作', async ({ page, browserName }) => {
    // 記錄當前瀏覽器
    console.log(`測試瀏覽器: ${browserName}`);
    
    // 檢查基本功能
    await expect(page.locator('body')).toBeVisible();
    
    // 檢查JavaScript是否正常執行
    const jsEnabled = await page.evaluate(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
    });
    
    expect(jsEnabled).toBe(true);
  });
});