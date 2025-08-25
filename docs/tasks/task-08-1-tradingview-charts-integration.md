# Task 8.1: 整合TradingView Lightweight Charts

## 基本資訊
- **任務編號**: 8.1
- **任務標題**: 整合TradingView Lightweight Charts
- **完成日期**: 2025-01-27
- **對應需求**: 3.1, 3.3, 4.2, 8.1, 8.2, 8.3, 8.4, 8.5

## 任務描述
建立基本的K線圖表組件，整合TradingView Lightweight Charts庫，實作響應式設計，為後續的圖表互動功能和彈出視窗功能奠定基礎。

## 實作步驟

### 1. 建立核心圖表組件
建立了 `CandlestickChart` 組件作為 TradingView Lightweight Charts 的 React 包裝器：

**主要功能**:
- 使用 `createChart` API 初始化圖表
- 支援自訂寬度、高度和樣式
- 實作資料格式轉換（內部格式 → TradingView 格式）
- 自動調整視圖範圍和響應式調整
- 完整的生命週期管理和清理

**技術特點**:
- 使用 `useRef` 管理圖表和系列實例
- 實作 ResizeObserver 支援響應式調整
- 支援自訂圖表配置和樣式主題

### 2. 建立響應式圖表包裝器
建立了 `ResponsiveChart` 組件提供自適應佈局：

**主要功能**:
- 根據容器寬度自動計算圖表尺寸
- 支援最小/最大高度限制
- 可配置寬高比例
- 監聽容器尺寸變化並即時調整

### 3. 建立圖表狀態組件
建立了載入和錯誤狀態的專用組件：

**ChartLoading 組件**:
- 顯示載入動畫和提示文字
- 支援自訂尺寸和樣式
- 提供一致的載入體驗

**ChartError 組件**:
- 顯示錯誤訊息和重試按鈕
- 使用 Lucide React 圖示
- 支援錯誤處理回調

### 4. 建立整合容器組件
建立了 `ChartContainer` 組件整合所有功能：

**主要功能**:
- 整合 React Query 進行資料獲取
- 同步狀態到 Zustand store
- 處理載入、錯誤和空資料狀態
- 自動資料格式轉換和更新
- 支援自動刷新機制

### 5. 建立測試和文件
- 建立了基本的單元測試框架
- 建立了測試頁面驗證功能
- 更新了組件導出索引

## 建立/修改檔案

### 新建檔案
1. `src/components/charts/CandlestickChart.tsx` - 核心K線圖表組件
2. `src/components/charts/ResponsiveChart.tsx` - 響應式圖表包裝器
3. `src/components/charts/ChartLoading.tsx` - 圖表載入狀態組件
4. `src/components/charts/ChartError.tsx` - 圖表錯誤狀態組件
5. `src/components/charts/ChartContainer.tsx` - 圖表整合容器組件
6. `src/components/charts/index.ts` - 圖表組件導出索引
7. `src/components/charts/__tests__/CandlestickChart.test.tsx` - 圖表組件測試
8. `src/components/charts/__tests__/ChartContainer.test.tsx` - 容器組件測試
9. `src/app/test-chart/page.tsx` - 圖表功能測試頁面

### 修改檔案
1. `src/components/index.ts` - 新增圖表組件導出

## 技術決策

### 1. 圖表庫選擇
選擇 TradingView Lightweight Charts 的原因：
- 專為金融圖表設計，效能優異
- 支援多種圖表類型和技術指標
- 輕量級，bundle 大小合理
- 活躍的社群和完善的文件
- 與專案需求完美匹配

### 2. 組件架構設計
採用分層架構的原因：
- **CandlestickChart**: 純圖表渲染邏輯
- **ResponsiveChart**: 響應式佈局處理
- **ChartContainer**: 資料獲取和狀態管理
- **狀態組件**: 載入和錯誤處理

這種設計提供了良好的關注點分離和可重用性。

### 3. 資料格式轉換
實作了內部資料格式到 TradingView 格式的轉換：
- 統一時間戳處理（毫秒 → 秒）
- 標準化價格欄位命名
- 保持資料完整性和類型安全

### 4. 響應式設計策略
使用 ResizeObserver API 而非 window resize 事件：
- 更精確的容器尺寸監聽
- 避免不必要的重新渲染
- 支援複雜佈局場景

## 測試結果

### 單元測試
- ✅ 建立了基本的組件渲染測試
- ✅ 使用 Vitest 和 React Testing Library
- ✅ Mock 了 lightweight-charts 依賴
- ✅ 測試了基本的 props 傳遞和渲染
- ✅ 所有圖表組件測試通過 (5/5)

### 測試環境修復
- ✅ 修復了 React 全域導入問題
- ✅ 新增了 ResizeObserver Mock
- ✅ 修復了文字匹配測試問題
- ✅ 更新了測試設定檔案

### 整合測試
- ✅ 建立了測試頁面驗證完整功能
- ✅ 測試了與現有 hooks 和 stores 的整合
- ✅ 驗證了響應式設計效果

### 手動測試
- ✅ 圖表組件成功渲染
- ✅ 響應式調整正常工作
- ✅ 載入和錯誤狀態正確顯示
- ✅ 與現有架構無縫整合

## 問題解決

### 1. TypeScript 類型問題
**問題**: TradingView Lightweight Charts v5 的 TypeScript 定義不完整
**解決方案**: 使用 `any` 類型暫時繞過，後續可以建立自訂類型定義

### 2. 測試環境配置
**問題**: Jest 語法與 Vitest 不相容
**解決方案**: 更新測試檔案使用 Vitest 的 `vi` API 替代 Jest 的 `jest` API

### 3. React 導入問題
**問題**: 測試環境中 React 未定義
**解決方案**: 在測試設定檔案中新增 React 全域導入

### 4. ResizeObserver 問題
**問題**: 測試環境中 ResizeObserver API 不存在
**解決方案**: 在測試設定中新增 ResizeObserver Mock 實作

### 5. 文字匹配測試問題
**問題**: 測試中的文字被多個元素分割，無法精確匹配
**解決方案**: 使用正則表達式匹配或分別測試各個文字片段

## Git提交記錄

```bash
feat(task-8.1): 整合TradingView Lightweight Charts

- 建立CandlestickChart核心圖表組件
- 實作ResponsiveChart響應式包裝器
- 建立ChartLoading和ChartError狀態組件
- 實作ChartContainer整合容器組件
- 建立圖表組件測試和測試頁面
- 更新組件導出索引
- 對應需求: 3.1, 3.3, 4.2, 8.1, 8.2, 8.3, 8.4, 8.5
- 相關檔案: src/components/charts/

Co-authored-by: AI Assistant <ai@kiro.dev>
```

## 後續工作
- Task 8.2: 實作圖表互動功能（時間範圍選擇器、縮放平移）
- Task 8.3: 建立圖表彈出視窗（模態視窗、全螢幕檢視）
- 完善 TypeScript 類型定義
- 新增更多圖表樣式和主題選項
- 實作圖表資料的增量更新機制