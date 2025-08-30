# 專案測試與建置分析報告

## 執行時間
- 日期：2025-08-30
- 測試工具：Vitest
- 建置工具：Next.js 15.4.6

## 測試結果概覽
- **總測試數**：168 個測試
- **通過測試**：156 個 (92.9%)
- **失敗測試**：12 個 (7.1%)
- **測試檔案**：16 個檔案，其中 3 個檔案有失敗測試

## 建置結果
- **狀態**：✅ 建置成功
- **警告**：3 個警告訊息
- **錯誤**：1 個伺服器端 IndexedDB 錯誤

---

## 失敗測試詳細分析

### 1. Alpha Vantage 服務測試 (5個失敗)
**檔案**：`src/services/__tests__/alpha-vantage.test.ts`

#### 失敗測試：
1. **searchStocks 成功測試**
   - 問題：期望 `exchange: "US"`，實際回傳 `exchange: "NASDAQ"`
   - 原因：測試期望值與實際 API 回應格式不符

2. **API 錯誤處理測試**
   - 問題：期望拋出錯誤，但實際回傳成功結果
   - 原因：錯誤處理 mock 設定不正確

3. **速率限制錯誤測試**
   - 問題：同上，期望拋出錯誤但回傳成功
   - 原因：錯誤處理 mock 設定不正確

4. **getStockDetails 成功測試**
   - 問題：多個欄位值不符（price, change, name, exchange 等）
   - 原因：測試期望值與實際 API 回應不符

5. **getChartData 成功測試**
   - 問題：期望 2 筆資料，實際回傳 30 筆
   - 原因：測試期望值設定錯誤

### 2. Watchlist Store 測試 (4個失敗)
**檔案**：`src/stores/__tests__/watchlist-store.test.ts`

#### 失敗測試：
1. **addToWatchlist 成功測試**
   - 錯誤：`watchlistService.addAsset is not a function`
   - 原因：watchlistService 缺少 addAsset 方法

2. **addToWatchlist 錯誤處理測試**
   - 錯誤：同上，addAsset 方法不存在
   - 原因：方法缺失導致測試無法執行

3. **removeFromWatchlist 成功測試**
   - 錯誤：`watchlistService.removeAsset is not a function`
   - 原因：watchlistService 缺少 removeAsset 方法

4. **loadWatchlist 測試**
   - 錯誤：`expected "spy" to be called at least once`
   - 原因：mock 設定不正確，方法未被調用

### 3. CandlestickChart 組件測試 (3個失敗)
**檔案**：`src/components/charts/__tests__/CandlestickChart.test.tsx`

#### 失敗測試：
1. **渲染測試**
2. **自定義尺寸測試**
3. **自定義 className 測試**

**共同錯誤**：`chart.subscribeCrosshairMove is not a function`
- 原因：LightweightCharts mock 不完整，缺少 subscribeCrosshairMove 方法

---

## 建置問題分析

### 1. 伺服器端錯誤
**錯誤**：`ReferenceError: indexedDB is not defined`
- **位置**：`.next/server/chunks/559.js`
- **原因**：IndexedDB 只在瀏覽器環境中可用，伺服器端渲染時會出錯
- **影響**：雖然建置成功，但可能影響 SSR 功能

### 2. 警告訊息
1. **圖片優化警告** (2個)
   - 檔案：`SearchBar.tsx`, `SearchResults.tsx`
   - 建議：使用 Next.js `<Image />` 組件

2. **React Hooks 警告** (1個)
   - 檔案：`use-real-time-prices.ts`
   - 問題：useEffect 清理函數中的 ref 值可能已變更

---

## 其他觀察

### 1. API 金鑰警告
- Alpha Vantage API 金鑰未在環境變數中找到
- 影響：API 測試使用 mock 資料

### 2. 外部 API 錯誤
- CoinGecko API 回傳 500 錯誤和速率限制錯誤
- 影響：部分測試依賴外部 API 回應

### 3. 測試覆蓋率
- 整體測試通過率：92.9%
- 主要問題集中在服務層和組件 mock 設定

---

## 建議修復優先級

### 高優先級 (影響功能)
1. **IndexedDB 伺服器端相容性**
2. **WatchlistService 方法缺失**
3. **CandlestickChart mock 設定**

### 中優先級 (測試穩定性)
4. **Alpha Vantage 測試期望值修正**
5. **錯誤處理測試 mock 設定**

### 低優先級 (程式碼品質)
6. **圖片組件優化**
7. **React Hooks 依賴項修正**

---

## 下一步行動計劃
詳見：`修復執行計劃文檔`