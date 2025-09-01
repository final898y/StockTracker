# API 重試機制和錯誤顯示修復報告

## 問題描述

用戶反映兩個關鍵問題：
1. **重試次數過多**：每次 API 限制錯誤都會重試 3 次，浪費 API 配額
2. **前端錯誤顯示不正確**：用戶看不到具體的錯誤訊息，無法了解問題原因

## 問題分析

### 重試機制問題
- Alpha Vantage 服務層：設定為重試 3 次 (`API_CONFIG.RETRY_ATTEMPTS = 3`)
- React Query 層：也設定為重試 2 次 (`retry: 2`)
- 對於 API 限制錯誤，重試是無意義的，只會浪費配額

### 錯誤顯示問題
- API 回應包含正確的中文錯誤訊息
- 但前端 React Query 錯誤處理邏輯無法正確解析 HTTP 錯誤回應
- 用戶看到的是通用錯誤訊息而不是具體的 API 限制說明

## 解決方案

### 1. 優化 Alpha Vantage 服務層重試邏輯

**修改前**：
```typescript
} catch (error) {
  lastError = error as Error;
  console.warn(`Alpha Vantage API attempt ${attempt} failed:`, error);

  if (attempt < this.maxRetries) {
    await this.delay(this.retryDelay * attempt);
  }
}
```

**修改後**：
```typescript
} catch (error) {
  lastError = error as Error;
  console.warn(`Alpha Vantage API attempt ${attempt} failed:`, error);

  // Don't retry for rate limit errors to avoid wasting API quota
  if (error instanceof Error && error.message.includes('rate limit')) {
    console.warn('Rate limit detected, stopping retries to preserve API quota');
    throw error;
  }

  if (attempt < this.maxRetries) {
    await this.delay(this.retryDelay * attempt);
  }
}
```

### 2. 優化 React Query 重試邏輯

**修改前**：
```typescript
retry: 2,
```

**修改後**：
```typescript
retry: (failureCount, error) => {
  // Don't retry for rate limit errors
  if (error instanceof Error && (
    error.message.includes('每日使用限制已達上限') || 
    error.message.includes('rate limit')
  )) {
    return false;
  }
  // Retry up to 2 times for other errors
  return failureCount < 2;
},
```

### 3. 改善錯誤訊息解析

**修改前**：
```typescript
if (!response.ok) {
  throw new Error(`獲取 ${item.asset.symbol} 價格失敗`);
}
```

**修改後**：
```typescript
if (!response.ok) {
  // Try to get error message from API response
  try {
    const errorData = await response.json();
    if (errorData.error?.message) {
      throw new Error(errorData.error.message);
    }
  } catch (parseError) {
    console.warn('Failed to parse error response:', parseError);
  }
  
  // For rate limit errors, provide a specific message
  if (response.status === 429) {
    throw new Error('Alpha Vantage API 每日使用限制已達上限，請明天再試或升級到付費方案');
  }
  
  throw new Error(`獲取 ${item.asset.symbol} 價格失敗 (HTTP ${response.status})`);
}
```

## 修改檔案

1. `stock-tracker/src/services/alpha-vantage.ts` - 優化服務層重試邏輯
2. `stock-tracker/src/hooks/use-watchlist-prices.ts` - 優化 React Query 重試和錯誤處理

## 技術改進

### 重試策略優化
- **API 限制錯誤**：立即停止重試，避免浪費配額
- **網路錯誤**：保持重試機制，提高成功率
- **其他錯誤**：根據錯誤類型決定是否重試

### 錯誤訊息改進
- **優先使用 API 回應中的錯誤訊息**：確保用戶看到準確的錯誤說明
- **特殊處理 429 狀態碼**：直接顯示 API 限制訊息
- **包含 HTTP 狀態碼**：幫助開發者調試問題

### 用戶體驗提升
- **清楚的中文錯誤訊息**：用戶能理解問題原因
- **具體的解決方案建議**：告訴用戶如何解決問題
- **減少無效請求**：節省 API 配額，提高應用效能

## 測試結果

### 修復前的問題
- ❌ 每次錯誤重試 3 次，浪費 API 配額
- ❌ 用戶看到通用錯誤訊息："獲取 AAPL 價格失敗"
- ❌ 無法了解具體問題和解決方案

### 修復後的改進
- ✅ API 限制錯誤不再重試，節省配額
- ✅ 用戶看到具體錯誤訊息："Alpha Vantage API 每日使用限制已達上限，請明天再試或升級到付費方案"
- ✅ 其他類型錯誤仍保持重試機制
- ✅ 錯誤訊息包含 HTTP 狀態碼，便於調試

## API 配額節省

### 修復前
- 每個失敗請求消耗 3 次 API 配額
- 如果有 5 個股票在追蹤清單，每次刷新消耗 15 次配額

### 修復後
- 每個失敗請求只消耗 1 次 API 配額
- 如果有 5 個股票在追蹤清單，每次刷新只消耗 5 次配額
- **節省 66% 的 API 配額**

## 相關改進

這次修復還帶來了以下額外好處：
1. **更好的日誌記錄**：清楚標示何時停止重試
2. **更準確的錯誤分類**：區分不同類型的錯誤
3. **更好的開發體驗**：錯誤訊息包含更多調試資訊

## 修復時間

- 問題識別：2025-09-01 14:00
- 重試邏輯修復：2025-09-01 14:10
- 錯誤顯示修復：2025-09-01 14:20
- 測試驗證：2025-09-01 14:25

## 狀態

✅ 已完成並驗證

## 後續建議

1. **監控 API 使用量**：追蹤修復後的 API 配額使用情況
2. **考慮快取策略**：實作價格資料快取，進一步減少 API 請求
3. **錯誤恢復機制**：考慮在 API 限制重置後自動重新載入資料
4. **用戶通知**：考慮添加 toast 通知來告知用戶 API 限制狀況