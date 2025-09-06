# 使用者需求 (User Requirements)

## Requirement 1: 追蹤美股

**User Story:** 作為一個投資者，我想要追蹤我感興趣的美股價格，這樣我就能即時了解股票的價格變動。

#### Acceptance Criteria

1. WHEN 使用者搜尋美股股票代碼 THEN 系統 SHALL 顯示該股票的當前價格
2. WHEN 使用者將美股加入追蹤清單 THEN 系統 SHALL 儲存該股票到使用者的追蹤清單
3. WHEN 使用者查看追蹤清單 THEN 系統 SHALL 顯示所有已追蹤美股的即時價格
4. IF 股票代碼不存在 THEN 系統 SHALL 顯示錯誤訊息
5. WHEN 使用者從追蹤清單移除股票 THEN 系統 SHALL 從本地存儲中刪除該股票

## Requirement 2: 追蹤加密貨幣

**User Story:** 作為一個加密貨幣投資者，我想要追蹤加密貨幣的價格，這樣我就能監控我的投資組合。

#### Acceptance Criteria

1. WHEN 使用者搜尋加密貨幣代碼 THEN 系統 SHALL 顯示該加密貨幣的當前價格
2. WHEN 使用者將加密貨幣加入追蹤清單 THEN 系統 SHALL 儲存該加密貨幣到使用者的追蹤清單
3. WHEN 使用者查看追蹤清單 THEN 系統 SHALL 顯示所有已追蹤加密貨幣的即時價格
4. WHEN 系統更新加密貨幣價格 THEN 系統 SHALL 每分鐘更新一次價格資料
5. WHEN 使用者從追蹤清單移除加密貨幣 THEN 系統 SHALL 從本地存儲中刪除該加密貨幣

## Requirement 3: K線圖技術分析

**User Story:** 作為一個技術分析者，我想要查看股票和加密貨幣的K線圖，這樣我就能進行技術分析。

#### Acceptance Criteria

1. WHEN 使用者點擊股票或加密貨幣 THEN 系統 SHALL 顯示該資產的K線圖
2. WHEN 使用者選擇時間範圍 THEN 系統 SHALL 顯示對應時間範圍的K線圖（1天、1週、1月、3月、1年）
3. WHEN K線圖載入 THEN 系統 SHALL 顯示開盤價、收盤價、最高價、最低價和成交量
4. IF K線資料無法取得 THEN 系統 SHALL 顯示適當的錯誤訊息

## Requirement 4: 直觀的網頁介面

**User Story:** 作為一個使用者，我想要有一個直觀的網頁介面來管理我的追蹤清單，這樣我就能輕鬆使用這個系統。

#### Acceptance Criteria

1. WHEN 使用者訪問網站 THEN 系統 SHALL 顯示清晰的使用者介面
2. WHEN 使用者操作介面 THEN 系統 SHALL 提供響應式設計支援行動裝置
3. WHEN 使用者新增或刪除追蹤項目 THEN 系統 SHALL 即時更新介面
4. WHEN 系統載入資料 THEN 系統 SHALL 顯示載入狀態指示器
5. WHEN 系統發生錯誤 THEN 系統 SHALL 顯示使用者友善的錯誤訊息

## Requirement 5: 可靠的資料來源

**User Story:** 作為系統管理者，我想要系統能穩定地從可靠的資料源獲取股票和加密貨幣資料，這樣系統就能提供準確的資訊。

#### Acceptance Criteria

1. WHEN 系統運行 THEN 系統 SHALL 透過API Routes連接到可靠的美股資料API（如Alpha Vantage或Yahoo Finance）
2. WHEN 系統運行 THEN 系統 SHALL 透過API Routes連接到可靠的加密貨幣資料API（如CoinGecko）
3. WHEN API回應錯誤 THEN 系統 SHALL 實作錯誤處理和重試機制
4. WHEN 系統運行 THEN 系統 SHALL 管理API使用量以避免超過免費額度限制

## Requirement 6: 簡化的全端架構

**User Story:** 作為開發者，我想要系統採用簡化的全端架構並使用免費託管服務，這樣可以降低開發和維護成本。

#### Acceptance Criteria

1. WHEN 系統設計 THEN 系統 SHALL 使用Next.js全端框架整合前後端功能
2. WHEN 系統部署 THEN 系統 SHALL 能夠部署到免費託管平台（Vercel或Netlify）
3. WHEN 資料存儲 THEN 系統 SHALL 使用瀏覽器本地存儲（IndexedDB）管理追蹤清單
4. WHEN 系統運行 THEN 系統 SHALL 不依賴外部資料庫或伺服器基礎設施

## Requirement 7: 未來擴展性

**User Story:** 作為產品規劃者，我想要系統架構能支援未來新增台股功能，這樣系統就能擴展到更多市場。

#### Acceptance Criteria

1. WHEN 系統設計 THEN 資料模型 SHALL 支援多種市場類型（美股、加密貨幣、台股）
2. WHEN 系統設計 THEN API架構 SHALL 支援新增不同資料源
3. WHEN 新增市場類型 THEN 系統 SHALL 不需要重大架構變更
4. WHEN 系統運行 THEN 系統 SHALL 能區分不同市場的交易時間和規則

## Requirement 8: 自動化文件

**User Story:** 作為開發者，我想要每個任務完成後都有詳細的製作流程文件和Git提交記錄，這樣我就能追蹤開發進度和維護程式碼品質。

#### Acceptance Criteria

1. WHEN 任務完成 THEN 系統 SHALL 創建包含詳細製作流程的Markdown文件
2. WHEN 任務完成 THEN 文件 SHALL 包含具體的實作步驟和技術決策說明
3. WHEN 任務完成 THEN 文件 SHALL 提供對應的Git commit內容和訊息
4. WHEN 任務完成 THEN 文件 SHALL 儲存在專案的docs目錄中以便後續參考
5. WHEN 文件創建 THEN 文件 SHALL 包含任務編號、完成日期和相關需求的對應關係

## Requirement 9: 開發標準

**User Story:** 作為開發者，我想要所有程式碼都遵循嚴格的品質標準和中文提交規範，這樣我就能確保程式碼的可維護性和一致性。

#### Acceptance Criteria

1. WHEN 提交程式碼 THEN Git commit 訊息 SHALL 必須使用中文，絕對不可使用英文
2. WHEN 提交程式碼 THEN commit 格式 SHALL 遵循 `feat(task-X): 中文標題` 或 `feat: 中文標題` 格式
3. WHEN 提交程式碼 THEN commit SHALL 包含對應需求編號、相關檔案和 Co-authored-by 標籤
4. WHEN 撰寫程式碼 THEN 程式碼 SHALL 通過 TypeScript 編譯檢查和 ESLint 品質檢查
5. WHEN 新增功能 THEN 功能 SHALL 包含適當的單元測試和錯誤處理機制
