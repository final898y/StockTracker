# 股票追蹤器 (Stock Tracker)

[![Built with Gemini](https://img.shields.io/badge/Built_with-Gemini_CLI-4285F4)](https://github.com/google/gemini-cli)
[![Powered by Kiro](https://img.shields.io/badge/Powered_by-Kiro-2B2B2B)](https://github.com/kiro-ai/kiro)

這是一個使用 Next.js 14 建立的股票和加密貨幣價格追蹤網站，支援即時價格查詢和 K 線圖表顯示。

## 🚀 一個實驗性的開發範式 (An Experimental Development Paradigm)

本專案是一個完全採用 AI 驅動開發的實驗。從概念到部署，整個過程都由 [Kiro](https://github.com/kiro-ai/kiro) 和 Google 的 Gemini CLI 協同完成。

我們的核心方法論是 **規格驅動開發 (Spec-Driven Development)** 和 **氛圍編程 (Vibe Coding)**。開發者不直接編寫產品程式碼，而是專注於撰寫和維護極度詳細的規格文件（位於專案根目錄的 `.agents` 資料夾中）。AI 代理則負責讀取這些規格，並將其轉化為功能完整的程式碼。

這個專案的終極目標是測試一個大膽的假設：**我們能否在不手動編寫任何一行產品程式碼的情況下，僅僅透過與 AI 溝通和定義規格，就成功打造出一個功能齊全的網站？**

---

## 功能特色

- 🏢 **美股追蹤**: 搜尋和追蹤美國股票價格
- 🪙 **加密貨幣**: 支援主流加密貨幣價格監控
- 📊 **K 線圖表**: 專業的技術分析圖表
- 💾 **本地存儲**: 使用 IndexedDB 本地保存追蹤清單
- 📱 **響應式設計**: 支援桌面和行動裝置
- ⚡ **即時更新**: 自動更新價格資訊

## 技術架構

- **前端框架**: Next.js 14 + TypeScript
- **狀態管理**: Zustand + TanStack Query
- **UI 框架**: Tailwind CSS
- **圖表庫**: TradingView Lightweight Charts
- **資料存儲**: IndexedDB (瀏覽器本地)
- **部署平台**: Vercel / Netlify

## 開始使用

### 環境需求

- Node.js 18.17 或更高版本
- npm 或 yarn

### 安裝步驟

1. 複製環境變數檔案：

```bash
cp .env.local.example .env.local
```

2. 編輯 `.env.local` 並添加你的 API 金鑰：

```bash
ALPHA_VANTAGE_API_KEY=your_api_key_here
COINGECKO_API_KEY=your_api_key_here
```

3. 安裝依賴套件：

```bash
npm install
```

4. 啟動開發伺服器：

```bash
npm run dev
```

5. 開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 可用指令

```bash
npm run dev          # 啟動開發伺服器
npm run build        # 建置生產版本
npm run start        # 啟動生產伺服器
npm run lint         # 執行程式碼檢查
```

## API 金鑰申請

### Alpha Vantage (美股資料)

1. 訪問 [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. 免費註冊並獲取 API 金鑰
3. 免費版本每分鐘限制 5 次請求

### CoinGecko (加密貨幣資料)

1. 訪問 [CoinGecko API](https://www.coingecko.com/en/api)
2. 免費版本每分鐘限制 30 次請求
3. 付費版本可獲得更高限制

## 專案結構

```
src/
├── app/                 # Next.js App Router 頁面
├── components/          # React 組件
├── hooks/              # 自定義 React Hooks
├── lib/                # 工具函數和配置
├── services/           # API 客戶端和資料服務
├── stores/             # Zustand 狀態管理
├── types/              # TypeScript 型別定義
└── constants/          # 常數定義
```

## 部署

### Vercel (推薦)

1. 推送程式碼到 GitHub
2. 在 Vercel 中匯入專案
3. 設定環境變數
4. 自動部署完成

### Netlify

1. 推送程式碼到 GitHub
2. 在 Netlify 中匯入專案
3. 建置指令: `npm run build`
4. 發布目錄: `.next`

## 貢獻

本專案的貢獻模式與傳統專案不同。由於所有程式碼皆由 AI 生成，**請不要直接修改 `src` 目錄下的程式碼**。

若要貢獻，請遵循 **規格驅動開發** 的流程：

1.  更新或新增位於專案根目錄 `.gemini-agents/` 目錄下的規格文件。
2.  提交一個 Pull Request 描述您對規格的變更。
3.  一旦規格被接受，我們將指示 AI 代理根據新的規格重新生成或修改程式碼。

## 授權

MIT License
