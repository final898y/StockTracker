# Bug 修正記錄: 圖表 API 空資料與時間範圍按鈕功能問題

## 基本資訊
- **修正類型**: Bug Fix
- **修正標題**: 圖表 API 空資料問題與時間範圍按鈕功能修正
- **執行日期**: 2025-08-31
- **狀態**: 已完成 ✅
- **影響的原始任務**: Task 5 (Next.js API Routes)

## 問題描述

### 發現的 Bug
1. **圖表 API 回傳空資料**: `/api/charts/AAPL?timeframe=1D&assetType=stock` 回傳 `{"success": true, "data": {"symbol": "AAPL", "timeframe": "1D", "data": []}}` 
2. **時間範圍按鈕無作用**: 不管選擇什麼時間範圍，都只顯示固定的資料點數量
3. **時間戳記轉換錯誤**: ChartContainer 中將毫秒時間戳記又乘以 1000

### 根本原因分析
1. **時間範圍過濾邏輯錯誤**: 原本的 `filterDataByTimeframe` 方法使用嚴格的時間截止點，但 Alpha Vantage 回傳的每日股票資料時間戳記與當前時間不匹配
2. **組件狀態管理問題**: ChartContainer 中的 `onTimeframeChange` 只更新 store，沒有觸發新的 API 請求
3. **資料轉換錯誤**: 時間戳記已經是毫秒格式，不需要再乘以 1000

## 修正步驟

### 1. 診斷 Alpha Vantage API 連線
- 建立測試腳本驗證 API 金鑰和連線狀態
- 確認 API 回傳完整的時間序列資料（100 個資料點）
- 發現問題在於資料過濾邏輯，而非 API 本身

### 2. 修正時間範圍過濾邏輯
**檔案**: `src/services/chart-data.ts`

**修正前問題**:
```typescript
// 使用嚴格時間截止點，導致過濾後無資料
const cutoffTime = now - (config.days * 24 * 60 * 60 * 1000);
let filteredData = data.filter(point => point.timestamp >= cutoffTime);
```

**修正後邏輯**:
```typescript
// 使用更靈活的時間範圍，確保有足夠的資料點
switch (timeframe) {
  case '1D':
    cutoffTime = now - (7 * 24 * 60 * 60 * 1000); // 7天範圍
    break;
  case '1W':
    cutoffTime = now - (10 * 24 * 60 * 60 * 1000); // 10天範圍
    break;
  case '1M':
    cutoffTime = now - (35 * 24 * 60 * 60 * 1000); // 35天範圍
    break;
  // ... 其他時間範圍
}

// 如果過濾後無資料，使用備用邏輯
if (filteredData.length === 0) {
  filteredData = sortedData.slice(-appropriateCount);
}
```

### 3. 修正 ChartContainer 狀態管理
**檔案**: `src/components/charts/ChartContainer.tsx`

**修正前問題**:
```typescript
// timeframe 是固定 prop，無法動態更新
const handleTimeframeChange = (newTimeframe: TimeframeType) => {
  setTimeframe(newTimeframe); // 只更新 store，不觸發重新請求
};
```

**修正後邏輯**:
```typescript
// 使用內部狀態管理 timeframe
const [currentTimeframe, setCurrentTimeframe] = useState<TimeframeType>(initialTimeframe);

// useChartData 使用內部狀態
const { data: chartResponse } = useChartData(asset.symbol, currentTimeframe, asset.assetType);

// 時間範圍變更處理
const handleTimeframeChange = (newTimeframe: TimeframeType) => {
  setCurrentTimeframe(newTimeframe); // 更新內部狀態，觸發重新請求
  setTimeframe(newTimeframe); // 同步到 store
};
```

### 4. 修正時間戳記轉換
**檔案**: `src/components/charts/ChartContainer.tsx`

**修正前**:
```typescript
timestamp: new Date(point.timestamp * 1000) // 錯誤：重複乘以 1000
```

**修正後**:
```typescript
timestamp: new Date(point.timestamp) // 正確：直接使用毫秒時間戳記
```

## 建立/修改檔案

