# 任務 4: 實作外部API整合服務

## 基本資訊
- **任務編號**: 4
- **任務標題**: 實作外部API整合服務
- **完成日期**: 2025-08-18
- **完成時間**: 晚上
- **對應需求**: 1.1, 2.1, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4

## 任務描述
建立完整的外部API整合服務，包含Alpha Vantage股票API客戶端、CoinGecko加密貨幣API客戶端，以及統一的圖表資料API客戶端。此系統將為股票追蹤應用提供可靠的外部資料來源，支援美股搜尋、加密貨幣查詢和歷史圖表資料獲取功能。

## 實作步驟

### 步驟 1: 建立Alpha Vantage API客戶端
實作Alpha Vantage API的HTTP客戶端，提供美股搜尋和價格查詢功能。

**實作內容:**
- 建立AlphaVantageClient類別封裝API調用邏輯
- 實作股票搜尋功能，支援按符號或公司名稱搜尋
- 實作股票詳細資訊獲取，包含當前價格、成交量和變化
- 實作歷史圖表資料獲取，支援日線資料查詢
- 建立完整的錯誤處理和重試機制
- 實作API使用率限制管理

**技術決策:**
- 使用TypeScript介面定義API回應格式確保類型安全
- 實作指數退避重試策略提高API調用成功率
- 使用環境變數管理API金鑰確保安全性
- 實作請求超時和取消機制避免長時間等待

### 步驟 2: 建立CoinGecko API客戶端
實作CoinGecko API的HTTP客戶端，提供加密貨幣搜尋和價格查詢功能。

**實作內容:**
- 建立CoinGeckoClient類別封裝API調用邏輯
- 實作加密貨幣搜尋功能，支援按名稱或符號搜尋
- 實作單一和批次加密貨幣價格獲取
- 實作歷史圖表資料獲取，支援多種時間範圍
- 實作熱門加密貨幣獲取功能
- 建立智能速率限制管理，區分免費和付費層級
- 實作完整的錯誤處理和重試機制

**技術決策:**
- 實作免費層級的速率限制（每秒1請求）避免API限制
- 支援API金鑰配置以使用付費層級功能
- 使用OHLC資料模擬機制處理CoinGecko價格資料格式
- 實作請求計數器和使用統計功能

### 步驟 3: 建立圖表資料API客戶端
建立統一的圖表資料服務，整合股票和加密貨幣的圖表資料獲取。

**實作內容:**
- 建立ChartDataClient類別作為統一介面
- 實作多種時間範圍支援（1D, 1W, 1M, 3M, 1Y）
- 實作資料過濾和採樣機制優化效能
- 建立資料品質驗證和檢查功能
- 實作批次圖表資料獲取功能
- 建立完整的錯誤處理和標準化機制

**技術決策:**
- 使用統一的資料格式簡化上層應用邏輯
- 實作資料採樣算法減少圖表渲染負擔
- 建立資料驗證機制確保圖表資料品質
- 支援多資產批次查詢提高效率

### 步驟 4: 建立完整的測試套件
為所有API客戶端建立全面的單元測試，確保功能正確性和穩定性。

**實作內容:**
- 建立Alpha Vantage客戶端的完整測試套件
- 建立CoinGecko客戶端的完整測試套件
- 建立圖表資料客戶端的完整測試套件
- 實作Mock機制模擬API回應
- 測試錯誤處理和邊界情況
- 驗證重試邏輯和速率限制功能

**技術決策:**
- 使用Vitest測試框架確保與專案一致性
- 實作完整的Mock策略避免實際API調用
- 測試所有錯誤情況確保系統穩定性
- 使用TypeScript類型定義提高測試品質

### 步驟 5: 修復ESLint錯誤和代碼品質問題
解決所有ESLint錯誤和警告，確保代碼符合專案標準。

**實作內容:**
- 修復未使用變數和導入的警告
- 替換所有`any`類型為適當的類型定義
- 修復函數簽名不匹配問題
- 更新測試文件的類型定義
- 確保所有代碼通過TypeScript編譯

**技術決策:**
- 使用嚴格的TypeScript類型檢查提高代碼品質
- 遵循專案的ESLint規則確保代碼一致性
- 建立適當的類型定義避免使用`any`
- 修復現有代碼中的類型問題

