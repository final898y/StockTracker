# 專案修復執行計劃

## 修復策略概覽
基於測試分析報告，採用分階段修復策略，優先處理影響核心功能的問題，再處理測試穩定性和程式碼品質問題。

---

## 階段一：核心功能修復 (高優先級)

### 步驟 1：修復 IndexedDB 伺服器端相容性
**問題**：`ReferenceError: indexedDB is not defined`
**影響**：伺服器端渲染失敗

**修復方案**：
```typescript
// 在 IndexedDB 服務中添加環境檢查
const isClient = typeof window !== 'undefined';
const isIndexedDBSupported = isClient && 'indexedDB' in window;
```

**執行步驟**：
1. 檢查 `src/services/indexeddb.ts` 檔案
2. 添加瀏覽器環境檢查
3. 實作 fallback 機制（記憶體存儲或 localStorage）
4. 更新相關服務的初始化邏輯

**驗證方法**：
```bash
npm run build
# 檢查是否還有 IndexedDB 錯誤
```

### 步驟 2：修復 WatchlistService 缺失方法
**問題**：`watchlistService.addAsset/removeAsset is not a function`
**影響**：追蹤清單功能無法正常運作

**修復方案**：
1. 檢查 `src/services/watchlist.ts` 是否有 `addAsset` 和 `removeAsset` 方法
2. 如果缺失，實作這些方法
3. 確保方法正確匯出

**執行步驟**：
1. 檢查 watchlist 服務檔案
2. 實作缺失的方法
3. 更新匯出語句
4. 執行相關測試驗證

**驗證方法**：
```bash
npm test -- src/stores/__tests__/watchlist-store.test.ts
```

### 步驟 3：修復 CandlestickChart Mock 設定
**問題**：`chart.subscribeCrosshairMove is not a function`
**影響**：圖表組件測試失敗

**修復方案**：
完善 LightweightCharts mock 物件，添加缺失的方法

**執行步驟**：
1. 檢查測試檔案中的 mock 設定
2. 添加 `subscribeCrosshairMove` 方法到 mock
3. 確保 mock 物件完整性

**驗證方法**：
```bash
npm test -- src/components/charts/__tests__/CandlestickChart.test.tsx
```

---

## 階段二：測試穩定性修復 (中優先級)

### 步驟 4：修正 Alpha Vantage 測試期望值
**問題**：測試期望值與實際 API 回應不符
**影響**：測試結果不可靠

**修復方案**：
1. 更新測試期望值以符合實際 API 回應格式
2. 使用更穩定的 mock 資料

**執行步驟**：
1. 分析實際 API 回應格式
2. 更新測試中的期望值
3. 確保 mock 資料一致性

### 步驟 5：修復錯誤處理測試 Mock
**問題**：錯誤處理測試沒有正確模擬失敗情況
**影響**：錯誤處理邏輯測試不完整

**修復方案**：
1. 正確設定 mock 以模擬 API 錯誤
2. 確保錯誤處理路徑被測試覆蓋

**執行步驟**：
1. 檢查錯誤處理測試的 mock 設定
2. 修正 mock 以正確拋出錯誤
3. 驗證錯誤處理邏輯

---

## 階段三：程式碼品質優化 (低優先級)

### 步驟 6：優化圖片組件
**問題**：使用 `<img>` 標籤的效能警告
**影響**：效能和 SEO

**修復方案**：
```typescript
// 替換 <img> 為 Next.js <Image />
import Image from 'next/image';
<Image src={src} alt={alt} width={width} height={height} />
```

### 步驟 7：修正 React Hooks 依賴項
**問題**：useEffect 清理函數中的 ref 值警告
**影響**：潛在的記憶體洩漏

**修復方案**：
```typescript
useEffect(() => {
  const currentInterval = intervalRef.current;
  return () => {
    if (currentInterval) {
      clearInterval(currentInterval);
    }
  };
}, []);
```

---

## 執行順序建議

### 第一天：核心功能修復
1. **上午**：修復 IndexedDB 伺服器端相容性 (步驟 1)
2. **下午**：修復 WatchlistService 缺失方法 (步驟 2)

### 第二天：組件和測試修復
1. **上午**：修復 CandlestickChart Mock (步驟 3)
2. **下午**：修正 Alpha Vantage 測試 (步驟 4)

### 第三天：完善和優化
1. **上午**：修復錯誤處理測試 (步驟 5)
2. **下午**：程式碼品質優化 (步驟 6-7)

---

## 驗證檢查清單

### 每個步驟完成後：
- [ ] 執行相關單元測試
- [ ] 檢查建置是否成功
- [ ] 驗證功能是否正常運作

### 全部完成後：
- [ ] 執行完整測試套件：`npm run test`
- [ ] 執行建置：`npm run build`
- [ ] 檢查測試覆蓋率
- [ ] 驗證主要功能流程

---

## 風險評估

### 高風險修復
- **IndexedDB 修復**：可能影響資料存儲邏輯
- **WatchlistService 修復**：可能影響核心業務邏輯

### 低風險修復
- **測試期望值修正**：僅影響測試，不影響功能
- **程式碼品質優化**：主要是警告修復

---

## 回滾計劃
如果修復過程中出現問題：
1. 使用 Git 回滾到修復前的狀態
2. 分析問題原因
3. 調整修復策略
4. 重新執行修復步驟

---

## 下一步行動
準備開始執行 **步驟 1：修復 IndexedDB 伺服器端相容性**