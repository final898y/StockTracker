# React 無限循環錯誤修復報告

## 問題描述

在修復搜尋頁面顯示問題後，應用出現了嚴重的 React 錯誤：

```
Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

錯誤堆疊顯示問題出現在 `WatchlistManager` 組件中的 `useWatchlistPrices` hook。

## 問題分析

### 根本原因
在 `useWatchlistPrices` hook 中，`useEffect` 的依賴陣列包含了會頻繁變化的引用：

```typescript
// 問題代碼
useEffect(() => {
  // 價格更新邏輯
}, [queries, items, updatePrices]); // updatePrices 每次重新渲染都是新引用
```

### 問題鏈條
1. `useWatchlistPrices` hook 中的 `useEffect` 依賴 `updatePrices` 函數
2. `updatePrices` 來自 Zustand store，每次 store 重新渲染時都是新的引用
3. 當 `useEffect` 執行 `updatePrices` 時，會觸發 store 更新
4. Store 更新導致組件重新渲染，`updatePrices` 變成新引用
5. 新引用觸發 `useEffect` 再次執行，形成無限循環

### 觸發條件
- 當追蹤清單中有項目時
- 價格查詢成功返回資料時
- 每次組件重新渲染時

## 解決方案

使用 `useRef` 來穩定 `updatePrices` 函數引用，並優化 `useEffect` 的依賴陣列：

### 修復前的問題代碼
```typescript
const { items, updatePrices } = useWatchlistStore();

useEffect(() => {
  // 價格更新邏輯
  if (hasUpdates) {
    updatePrices(priceUpdates);
  }
}, [queries, items, updatePrices]); // 問題：updatePrices 引用不穩定
```

### 修復後的正確代碼
```typescript
const { items, updatePrices } = useWatchlistStore();
const updatePricesRef = useRef(updatePrices);

// 保持 updatePrices 引用最新
useEffect(() => {
  updatePricesRef.current = updatePrices;
}, [updatePrices]);

useEffect(() => {
  // 價格更新邏輯
  if (hasUpdates) {
    updatePricesRef.current(priceUpdates); // 使用穩定的引用
  }
}, [
  // 只依賴查詢結果的序列化版本，避免引用變化
  JSON.stringify(queries.map(q => ({ 
    data: q.data, 
    isError: q.isError,
    dataUpdatedAt: q.dataUpdatedAt 
  }))),
  items.length
]);
```

## 修改檔案

- `stock-tracker/src/hooks/use-watchlist-prices.ts`

## 技術細節

### 關鍵改進
1. **穩定引用**：使用 `useRef` 保持 `updatePrices` 函數的穩定引用
2. **優化依賴**：將複雜物件依賴改為序列化版本，避免引用比較
3. **防護檢查**：增加 `items[index]` 存在性檢查，防止陣列越界

### 依賴陣列優化
```typescript
// 修復前：引用不穩定
[queries, items, updatePrices]

// 修復後：只依賴實際需要的值
[
  JSON.stringify(queries.map(q => ({ 
    data: q.data, 
    isError: q.isError,
    dataUpdatedAt: q.dataUpdatedAt 
  }))),
  items.length
]
```

## 測試結果

修復後的測試結果：
- ✅ 應用正常啟動，無無限循環錯誤
- ✅ 追蹤清單正常載入
- ✅ 價格資料正常更新
- ✅ 搜尋功能正常工作
- ✅ 圖表功能正常工作

## 預防措施

為避免類似問題，建議：

1. **謹慎使用 useEffect 依賴**：避免將頻繁變化的函數引用加入依賴陣列
2. **使用 useCallback 和 useRef**：穩定函數引用，避免不必要的重新渲染
3. **序列化複雜依賴**：對於複雜物件，使用序列化版本進行比較
4. **增加 ESLint 規則**：使用 `exhaustive-deps` 規則檢查依賴陣列
5. **單元測試**：為 hooks 添加測試，及早發現循環依賴問題

## 相關問題

這個修復解決了以下用戶體驗問題：
1. 應用崩潰，顯示錯誤邊界
2. 瀏覽器標籤頁凍結
3. 無法正常使用追蹤清單功能
4. 價格資料無法更新

## 修復時間

- 問題發現：2025-09-01 13:25
- 問題分析：2025-09-01 13:30
- 修復完成：2025-09-01 13:40
- 測試驗證：2025-09-01 13:45

## 狀態

✅ 已修復並驗證