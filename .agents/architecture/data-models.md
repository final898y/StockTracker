# 資料模型 (Data Models)

## 客戶端資料模型 (Client-Side Data Models)

```typescript
// TypeScript 介面定義
interface Asset {
  symbol: string;
  name: string;
  assetType: 'stock' | 'crypto';
  exchange?: string;
}

interface PriceData {
  price: number;
  volume?: number;
  marketCap?: number;
  change24h?: number;
  timestamp: Date;
}

interface CandlestickData {
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;
  timestamp: Date;
}

interface WatchlistItem {
  asset: Asset;
  currentPrice?: PriceData;
  addedAt: Date;
}

interface ChartData {
  symbol: string;
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
  candlesticks: CandlestickData[];
  lastUpdated: Date;
}
```

## IndexedDB 結構 (IndexedDB Schema)

```typescript
// IndexedDB 資料庫結構
interface WatchlistDB {
  id?: number;
  symbol: string;
  name: string;
  assetType: 'stock' | 'crypto';
  exchange?: string;
  addedAt: Date;
}

interface PriceCacheDB {
  id?: number;
  symbol: string;
  price: number;
  volume?: number;
  marketCap?: number;
  change24h?: number;
  timestamp: Date;
  expiresAt: Date; // 快取過期時間
}

interface ChartCacheDB {
  id?: number;
  symbol: string;
  timeframe: string;
  data: CandlestickData[];
  lastUpdated: Date;
  expiresAt: Date;
}
```

## API 錯誤回應 (API Error Responses)

```typescript
interface ErrorResponse {
  errorCode: string;
  message: string;
  details?: Record<string, any>;
}

// 標準錯誤碼
const ERROR_CODES = {
  ASSET_NOT_FOUND: "ASSET_NOT_FOUND",
  API_RATE_LIMIT: "API_RATE_LIMIT", 
  EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR",
  INVALID_SYMBOL: "INVALID_SYMBOL",
  NETWORK_ERROR: "NETWORK_ERROR"
} as const;
```