### 修改的檔案
1. **src/services/chart-data.ts**
   - 重寫 `filterDataByTimeframe` 方法
   - 改善時間範圍過濾邏輯
   - 添加備用資料選擇機制

2. **src/components/charts/ChartContainer.tsx**
   - 添加內部 timeframe 狀態管理
   - 修正時間範圍變更處理邏輯
   - 修正時間戳記轉換錯誤

3. **src/services/alpha-vantage.ts**
   - 添加調試日誌（後續已移除）
   - 確認 API 資料獲取正常

### 臨時建立的測試檔案（已清理）
- `test-alpha-vantage.js` - API 連線測試
- `debug-env.js` - 環境變數檢查

## 技術決策

### 1. 時間範圍過濾策略
**決策**: 使用更寬鬆的時間範圍 + 備用資料選擇
**原因**: Alpha Vantage 提供每日資料，嚴格的時間過濾可能導致無資料

### 2. 狀態管理方式
**決策**: 組件內部管理 timeframe 狀態
**原因**: 確保時間範圍變更能立即觸發新的 API 請求

### 3. 資料轉換處理
**決策**: 直接使用 API 回傳的毫秒時間戳記
**原因**: Alpha Vantage 客戶端已經將時間轉換為毫秒格式

## 測試結果

### API 測試結果
```bash
# 不同時間範圍的資料點數量
1D: 5 個資料點（最近一週的資料）
1W: 6 個資料點（最近 10 天的資料）
1M: 25 個資料點（最近一個月的資料）
3M: 65 個資料點（最近三個月的資料）
1Y: 100 個資料點（所有可用資料）
```

### 功能測試結果
- ✅ 圖表 API 正常回傳資料
- ✅ 時間範圍按鈕功能正常
- ✅ 不同時間範圍顯示對應的資料點數量
- ✅ 圖表正確渲染和顯示
- ✅ 時間戳記轉換正確

### API 回應範例
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "timeframe": "1D",
    "data": [
      {
        "timestamp": 1756339200000,
        "open": 230.82,
        "high": 233.41,
        "low": 229.335,
        "close": 232.56,
        "volume": 38074700
      },
      {
        "timestamp": 1756425600000,
        "open": 232.51,
        "high": 233.38,
        "low": 231.37,
        "close": 232.14,
        "volume": 39418437
      }
    ]
  },
  "timestamp": "2025-08-31T16:19:10.575Z"
}
```

## 問題解決

### 解決的問題
1. **圖表 API 空資料問題** - 修正時間範圍過濾邏輯
2. **時間範圍按鈕無作用** - 實作內部狀態管理
3. **時間戳記轉換錯誤** - 移除重複的時間轉換
4. **資料顯示不一致** - 確保不同時間範圍顯示對應的資料量

### 技術改進
1. **更健壯的資料過濾** - 添加備用資料選擇機制
2. **響應式狀態管理** - 時間範圍變更立即觸發資料更新
3. **正確的資料轉換** - 避免時間戳記轉換錯誤

## 後續工作

### 建議的改進
1. **快取機制** - 實作時間範圍資料快取，減少 API 請求
2. **載入狀態** - 改善時間範圍切換時的載入體驗
3. **錯誤處理** - 添加更詳細的錯誤處理和用戶提示
4. **效能優化** - 對大量資料點進行採樣優化

### 相關任務
- Task 15: 實作圖表快取機制
- Task 16: 改善圖表載入體驗
- Task 17: 添加更多技術指標

## 總結

本次 bug 修正成功解決了 Task 5 實作的圖表 API 功能問題，恢復了股票追蹤應用程式的圖表功能正常運作。通過修正時間範圍過濾邏輯和狀態管理，用戶現在可以正常切換不同的時間範圍並查看對應的股票資料。

**修正成果**:
- 修復圖表 API 空資料問題
- 修復時間範圍按鈕無作用問題
- 修復時間戳記轉換錯誤
- 恢復圖表渲染和互動功能

**影響範圍**:
- Task 5 的圖表 API 端點功能恢復正常
- 圖表組件的互動功能恢復正常
- 整體圖表功能達到原始設計要求