## 建立的檔案
- `src/services/alpha-vantage.ts` - Alpha Vantage API客戶端實作
- `src/services/coingecko.ts` - CoinGecko API客戶端實作
- `src/services/chart-data.ts` - 統一圖表資料API客戶端
- `src/services/__tests__/alpha-vantage.test.ts` - Alpha Vantage客戶端測試
- `src/services/__tests__/coingecko.test.ts` - CoinGecko客戶端測試
- `src/services/__tests__/chart-data.test.ts` - 圖表資料客戶端測試

## 修改的檔案
- `src/services/index.ts` - 新增API客戶端導出
- `src/services/indexeddb.ts` - 修復TypeScript類型問題
- `src/test/setup.ts` - 修復fake-indexeddb導入問題
- `src/services/cache.ts` - 移除未使用的導入和變數
- `src/services/__tests__/cache.test.ts` - 修復類型定義問題
- `src/services/__tests__/watchlist.test.ts` - 修復類型定義問題
- `src/services/__tests__/indexeddb.test.ts` - 移除未使用的導入和變數

## 技術決策和理由

### 決策 1: 使用類別封裝API客戶端
**決策內容**: 每個API服務都使用類別封裝，提供單例實例
**理由**: 類別設計便於狀態管理和配置，單例模式避免重複初始化，提供清晰的API介面
**替代方案**: 使用函數式設計，但狀態管理會更複雜

### 決策 2: 實作統一的錯誤處理機制
**決策內容**: 所有API客戶端都使用統一的ErrorResponse格式和錯誤代碼
**理由**: 統一的錯誤格式便於上層應用處理，標準化的錯誤代碼提高可維護性
**替代方案**: 每個API使用不同的錯誤格式，但會增加複雜性

### 決策 3: 實作智能重試和速率限制
**決策內容**: 使用指數退避重試策略和智能速率限制管理
**理由**: 提高API調用成功率，避免觸發API限制，提供更穩定的服務
**替代方案**: 簡單的固定間隔重試，但效果較差

### 決策 4: 建立完整的TypeScript類型定義
**決策內容**: 為所有API回應和內部資料結構建立完整的類型定義
**理由**: 提供編譯時類型檢查，減少運行時錯誤，提高開發效率
**替代方案**: 使用any類型，但會失去類型安全性

### 決策 5: 實作資料驗證和品質檢查
**決策內容**: 在圖表資料客戶端中實作資料驗證和品質檢查功能
**理由**: 確保圖表資料的正確性，提前發現資料問題，提高使用者體驗
**替代方案**: 直接使用原始資料，但可能導致圖表顯示問題

## 測試結果和驗證

### 單元測試
- Alpha Vantage客戶端測試: ✅ 10/10 通過
- CoinGecko客戶端測試: ✅ 15/15 通過
- 圖表資料客戶端測試: ✅ 16/16 通過
- 總計: ✅ 41/41 測試通過

### 整合測試
- TypeScript編譯檢查: ✅ 通過
- ESLint代碼品質檢查: ✅ 通過
- Next.js構建測試: ✅ 通過

### 功能驗證
- API客戶端初始化: ✅ 通過
- 錯誤處理機制: ✅ 通過
- 重試邏輯驗證: ✅ 通過
- 速率限制管理: ✅ 通過
- 資料格式轉換: ✅ 通過

## 遇到的問題和解決方案

### 問題 1: 測試中的Mock設置問題
**問題描述**: 初始測試中fetch mock沒有正確處理重試邏輯，導致測試失敗
**解決方案**: 使用mockResolvedValue替代mockResolvedValueOnce，確保所有重試請求都有正確的回應
**學習心得**: 在測試有重試邏輯的代碼時，需要考慮所有可能的請求次數

### 問題 2: CoinGecko錯誤處理不一致
**問題描述**: CoinGecko API的錯誤訊息格式與錯誤處理邏輯不匹配
**解決方案**: 更新錯誤處理邏輯，支援"Rate limit"和"rate limit"兩種格式
**學習心得**: 外部API的錯誤格式可能不一致，需要建立靈活的錯誤處理機制

### 問題 3: 圖表資料時間過濾問題
**問題描述**: 測試中使用的時間戳太舊，被時間範圍過濾器過濾掉
**解決方案**: 使用相對時間（Date.now() - offset）生成測試資料，確保資料在有效範圍內
**學習心得**: 測試資料應該使用相對時間而非固定時間戳，避免時間相關的問題

### 問題 4: ESLint類型檢查嚴格性
**問題描述**: 專案的ESLint配置禁止使用any類型，需要為所有Mock建立適當的類型定義
**解決方案**: 建立詳細的類型定義替代any類型，提高代碼品質
**學習心得**: 嚴格的類型檢查雖然增加工作量，但能顯著提高代碼品質

