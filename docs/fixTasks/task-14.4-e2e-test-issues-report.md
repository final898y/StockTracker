# Task 14.4: 修復 E2E 測試問題 - 實作報告

## 任務概述
本報告記錄了針對 `Task 14.4: 修復 E2E 測試問題` 的實作細節，主要聚焦於解決 E2E 測試中元素找不到、API 速率限制及測試邏輯優化的問題。

## 實作細節

### 1. 解決搜尋輸入框不可見問題

*   **問題描述**: 初始頁面載入時，搜尋輸入框 (`[data-testid="search-input"]`) 不可見，導致依賴搜尋功能的測試失敗。
*   **解決方案**: 發現主頁面 (`src/app/page.tsx`) 採用分頁（Watchlist / Search）顯示，搜尋輸入框僅在「搜尋資產」分頁激活時才渲染。因此，在測試中加入了切換到搜尋分頁的邏輯。
    *   **修改檔案**: `e2e/pom/Search.page.ts`, `e2e/debug-search-input.spec.ts`
    *   **具體變更**: 在 `Search.page.ts` 中新增 `gotoSearchTab()` 方法，用於點擊 `[data-testid="search-tab"]` 並等待 `[data-testid="search-section"]` 可見。在 `debug-search-input.spec.ts` 的 `beforeEach` 鉤子中調用此方法。

### 2. 補齊缺失的 `data-testid` 屬性

*   **問題描述**: 多個關鍵 UI 元素缺少 `data-testid` 屬性，導致 Playwright 無法精確定位。
*   **解決方案**: 根據 `task-14.4-e2e-test-issues.md` 中的清單，補齊了以下元素的 `data-testid`：
    *   `[data-testid="search-results"]`: 添加到 `src/components/search/SearchResults.tsx` 的主要結果容器。
    *   `[data-testid="crypto-tab"]`: 在 `src/components/search/SearchPage.tsx` 中新增了股票/加密貨幣篩選按鈕，並為其添加了 `data-testid="stock-tab"` 和 `data-testid="crypto-tab"`。
    *   `[data-testid="empty-watchlist"]`: 添加到 `src/components/watchlist/WatchlistManager.tsx` 中顯示空追蹤清單訊息的 `div`。
*   **驗證**: 確認 `[data-testid="header"]` 和 `[data-testid="search-section"]` 已存在於相關組件中。

### 3. 調整測試等待邏輯

*   **問題描述**: 由於應用程式的非 URL 變更分頁機制，原有的 `page.waitForURL()` 導致測試超時。
*   **解決方案**: 將 `e2e/pom/Search.page.ts` 中的 `page.waitForURL("**/search")` 替換為等待 `[data-testid="search-section"]` 元素可見，以確保頁面內容正確載入。

### 4. 引入 API Mocking

*   **問題描述**: 測試運行時，因頻繁調用外部 API (Alpha Vantage) 導致達到速率限制，進而影響測試穩定性。
*   **解決方案**: 在 `e2e/chart-functionality.spec.ts` 的 `beforeEach` 鉤子中引入 Playwright 的 `page.route()` 進行 API mocking，攔截對 `/api/stocks/search` 的請求並返回預設的模擬數據。這確保了測試在不受外部 API 限制的情況下穩定運行。

## 相關檔案

*   `e2e/config/test-config.ts`
*   `e2e/pom/Search.page.ts`
*   `e2e/debug-search-input.spec.ts`
*   `src/components/search/SearchPage.tsx`
*   `src/components/search/SearchResults.tsx`
*   `src/components/watchlist/WatchlistManager.tsx`
*   `e2e/chart-functionality.spec.ts`

## Git Commit 內容

```
fix(task-14.4): 修復E2E測試中元素找不到的問題

詳細說明：
- 修正搜尋輸入框在測試中不可見的問題，確保搜尋頁面正確顯示。
- 補齊多個UI元素的data-testid屬性，包括搜尋結果容器、加密貨幣篩選按鈕和空追蹤清單提示。
- 調整測試等待邏輯，以適應應用程式的非URL變更分頁機制。
- 引入API mocking，避免測試因外部API速率限制而失敗。

對應需求: 1.1, 1.2, 1.3
相關檔案:
e2e/config/test-config.ts
e2e/pom/Search.page.ts
e2e/debug-search-input.spec.ts
src/components/search/SearchPage.tsx
src/components/search/SearchResults.tsx
src/components/watchlist/WatchlistManager.tsx
e2e/chart-functionality.spec.ts

Co-authored-by: AI Assistant <ai@kiro.dev>
```

## 對應需求

*   Requirement 1: 追蹤美股 (1.1, 1.2, 1.3)
*   Requirement 4: 直觀的網頁介面 (4.1, 4.2, 4.3, 4.4, 4.5)
*   Requirement 5: 可靠的資料來源 (5.3, 5.4)
*   Requirement 8: 自動化文件 (8.1, 8.2, 8.3, 8.4, 8.5)

**完成日期**: 2025年9月7日
**任務編號**: 14.4