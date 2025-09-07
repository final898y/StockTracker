import { type Page, type Locator, expect } from '@playwright/test';
import { TEST_CONFIG } from '../config/test-config';

export class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly themeToggle: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator(TEST_CONFIG.selectors.header);
    this.themeToggle = page.locator(TEST_CONFIG.selectors.themeToggle);
    this.successMessage = page.locator(TEST_CONFIG.selectors.successMessage);
    this.errorMessage = page.locator(TEST_CONFIG.selectors.errorMessage);
    this.loadingIndicator = page.locator(TEST_CONFIG.selectors.loadingIndicator);
  }

  async goto() {
    await this.page.goto(TEST_CONFIG.environment.baseUrl);
  }

  async waitForLoadingComplete() {
    await expect(this.loadingIndicator).not.toBeVisible({ timeout: TEST_CONFIG.timeouts.long });
  }

  async getSuccessMessage(): Promise<string | null> {
    await expect(this.successMessage).toBeVisible();
    return this.successMessage.textContent();
  }

  async getErrorMessage(): Promise<string | null> {
    await expect(this.errorMessage).toBeVisible();
    return this.errorMessage.textContent();
  }
}