### 問題 5: IndexedDB類型不匹配
**問題描述**: 現有IndexedDB服務中的返回類型與實際API不匹配
**解決方案**: 修正方法簽名，使用IDBValidKey替代number類型
**學習心得**: 在整合新功能時，需要檢查和修復現有代碼中的類型問題

## Git 提交記錄
詳細的Git提交記錄請參考: `git-commits/task-4-commits.md`

## 後續工作
- 整合API客戶端到實際的UI組件中
- 實作API回應的本地快取機制
- 新增更多的API端點支援（如新聞、分析資料）
- 建立API使用監控和統計功能
- 考慮實作WebSocket連接支援即時資料

## 相關資源
- [Alpha Vantage API文檔](https://www.alphavantage.co/documentation/)
- [CoinGecko API文檔](https://www.coingecko.com/en/api/documentation)
- [TypeScript錯誤處理最佳實踐](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Vitest測試框架文檔](https://vitest.dev/)

---
*此文件由任務文件化系統生成於 2025-08-18*# 任務 4: 實作外部API整合服務

## 基本資訊
- **任務編號**: 4
- **任務標題**: 實作外部API整合服務
- **完成日期**: 2025-01-18
- **完成時間**: 23:32
- **對應需求**: Requirements 1.1, 2.1, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4

## 任務描述
建立完整的外部API整合服務，包含Alpha Vantage股票API客戶端、CoinGecko加密貨幣API客戶端，以及統一的圖表資料API客戶端。實作錯誤處理、重試機制、速率限制管理，並提供完整的TypeScript類型支援。

## 實作步驟

### 步驟 1: 建立Alpha Vantage API客戶端
建立專業的Alpha Vantage API整合服務，支援美股搜尋、價格查詢和歷史資料獲取。

**實作內容:**
- 實作完整的Alpha Vantage API HTTP客戶端
- 建立美股搜尋功能，支援公司名稱和股票代碼搜尋
- 實作即時股價查詢，包含價格、成交量、漲跌幅等資訊
- 建立歷史K線資料獲取功能
- 實作智能錯誤處理和指數退避重試機制
- 建立API使用狀況監控和配置檢查功能

**技術決策:**
- 使用TypeScript介面確保類型安全
- 實作指數退避重試策略，避免API限制
- 建立標準化錯誤回應格式
- 支援環境變數配置API金鑰

### 步驟 2: 建立CoinGecko API客戶端
建立功能完整的CoinGecko API整合服務，支援加密貨幣搜尋、價格查詢和市場資料。

**實作內容:**
- 實作CoinGecko API HTTP客戶端
- 建立加密貨幣搜尋功能
- 實作單一和批量加密貨幣價格查詢
- 建立歷史價格和圖表資料獲取
- 實作趨勢加密貨幣查詢功能
- 建立免費版API速率限制管理（1請求/秒）
- 支援Pro版API金鑰配置

**技術決策:**
- 實作智能速率限制，免費版自動延遲請求
- 建立批量查詢優化，減少API調用次數
- 實作OHLC資料模擬，從價格資料生成K線圖資料
- 支援Pro和免費版API的自動切換

### 步驟 3: 建立統一圖表資料API客戶端
建立統一的圖表資料服務，整合股票和加密貨幣資料源，提供一致的介面。

**實作內容:**
- 建立統一的圖表資料客戶端介面
- 實作多時間範圍支援（1D, 1W, 1M, 3M, 1Y）
- 建立資料過濾和採樣機制，優化效能
- 實作資料品質驗證和完整性檢查
- 建立批量圖表資料查詢功能
- 實作資料驗證和錯誤處理

**技術決策:**
- 使用統一介面隱藏不同API的差異
- 實作智能資料採樣，避免圖表資料過多
- 建立資料品質檢查，確保圖表資料可靠性
- 支援多資產類型的統一處理

## 建立的檔案
- `src/services/alpha-vantage.ts` - Alpha Vantage API客戶端實作
- `src/services/coingecko.ts` - CoinGecko API客戶端實作
- `src/services/chart-data.ts` - 統一圖表資料API客戶端
- `src/services/__tests__/alpha-vantage.test.ts` - Alpha Vantage客戶端單元測試
- `src/services/__tests__/coingecko.test.ts` - CoinGecko客戶端單元測試
- `src/services/__tests__/chart-data.test.ts` - 圖表資料客戶端單元測試

## 修改的檔案
- `src/services/index.ts` - 新增API客戶端匯出
- `src/services/indexeddb.ts` - 修復TypeScript類型問題
- `src/test/setup.ts` - 修復測試環境配置
- `src/services/cache.ts` - 修復ESLint警告
- `src/services/__tests__/cache.test.ts` - 修復測試類型問題
- `src/services/__tests__/watchlist.test.ts` - 修復測試類型問題

## 技術決策和理由

### 決策 1: 使用單例模式匯出API客戶端
**決策內容**: 每個API客戶端都匯出單例實例，如`alphaVantageClient`、`coinGeckoClient`
**理由**: 避免重複建立客戶端實例，統一管理API配置和狀態，簡化使用方式
**替代方案**: 每次使用時建立新實例，但會增加記憶體使用和配置複雜度

### 決策 2: 實作指數退避重試機制
**決策內容**: 使用指數退避策略，重試間隔為 `retryDelay * Math.pow(2, attempt - 1)`
**理由**: 避免在API服務暫時不可用時過度請求，提高成功率
**替代方案**: 固定間隔重試，但可能在高負載時加重API服務壓力

### 決策 3: 建立統一的錯誤處理格式
**決策內容**: 所有API客戶端都回傳標準化的`ErrorResponse`格式
**理由**: 提供一致的錯誤處理體驗，便於上層應用統一處理不同API的錯誤
**替代方案**: 直接拋出原始錯誤，但會增加錯誤處理的複雜度

### 決策 4: 實作資料品質驗證
**決策內容**: 在圖表資料客戶端中實作資料完整性和品質檢查
**理由**: 確保圖表顯示的資料品質，避免異常資料影響使用者體驗
**替代方案**: 直接使用API回傳的資料，但可能包含異常值或缺失資料

## 測試結果和驗證

### 單元測試
- Alpha Vantage API客戶端測試: ✅ 通過 (10/10)
- CoinGecko API客戶端測試: ✅ 通過 (15/15)
- 圖表資料客戶端測試: ✅ 通過 (16/16)

### 整合測試
- API客戶端整合測試: ✅ 通過
- 錯誤處理機制測試: ✅ 通過
- 重試機制測試: ✅ 通過

### 手動測試
- TypeScript編譯檢查: ✅ 通過
- ESLint程式碼品質檢查: ✅ 通過
- Next.js建置測試: ✅ 通過

## 遇到的問題和解決方案

### 問題 1: ESLint錯誤阻止建置
**問題描述**: 程式碼中存在多個ESLint錯誤，包括未使用變數、any類型使用、未使用導入等
**解決方案**: 系統性修復所有ESLint錯誤，包括移除未使用導入、修復any類型、使用適當的TypeScript類型定義
**學習心得**: 在開發過程中應該持續關注程式碼品質，避免累積過多技術債務

### 問題 2: 測試Mock設定問題
**問題描述**: 測試中的fetch mock在重試機制下沒有正確設定，導致測試失敗
**解決方案**: 將`mockResolvedValueOnce`改為`mockResolvedValue`，確保所有重試請求都能正確mock
**學習心得**: 在測試有重試機制的程式碼時，需要考慮多次調用的情況

### 問題 3: 圖表資料時間過濾問題
**問題描述**: 測試中使用的時間戳太舊，被時間範圍過濾器過濾掉，導致測試資料為空
**解決方案**: 使用相對時間戳（如`Date.now() - 24 * 60 * 60 * 1000`）確保測試資料在有效範圍內
**學習心得**: 在處理時間相關的測試時，應該使用相對時間而非固定時間戳

### 問題 4: TypeScript類型不匹配
**問題描述**: IndexedDB服務中的`addToWatchlist`方法回傳類型與實際不符
**解決方案**: 將回傳類型從`Promise<number>`改為`Promise<IDBValidKey>`，符合IndexedDB API規範
**學習心得**: 在使用瀏覽器API時，需要仔細檢查API規範和TypeScript類型定義

## Git 提交記錄
詳細的Git提交記錄請參考: `git-commits/task-4-commits.md`

## 後續工作
- 建立API客戶端的使用文件和範例
- 實作API快取機制整合
- 建立API監控和效能追蹤
- 實作API金鑰管理和輪換機制
- 建立API使用量統計和報告

## 相關資源
- [Alpha Vantage API文件](https://www.alphavantage.co/documentation/)
- [CoinGecko API文件](https://www.coingecko.com/en/api/documentation)
- [TypeScript錯誤處理最佳實踐](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Vitest測試框架文件](https://vitest.dev/guide/)

---
*此文件由任務文件化系統自動生成於 2025-01-18 23:32*