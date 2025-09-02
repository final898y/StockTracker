# Task 14.2: 修復測試配置問題

## 任務概述
修復 Vitest 和 Playwright 測試配置問題，解決 mock 配置錯誤和 E2E 測試環境問題。

## 問題分析

### 1. Vitest Mock 配置錯誤
**問題**: Mock 變數在初始化前被存取
```
ReferenceError: Cannot access 'mockCreateChart' before initialization
```
**影響檔案**:
- `src/components/charts/__tests__/CandlestickChart.test.tsx`
- `src/components/charts/__tests__/ChartModal.test.tsx`

### 2. Playwright 配置衝突
**問題**: test.describe() 無法正確呼叫
```
Error: Playwright Test did not expect test.describe() to be called here
```
**影響**: 所有 E2E 測試檔案無法執行

### 3. 測試超時問題
**問題**: CoinGecko API 測試超時
```
Test timed out in 5000ms
```
**影響**: API 錯誤處理測試失敗

## 修復計劃

### 步驟 1: 修復 Vitest Mock 配置

#### 1.1 修正 Mock 變數提升
使用 `vi.hoisted()` 確保 mock 變數正確提升：

```typescript
// 修復前
const mockCreateChart = vi.fn();
vi.mock('lightweight-charts', () => ({
  createChart: mockCreateChart
}));

// 修復後
const { mockCreateChart } = vi.hoisted(() => ({
  mockCreateChart: vi.fn()
}));
vi.mock('lightweight-charts', () => ({
  createChart: mockCreateChart
}));
```

#### 1.2 修正受影響的測試檔案
- CandlestickChart.test.tsx
- ChartModal.test.tsx

### 步驟 2: 修復 Playwright 配置

#### 2.1 檢查版本衝突
檢查是否有多個 @playwright/test 版本：
```bash
npm ls @playwright/test
```

#### 2.2 修正配置檔案
檢查並修正 `playwright.config.ts`：
- 確保正確的測試目錄配置
- 檢查 baseURL 設定
- 驗證瀏覽器配置

#### 2.3 修正 E2E 測試檔案
確保測試檔案正確導入和使用 Playwright API

### 步驟 3: 修復 API 測試超時

#### 3.1 修正 Mock Fetch 配置
修正 `response.text()` 方法的 mock：

```typescript
// 修復前
mockFetch.mockResolvedValue({
  ok: false,
  status: 429,
  text: vi.fn() // 錯誤：應該是實際函數
});

// 修復後
mockFetch.mockResolvedValue({
  ok: false,
  status: 429,
  text: vi.fn().mockResolvedValue('Rate limit exceeded')
});
```

#### 3.2 調整測試超時設定
在需要的測試中增加超時時間或優化測試邏輯

### 步驟 4: 優化測試環境配置

#### 4.1 更新 Vitest 配置
檢查 `vitest.config.ts` 設定：
- 測試環境配置
- Mock 配置
- 超時設定

#### 4.2 更新 Playwright 配置
檢查 `playwright.config.ts` 設定：
- 測試超時配置
- 重試機制
- 並行執行設定

## 實作細節

### Mock 配置修復模式
```typescript
// 標準 mock 配置模式
const mocks = vi.hoisted(() => ({
  mockFunction: vi.fn(),
  mockValue: 'test-value'
}));

vi.mock('module-name', () => ({
  namedExport: mocks.mockFunction,
  default: mocks.mockValue
}));
```

### Playwright 測試結構
```typescript
// 標準 E2E 測試結構
import { test, expect } from '@playwright/test';

test.describe('功能測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('測試案例', async ({ page }) => {
    // 測試邏輯
  });
});
```

## 驗證標準

### Vitest 驗證
- [ ] 所有 mock 配置正確
- [ ] 無 "before initialization" 錯誤
- [ ] Chart 相關測試通過

### Playwright 驗證
- [ ] E2E 測試檔案可以載入
- [ ] test.describe() 正常運作
- [ ] 基本測試可以執行

### API 測試驗證
- [ ] CoinGecko 測試不再超時
- [ ] Mock fetch 正確運作
- [ ] 錯誤處理測試通過

## 修復檔案清單

### Vitest 相關
- `src/components/charts/__tests__/CandlestickChart.test.tsx`
- `src/components/charts/__tests__/ChartModal.test.tsx`
- `src/services/__tests__/coingecko.test.ts`

### Playwright 相關
- `playwright.config.ts`
- `e2e/basic-functionality.spec.ts`
- `e2e/chart-functionality.spec.ts`
- `e2e/error-handling.spec.ts`
- `e2e/responsive-design.spec.ts`
- `e2e/search-and-watchlist.spec.ts`
- `e2e/user-flows.spec.ts`

### 配置檔案
- `vitest.config.ts`
- `package.json` (檢查依賴版本)

## 風險評估

### 高風險
- Playwright 版本衝突可能需要重新安裝
- Mock 配置變更可能影響其他測試

### 中風險
- 測試超時調整可能影響 CI/CD 效能
- 配置變更可能需要重新設定開發環境

### 緩解措施
- 備份現有配置
- 分步驟驗證修復
- 保持測試隔離性

## 時程安排

### Day 1
- 修復 Vitest mock 配置
- 解決 Chart 測試問題
- 修復 API 測試超時

### Day 2
- 診斷 Playwright 配置問題
- 修復版本衝突
- 更新測試配置

### Day 3
- 驗證所有配置修復
- 執行完整測試套件
- 優化測試效能

## 成功指標

### 量化指標
- Chart 測試通過 (2個檔案)
- API 測試不再超時
- E2E 測試可以啟動

### 質化指標
- 測試執行穩定
- 無配置相關錯誤
- 開發體驗改善

## 後續任務
完成後進入 Task 14.3: 修復單元測試邏輯問題