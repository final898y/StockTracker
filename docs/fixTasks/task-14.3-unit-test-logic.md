# Task 14.3: 修復單元測試邏輯問題

## 任務概述
修復單元測試中的邏輯錯誤，包括時間計算不一致、API 測試邏輯問題和測試斷言錯誤。

## 問題分析

### 1. 圖表資料測試邏輯錯誤

#### 1.1 時間範圍計算不一致
**檔案**: `src/services/__tests__/chart-data.test.ts`
**錯誤**: 
```
expected { days: 32, interval: 'daily' } to deeply equal { days: 30, interval: 'daily' }
```
**問題**: 1M 時間範圍計算邏輯不一致

#### 1.2 API 呼叫參數錯誤
**錯誤**:
```
expected "spy" to be called with arguments: [ 'bitcoin', 7 ]
Received: [ "bitcoin", 8 ]
```
**問題**: 天數計算邏輯與預期不符

### 2. CoinGecko API 測試問題

#### 2.1 Mock Response 配置錯誤
**問題**: `response.text is not a function`
**原因**: Mock fetch response 缺少正確的 text() 方法實作

#### 2.2 重試邏輯測試超時
**問題**: 錯誤處理和重試測試超時
**原因**: 測試邏輯過於複雜，重試機制導致測試時間過長

## 修復計劃

### 步驟 1: 修復圖表資料測試

#### 1.1 統一時間範圍計算邏輯
修正 `ChartDataClient` 中的時間範圍配置：

```typescript
// 修復前 - 不一致的計算
getTimeframeConfig(timeframe: string) {
  switch (timeframe) {
    case '1M': return { days: 32, interval: 'daily' }; // 錯誤
  }
}

// 修復後 - 統一計算
getTimeframeConfig(timeframe: string) {
  switch (timeframe) {
    case '1M': return { days: 30, interval: 'daily' }; // 正確
  }
}
```

#### 1.2 修正 API 呼叫參數
確保測試預期與實際實作一致：

```typescript
// 修復測試預期
expect(mockCoinGeckoClient.getChartData).toHaveBeenCalledWith('bitcoin', 8);
// 或修正實作邏輯使其返回 7
```

### 步驟 2: 修復 CoinGecko API 測試

#### 2.1 修正 Mock Fetch Response
提供完整的 Response 物件 mock：

```typescript
// 修復前
mockFetch.mockResolvedValue({
  ok: false,
  status: 429,
  text: vi.fn() // 不完整
});

// 修復後
mockFetch.mockResolvedValue({
  ok: false,
  status: 429,
  text: vi.fn().mockResolvedValue('Rate limit exceeded'),
  json: vi.fn().mockResolvedValue({ error: 'Rate limit' })
});
```

#### 2.2 簡化重試邏輯測試
優化測試邏輯，避免實際重試延遲：

```typescript
// 修復前 - 實際重試
it('should handle rate limit errors', async () => {
  // 會實際等待重試延遲
});

// 修復後 - Mock 時間
it('should handle rate limit errors', async () => {
  vi.useFakeTimers();
  // 測試邏輯
  vi.runAllTimers();
  vi.useRealTimers();
});
```

### 步驟 3: 修復其他邏輯問題

#### 3.1 環境變數處理
改善 API 金鑰缺失的處理：

```typescript
// 在測試環境中設定 mock 值
beforeAll(() => {
  process.env.ALPHA_VANTAGE_API_KEY = 'test-key';
});
```

#### 3.2 測試隔離性
確保測試之間不會互相影響：

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});
```

## 實作細節

### 時間計算標準化
建立統一的時間計算工具：

```typescript
// src/utils/time-calculations.ts
export const TIME_RANGES = {
  '1D': { days: 1, interval: 'hourly' },
  '1W': { days: 7, interval: 'hourly' },
  '1M': { days: 30, interval: 'daily' },
  '3M': { days: 90, interval: 'daily' },
  '1Y': { days: 365, interval: 'daily' }
} as const;
```

### Mock Response 標準模式
建立標準的 API mock 模式：

```typescript
// src/test-utils/api-mocks.ts
export const createMockResponse = (data: any, options: ResponseInit = {}) => ({
  ok: options.status ? options.status < 400 : true,
  status: options.status || 200,
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  json: vi.fn().mockResolvedValue(data),
  ...options
});
```

## 修復檔案清單

### 主要邏輯檔案
- `src/services/chart-data.ts`
- `src/services/coingecko.ts`
- `src/utils/time-calculations.ts` (新建)

### 測試檔案
- `src/services/__tests__/chart-data.test.ts`
- `src/services/__tests__/coingecko.test.ts`

### 測試工具
- `src/test-utils/api-mocks.ts` (新建)
- `src/test-utils/time-mocks.ts` (新建)

## 驗證標準

### 功能驗證
- [ ] 時間範圍計算一致性
- [ ] API 呼叫參數正確
- [ ] 錯誤處理邏輯正確

### 測試驗證
- [ ] ChartDataClient 測試通過 (2個失敗測試)
- [ ] CoinGecko 測試通過 (2個超時測試)
- [ ] 無測試超時問題

### 效能驗證
- [ ] 測試執行時間合理
- [ ] 無不必要的實際延遲
- [ ] Mock 配置高效

## 風險評估

### 高風險
- 時間計算邏輯變更可能影響實際功能
- API 測試修復可能掩蓋真實問題

### 中風險
- Mock 配置變更可能影響其他測試
- 測試邏輯簡化可能降低覆蓋率

### 緩解措施
- 保持實際邏輯與測試邏輯一致
- 增加整合測試驗證
- 詳細記錄變更原因

## 時程安排

### Day 1
- 修復時間計算邏輯
- 統一時間範圍配置
- 修復 ChartDataClient 測試

### Day 2
- 修復 CoinGecko API 測試
- 改善 Mock 配置
- 優化測試效能

### Day 3
- 建立測試工具函數
- 驗證所有修復
- 執行回歸測試

## 成功指標

### 量化指標
- 修復 4+ 個失敗測試
- 測試執行時間減少 50%
- 無測試超時問題

### 質化指標
- 測試邏輯更清晰
- Mock 配置更標準
- 測試維護性提升

## 後續任務
完成後進入 Task 14.4: 修復 E2E 測試問題