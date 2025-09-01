# CoinGecko API URL 配置修正報告

## 問題概述

### 發現時間
2025年9月1日 13:00

### 問題描述
CoinGecko API 請求失敗，出現 HTTP 400 錯誤，錯誤訊息指出 API URL 配置不正確：
- 使用 Demo API key 時錯誤地連接到 `pro-api.coingecko.com`
- 應該使用 `api.coingecko.com` 作為 Demo plan 的端點

### 錯誤訊息
```
CoinGecko API Error Response (400): {
  "timestamp":"2025-09-01T13:07:05.880+00:00",
  "error_code":10011,
  "status":{
    "error_message":"If you are using Demo API key, please change your root URL from pro-api.coingecko.com to api.coingecko.com Please refer here for more details: https://docs.coingecko.com/v3.0.1/reference/introduction"
  }
}
```

### 影響範圍
- 所有加密貨幣搜尋功能無法正常運作
- 加密貨幣價格查詢失敗
- 用戶無法搜尋和添加加密貨幣到監控清單

## 根本原因分析

### 技術原因
1. **API 端點配置錯誤**: 程式碼中的邏輯錯誤地判斷 API key 類型
2. **CoinGecko API 層級混淆**: 
   - Demo plan (Public API users) 必須使用 `api.coingecko.com`
   - Pro plan (付費用戶) 才能使用 `pro-api.coingecko.com`
3. **Rate limiting 設定不當**: 原本的設定不符合 Demo plan 的限制

### 程式碼問題
```typescript
// 錯誤的邏輯
const isProKey = this.apiKey && this.apiKey.startsWith('CG-') && this.apiKey.length > 20;
this.baseUrl = isProKey 
  ? 'https://pro-api.coingecko.com/api/v3'  // 錯誤使用 Pro URL
  : 'https://api.coingecko.com/api/v3';
```

## 解決方案

### 修正策略
1. **強制使用標準 API URL**: 所有 Demo plan 用戶統一使用 `api.coingecko.com`
2. **優化 Rate Limiting**: 調整請求間隔符合 Demo plan 限制
3. **更新日誌和狀態顯示**: 正確標示 API 層級

### 具體修正內容

#### 1. API URL 修正
```typescript
// 修正後的邏輯
constructor() {
  this.apiKey = process.env.COINGECKO_API_KEY;
  
  // According to CoinGecko docs:
  // - Demo plan (Public API users) must use api.coingecko.com
  // - Only paid Pro subscribers should use pro-api.coingecko.com
  // Since we're using Demo plan, always use the standard API URL
  this.baseUrl = 'https://api.coingecko.com/api/v3';
}
```

#### 2. Rate Limiting 優化
```typescript
// 從 2000ms 調整為 1200ms，符合 50 calls/minute 限制
private readonly rateLimitDelay = 1200; // 1.2 seconds between requests for Demo plan
```

#### 3. 狀態顯示修正
```typescript
// 正確顯示 Demo tier
const tier = this.apiKey ? 'Demo' : 'Free';
console.log(`CoinGecko Client initialized with ${tier} tier, URL: ${this.baseUrl}`);
```

## 測試結果

### 修正前
- ❌ 所有 CoinGecko API 請求失敗
- ❌ HTTP 400 錯誤持續出現
- ❌ 加密貨幣搜尋功能完全無法使用

### 修正後
- ✅ API 請求成功
- ✅ 正確顯示 Demo tier 狀態
- ✅ Rate limiting 正常運作
- ✅ 加密貨幣搜尋功能恢復正常

## 預防措施

### 1. 文件化 API 配置
- 在 README 中明確說明不同 API key 類型的配置方式
- 建立 API key 類型檢查機制

### 2. 環境變數驗證
- 添加啟動時的 API 配置驗證
- 提供清晰的錯誤訊息指導用戶正確配置

### 3. 監控和日誌
- 改善 API 錯誤處理和日誌記錄
- 添加 API 狀態健康檢查

## 相關文件

### 官方參考
- [CoinGecko API 文件](https://docs.coingecko.com/v3.0.1/reference/introduction)
- [CoinGecko Authentication 說明](https://docs.coingecko.com/reference/authentication)

### 修改檔案
- `src/services/coingecko.ts`: 主要修正檔案
- `.env.local`: API key 配置檔案

## 總結

這次修正解決了 CoinGecko API 配置錯誤的問題，確保 Demo plan 用戶能夠正常使用加密貨幣相關功能。修正過程中學到了 CoinGecko API 不同層級的正確配置方式，並優化了 rate limiting 機制。

### 關鍵學習點
1. **API 層級區分**: Demo 和 Pro plan 使用不同的端點 URL
2. **錯誤訊息重要性**: CoinGecko 提供了明確的錯誤指導
3. **Rate limiting 策略**: 不同 plan 有不同的請求限制

這次修正確保了系統的穩定性和用戶體驗的改善。