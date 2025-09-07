# 任務 17: 建立未來擴展基礎 - 模組化資料提供者架構

**任務編號:** 17
**完成日期:** 2025年9月7日 星期日
**對應需求:** 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5

## 實作步驟與技術決策

為了建立未來擴展的基礎，特別是為了支援多種市場類型（如台股）和新增不同資料源，我們引入了模組化的資料提供者架構。

### 1. 引入資料提供者介面
- **決策:** 定義清晰的介面來規範不同資料提供者的行為，提高程式碼的可維護性和可擴展性。
- **實作:**
    - 在 `src/services/data-providers/index.ts` 中定義了 `IStockDataProvider` 和 `ICryptoDataProvider` 介面，分別規範了股票和加密貨幣資料提供者應實現的方法（搜尋、獲取詳情、獲取圖表資料）。
    - 定義了 `IFinancialDataProvider` 介面，結合了股票和加密貨幣資料提供者的功能。

### 2. 實作資料提供者管理器
- **決策:** 建立一個中心化的管理器來統一管理和提供不同類型的資料提供者，便於未來根據市場或資產類型動態切換資料源。
- **實作:**
    - 在 `src/services/data-providers/provider-manager.ts` 中創建了 `FinancialDataProviderManager` 類別。
    - 該管理器初始化時，預設使用 `alphaVantageClient` 作為股票資料提供者，`coinGeckoClient` 作為加密貨幣資料提供者。
    - 提供了 `getStockProvider()`、`getCryptoProvider()` 和 `getProvider(assetType)` 方法，用於獲取對應的資料提供者實例。
    - 預留了擴展點，未來可以根據市場或國家選擇不同的資料提供者。

### 3. 標準化圖表資料回應
- **決策:** 統一不同資料源的圖表資料回應格式，簡化前端組件的資料處理邏輯。
- **實作:**
    - 修改 `src/services/alpha-vantage.ts` 和 `src/services/coingecko.ts` 中的 `getChartData` 方法，使其接受 `TimeframeType` 參數並返回 `Promise<ChartResponse>`。
    - `ChartResponse` 包含 `symbol`、`timeframe` 和 `data` (圖表資料點陣列)。
    - `CoinGeckoClient` 的 `getChartData` 內部邏輯已調整，根據 `TimeframeType` 參數轉換為 CoinGecko API 所需的 `days` 和 `interval`。

### 4. 擴展資產資料模型
- **決策:** 在核心資產資料模型中引入市場識別符，以便未來能夠區分和處理來自不同市場的資產。
- **實作:**
    - 在 `src/types/index.ts` 的 `Asset` 介面中新增了 `market?: string;` 屬性，例如 `'US'`、`'TW'`、`'Crypto'`。這為台股等特定市場的資料擴展提供了直接的支援。

## 對應的 Git Commit 內容與訊息

```
feat(task-17): 建立模組化資料提供者架構

此提交為未來擴展奠定基礎：
- 引入 `IStockDataProvider` 和 `ICryptoDataProvider` 介面。
- 實作 `FinancialDataProviderManager` 以管理不同資料來源。
- 標準化 Alpha Vantage 和 CoinGecko 客戶端的圖表資料回應。
- 在 `Asset` 介面中新增 `market` 屬性以支援特定市場資料。

這些變更將有助於更輕鬆地整合新的市場類型（例如台股），並提高資料獲取服務的整體模組化程度。

對應需求: 7.1, 7.2, 7.3, 7.4, 8.1-8.5
相關檔案:
- src/services/alpha-vantage.ts
- src/services/coingecko.ts
- src/services/data-providers/index.ts
- src/services/data-providers/provider-manager.ts
- src/types/index.ts

Co-authored-by: AI Assistant <ai@kiro/Gemini.dev>
```