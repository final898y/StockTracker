# Task 14.1: 修復缺失模組

## 任務概述
修復測試中發現的缺失模組，包括主題上下文、統一搜尋 hook 和相關依賴。

## 問題分析

### 1. 主題上下文模組缺失
- **檔案**: `@/contexts/theme-context`
- **錯誤**: Cannot find module '@/contexts/theme-context'
- **影響**: 15個 ThemeToggle 測試失敗

### 2. 統一搜尋 Hook 缺失
- **檔案**: `@/hooks/use-unified-search`
- **錯誤**: Cannot find module '@/hooks/use-unified-search'
- **影響**: 18個 SearchBar 測試失敗

### 3. 追蹤清單相關模組
- **檔案**: `@/stores/watchlist-store`, `@/hooks/use-watchlist-prices`
- **影響**: 22個 WatchlistManager 測試失敗

## 修復計劃

### 步驟 1: 創建主題上下文
創建 `src/contexts/theme-context.tsx` 提供主題管理功能

**功能需求**:
- 支援 light, dark, system 三種主題
- 提供 `useThemeToggle` hook
- 主題狀態持久化
- 系統主題偵測

### 步驟 2: 創建統一搜尋 Hook
創建 `src/hooks/use-unified-search.ts` 整合搜尋功能

**功能需求**:
- 整合股票和加密貨幣搜尋
- 搜尋歷史管理
- 載入狀態管理
- 錯誤處理
- 防抖搜尋

### 步驟 3: 檢查追蹤清單模組
確保追蹤清單相關模組完整性

**檢查項目**:
- `@/stores/watchlist-store` 路徑正確性
- `@/hooks/use-watchlist-prices` 存在性
- 相關類型定義完整性

### 步驟 4: 更新相關組件
確保組件正確使用新創建的模組

**更新項目**:
- ThemeToggle 組件
- SearchBar 組件
- WatchlistManager 組件

## 實作細節

### 主題上下文實作
```typescript
// src/contexts/theme-context.tsx
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setLightTheme: () => void;
  setDarkTheme: () => void;
  setSystemTheme: () => void;
  toggleTheme: () => void;
}
```

### 統一搜尋 Hook 實作
```typescript
// src/hooks/use-unified-search.ts
interface UnifiedSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResults;
  isLoading: boolean;
  error: string | null;
  searchHistory: string[];
  clearHistory: () => void;
}
```

## 驗證標準

### 功能驗證
- [ ] 主題切換正常運作
- [ ] 搜尋功能整合完成
- [ ] 追蹤清單管理正常

### 測試驗證
- [ ] ThemeToggle 測試通過 (15個)
- [ ] SearchBar 測試通過 (18個)
- [ ] WatchlistManager 測試通過 (22個)

### 整合驗證
- [ ] 應用程式正常啟動
- [ ] 無 TypeScript 錯誤
- [ ] 無 console 錯誤

## 風險評估

### 高風險
- 新模組可能與現有架構不相容
- 主題系統可能影響全域樣式

### 中風險
- 搜尋整合可能影響效能
- 狀態管理可能產生衝突

### 緩解措施
- 分步驟實作和測試
- 保持向後相容性
- 充分的單元測試覆蓋

## 時程安排

### Day 1
- 創建主題上下文
- 實作基本主題功能
- 修復 ThemeToggle 測試

### Day 2
- 創建統一搜尋 Hook
- 整合搜尋功能
- 修復 SearchBar 測試

### Day 3
- 檢查追蹤清單模組
- 修復相關測試
- 整合驗證

## 成功指標

### 量化指標
- 修復 55+ 個失敗測試
- 測試通過率提升 12.5%
- 無新增 TypeScript 錯誤

### 質化指標
- 代碼架構更清晰
- 組件職責更明確
- 開發體驗改善

## 後續任務
完成後進入 Task 14.2: 修復測試配置問題