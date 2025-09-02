# Task 14.4: 修復 E2E 測試問題

## 任務概述
修復所有 E2E 測試失敗問題，包括頁面元素找不到、應用程式啟動問題和測試環境配置。

## 問題分析

### 1. 核心問題：頁面元素找不到

#### 1.1 搜尋輸入框找不到
**錯誤**: `locator('[data-testid="search-input"]') Expected: visible Received: <element(s) not found>`
**影響**: 所有需要搜尋功能的測試 (約 150+ 個測試)

#### 1.2 基本 UI 元素缺失
**錯誤**: 
- `[data-testid="header"]` 找不到
- `[data-testid="search-section"]` 找不到
- `[data-testid="crypto-tab"]` 找不到

#### 1.3 追蹤清單元素缺失
**錯誤**: `[data-testid="empty-watchlist"]` 找不到

### 2. 根本原因分析

#### 2.1 應用程式可能未正確啟動
所有瀏覽器 (chromium, firefox, webkit, mobile) 都有相同問題

#### 2.2 data-testid 屬性可能缺失
組件中可能沒有正確設定測試 ID

#### 2.3 路由或頁面渲染問題
首頁可能無法正確載入或渲染

## 修復計劃

### 步驟 1: 診斷應用程式啟動問題

#### 1.1 檢查開發伺服器
```bash
# 確保應用程式可以正常啟動
npm run dev
# 檢查 http://localhost:3000 是否正常
```

#### 1.2 檢查 Playwright 配置
驗證 `playwright.config.ts` 中的 baseURL 設定：
```typescript
export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

### 步驟 2: 檢查和添加 data-testid 屬性

#### 2.1 檢查主要組件
需要檢查的組件和對應的 testid：

**SearchBar 組件**:
```typescript
// src/components/search/SearchBar.tsx
<input 
  data-testid="search-input"
  // ... 其他屬性
/>
```

**Header 組件**:
```typescript
// src/components/layout/Header.tsx 或相關組件
<header data-testid="header">
  <h1>股票追蹤器</h1>
</header>
```

**搜尋區域**:
```typescript
// 主頁面或相關組件
<section data-testid="search-section">
  {/* 搜尋相關內容 */}
</section>
```

**加密貨幣標籤**:
```typescript
// 搜尋標籤組件
<button data-testid="crypto-tab">
  加密貨幣
</button>
```

#### 2.2 檢查追蹤清單組件
```typescript
// WatchlistManager 或相關組件
<div data-testid="empty-watchlist">
  尚未加入任何追蹤項目
</div>
```

### 步驟 3: 修復頁面結構和路由

#### 3.1 檢查主頁面結構
確保 `src/app/page.tsx` 包含所有必要元素：

```typescript
export default function HomePage() {
  return (
    <main>
      <header data-testid="header">
        <h1>股票追蹤器</h1>
      </header>
      
      <section data-testid="search-section">
        <SearchBar data-testid="search-input" />
        <div>
          <button data-testid="stock-tab">股票</button>
          <button data-testid="crypto-tab">加密貨幣</button>
        </div>
      </section>
      
      <section data-testid="watchlist-section">
        <WatchlistManager />
      </section>
    </main>
  );
}
```

#### 3.2 檢查佈局組件
確保 `src/app/layout.tsx` 正確設定：

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 步驟 4: 優化測試等待邏輯

#### 4.1 增加適當的等待
```typescript
// 等待頁面完全載入
await page.waitForLoadState('networkidle');

// 等待特定元素出現
await page.waitForSelector('[data-testid="search-input"]', { 
  state: 'visible',
  timeout: 10000 
});
```

#### 4.2 改善測試穩定性
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  
  // 確保頁面完全載入
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  
  // 等待關鍵元素出現
  await expect(page.locator('[data-testid="header"]')).toBeVisible();
});
```

### 步驟 5: 修復響應式設計測試

#### 5.1 確保行動版本元素存在
檢查響應式設計是否隱藏了某些元素：

```typescript
// 檢查元素在不同螢幕尺寸下的可見性
test('mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // 確保行動版本的搜尋輸入框存在
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
});
```

## 實作細節

### 必要的 data-testid 清單
根據測試需求，需要確保以下 testid 存在：

```typescript
// 基本佈局
'header'
'search-section'
'watchlist-section'

// 搜尋功能
'search-input'
'search-results'
'stock-tab'
'crypto-tab'
'search-label'

// 追蹤清單
'empty-watchlist'
'watchlist-table'
'watchlist-cards'

// 圖表功能
'chart-modal'
'chart-container'

// 錯誤處理
'error-message'
'loading-indicator'
```

### 測試環境設定
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  }
});
```

## 修復檔案清單

### 主要組件檔案
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/components/search/SearchBar.tsx`
- `src/components/layout/Header.tsx`
- `src/components/watchlist/WatchlistManager.tsx`

### 測試檔案
- `e2e/basic-functionality.spec.ts`
- `e2e/chart-functionality.spec.ts`
- `e2e/error-handling.spec.ts`
- `e2e/responsive-design.spec.ts`
- `e2e/search-and-watchlist.spec.ts`
- `e2e/user-flows.spec.ts`

### 配置檔案
- `playwright.config.ts`
- `next.config.ts`

## 驗證標準

### 基本功能驗證
- [ ] 應用程式正常啟動
- [ ] 主頁面正確渲染
- [ ] 所有必要元素可見

### 元素可見性驗證
- [ ] 搜尋輸入框可見
- [ ] 標題和導航可見
- [ ] 標籤切換功能正常

### 跨瀏覽器驗證
- [ ] Chromium 測試通過
- [ ] Firefox 測試通過
- [ ] WebKit 測試通過
- [ ] 行動版本測試通過

## 風險評估

### 高風險
- 大量組件可能需要添加 testid
- 頁面結構可能需要重大調整
- 應用程式架構問題可能很深層

### 中風險
- 測試超時設定可能需要調整
- 響應式設計可能影響元素可見性
- 狀態管理可能影響元素渲染

### 緩解措施
- 分階段修復，先修復基本元素
- 保持現有功能不受影響
- 建立測試元素檢查清單

## 時程安排

### Day 1
- 診斷應用程式啟動問題
- 檢查基本頁面結構
- 添加核心 data-testid

### Day 2
- 修復搜尋相關測試
- 添加追蹤清單 testid
- 修復基本功能測試

### Day 3
- 修復響應式設計測試
- 優化測試等待邏輯
- 修復使用者流程測試

### Day 4
- 修復圖表功能測試
- 修復錯誤處理測試
- 整合驗證所有修復

## 成功指標

### 量化指標
- 修復 190 個失敗的 E2E 測試
- 所有瀏覽器測試通過
- 測試執行時間合理 (< 15 分鐘)

### 質化指標
- 測試穩定性大幅提升
- 跨瀏覽器相容性確保
- 測試維護性改善

## 後續任務
完成後進入 Task 14.5: 整合測試和最終驗證