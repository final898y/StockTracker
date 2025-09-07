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

### 5. 實作市場配置系統與台股資料提供者整合

為了支援不同市場的交易時間和規則，並整合台股資料提供者，我們進行了以下實作：

- **市場配置系統:**
    - **決策:** 建立一個集中的配置檔案來管理不同市場的交易時間、時區等資訊，便於未來擴展和維護。
    - **實作:**
        - 新增 `src/constants/market-config.ts` 檔案。
        - 定義 `MarketConfig` 和 `MarketTradingHours` 介面，規範市場配置的結構。
        - `MARKET_CONFIGS` 陣列包含了美國、台灣和加密貨幣市場的範例配置，其中包含了交易時間和時區資訊。
        - 提供了 `getMarketConfig` 輔助函數，用於根據市場 ID 快速獲取對應的配置。

- **台股資料提供者佔位符:**
    - **決策:** 為了未來整合台股資料，先建立一個符合 `IStockDataProvider` 介面的佔位符，確保架構的完整性。
    - **實作:**
        - 新增 `src/services/taiwan-stock.ts` 檔案。
        - 實作 `TaiwanStockClient` 類別，它實現了 `IStockDataProvider` 介面，並提供了 `searchStocks`、`getStockDetails` 和 `getStockChartData` 方法的模擬實作。這些方法目前返回模擬數據，並發出警告，提示其尚未完全實現。

- **更新 FinancialDataProviderManager:**
    - **決策:** 擴展現有的資料提供者管理器，使其能夠根據資產的市場屬性動態選擇正確的股票資料提供者。
    - **實作:**
        - 修改 `src/services/data-providers/provider-manager.ts`。
        - 引入 `taiwanStockClient`。
        - 更新 `getProvider` 方法，使其接受一個可選的 `market` 參數。當 `assetType` 為 `'stock'` 且 `market` 為 `'TW'` 時，返回 `taiwanStockClient`；否則，默認返回 `alphaVantageClient`。

## 對應的 Git Commit 內容與訊息

```
feat(task-17): 實作市場配置與台股資料提供者整合

此提交完成了任務 17 的以下部分：
- 實作市場交易時間和規則的配置系統，新增 `src/constants/market-config.ts`。
- 建立台股資料提供者佔位符 `src/services/taiwan-stock.ts`。
- 更新 `FinancialDataProviderManager` 以根據市場類型選擇資料提供者，支援台股。

這些變更進一步強化了系統的未來擴展性，特別是針對不同市場的資料整合。

對應需求: 7.1, 7.2, 7.3, 7.4, 8.1-8.5
相關檔案:
- src/constants/market-config.ts
- src/services/taiwan-stock.ts
- src/services/data-providers/provider-manager.ts

Co-authored-by: AI Assistant <ai@kiro/Gemini.dev>
```