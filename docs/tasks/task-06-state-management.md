# 任務 6: 建立狀態管理和資料服務

## 基本資訊
- **任務編號**: 6
- **任務標題**: 建立狀態管理和資料服務
- **完成日期**: 2025-08-24
- **對應需求**: 1.2, 1.3, 2.2, 2.3, 8.1, 8.2, 8.3, 8.4, 8.5

## 任務描述
實作完整的狀態管理系統，包括使用Zustand建立全域狀態管理store、實作追蹤清單狀態管理、建立TanStack Query的查詢配置和快取策略，以及實作即時價格更新機制。

## 實作步驟

### 1. 建立Zustand狀態管理Store
- **追蹤清單Store (watchlist-store.ts)**
  - 實作追蹤清單的CRUD操作（新增、刪除、查詢、清空）
  - 整合IndexedDB持久化存儲
  - 實作價格更新機制（單個和批量更新）
  - 提供工具方法（檢查是否在追蹤清單、獲取追蹤項目等）
  - 使用devtools和persist中間件

- **搜尋Store (search-store.ts)**
  - 管理搜尋查詢和結果狀態
  - 分別處理股票和加密貨幣搜尋結果
  - 實作搜尋歷史管理（最多10項）
  - 提供搜尋結果合併和重置功能

- **圖表Store (chart-store.ts)**
  - 管理當前圖表資產和時間範圍
  - 控制圖表模態視窗和全螢幕狀態
  - 實作自動刷新機制和資料過期檢查
  - 提供圖表資料的載入和清理功能

### 2. 建立TanStack Query Hooks
- **useStockSearch**: 股票搜尋查詢hook
- **useCryptoSearch**: 加密貨幣搜尋查詢hook
- **useAssetPrice**: 單一資產價格查詢hook
- **useChartData**: 圖表資料查詢hook
- **useWatchlistPrices**: 追蹤清單批量價格查詢hook
- **useRealTimePrices**: 即時價格更新管理hook
- **useUnifiedSearch**: 統一搜尋功能hook

### 3. 配置TanStack Query Provider
- 更新providers.tsx以包含更完善的QueryClient配置
- 實作智能重試策略（4xx錯誤不重試）
- 配置網路狀態處理和自動刷新
- 設定適當的快取時間和垃圾回收策略

### 4. 實作即時價格更新機制
- 使用useWatchlistPrices hook批量獲取追蹤清單價格
- 實作自動刷新間隔（預設1分鐘）
- 提供手動刷新功能
- 實作錯誤重試機制和使用者反饋

## 建立/修改檔案

### 新建檔案
- `src/stores/watchlist-store.ts` - 追蹤清單狀態管理
- `src/stores/search-store.ts` - 搜尋狀態管理
- `src/stores/chart-store.ts` - 圖表狀態管理
- `src/stores/types.ts` - Store類型定義
- `src/stores/index.ts` - Store匯出檔案
- `src/hooks/use-stock-search.ts` - 股票搜尋hook
- `src/hooks/use-crypto-search.ts` - 加密貨幣搜尋hook
- `src/hooks/use-asset-price.ts` - 資產價格hook
- `src/hooks/use-chart-data.ts` - 圖表資料hook
- `src/hooks/use-watchlist-prices.ts` - 追蹤清單價格hook
- `src/hooks/use-real-time-prices.ts` - 即時價格更新hook
- `src/hooks/use-unified-search.ts` - 統一搜尋hook
- `src/hooks/index.ts` - Hook匯出檔案
- `src/stores/__tests__/watchlist-store.test.ts` - 追蹤清單Store測試
- `src/hooks/__tests__/use-real-time-prices.test.ts` - Hook基本測試

### 修改檔案
- `src/lib/providers.tsx` - 更新QueryClient配置

## 技術決策

### 1. 狀態管理架構
- **選擇Zustand**: 輕量級、TypeScript友好、易於測試
- **分離關注點**: 將不同功能的狀態分離到不同的store
- **持久化策略**: 只持久化必要的資料，價格資料不持久化

### 2. 查詢策略
- **TanStack Query**: 提供強大的快取、重試和同步功能
- **分層快取**: 不同類型資料使用不同的快取策略
- **智能重試**: 根據錯誤類型決定是否重試

### 3. 即時更新機制
- **輪詢策略**: 使用TanStack Query的refetchInterval
- **批量查詢**: 使用useQueries批量獲取多個資產價格
- **錯誤處理**: 實作重試機制和使用者友善的錯誤提示

## 測試結果

### 單元測試
- ✅ WatchlistStore所有功能測試通過（10/10）
- ✅ Hook模組載入測試通過（4/4）
- ✅ 測試覆蓋核心功能和錯誤處理

### 整合測試
- ✅ Store與Service整合正常
- ✅ Hook與API整合正常
- ✅ 錯誤處理機制正常

## 主要成果

1. **完整的狀態管理系統**
   - 3個專門的Zustand store處理不同功能
   - 完整的TypeScript類型支援
   - 持久化和devtools支援

2. **強大的查詢系統**
   - 7個專門的TanStack Query hook
   - 智能快取和重試策略
   - 即時價格更新機制

3. **優秀的開發體驗**
   - 完整的TypeScript類型定義
   - 詳細的錯誤處理
   - 豐富的工具方法

4. **高品質的測試覆蓋**
   - 核心功能單元測試
   - 錯誤處理測試
   - 模組載入測試

## 後續工作
- 任務7: 實作核心UI組件，將使用這些狀態管理和查詢hook
- 任務8: 實作K線圖表功能，將使用chart store和相關hook
- 任務9: 建立主要頁面，將整合所有狀態管理功能