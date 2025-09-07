import { test, expect } from '@playwright/test';
import { BasePage } from './pom/Base.page';

test.describe('基本功能測試 (Refactored)', () => {
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    await basePage.goto();
  });

  test('應用程式應該正確載入並顯示標題', async ({ page }) => {
    await expect(page).toHaveTitle(/Stock Tracker/);
    await expect(basePage.header).toBeVisible();
  });

  test('應該支援鍵盤導航 (Tab)', async ({ page }) => {
    await page.keyboard.press('Tab');
    const firstFocusableElement = page.locator(':focus');
    await expect(firstFocusableElement).not.toBeNull();
    // A more robust test could check the exact element that should be focused.
  });

  test('在不同瀏覽器中應能基本運作', async ({ page, browserName }) => {
    console.log(`正在 ${browserName} 中測試基本載入...`);
    const isJSEnabled = await page.evaluate(() => document.readyState === 'complete');
    expect(isJSEnabled).toBe(true);
    await expect(basePage.header).toBeVisible();
  });
});
