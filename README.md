# 股票追蹤器 (Stock Tracker)

一個使用 Next.js 14 建立的股票和加密貨幣價格追蹤網站，支援即時價格查詢和 K 線圖表顯示。

## 功能特色

- 🏢 **美股追蹤**: 搜尋和追蹤美國股票價格
- 🪙 **加密貨幣**: 支援主流加密貨幣價格監控
- 📊 **K線圖表**: 專業的技術分析圖表
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

歡迎提交 Issue 和 Pull Request 來改善這個專案。

## 授權

MIT License