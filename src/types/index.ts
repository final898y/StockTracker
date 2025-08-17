// Core data models and TypeScript interfaces

export interface Asset {
  symbol: string;
  name: string;
  assetType: 'stock' | 'crypto';
  exchange?: string;
}

export interface PriceData {
  price: number;
  volume?: number;
  marketCap?: number;
  change24h?: number;
  timestamp: Date;
}

export interface CandlestickData {
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;
  timestamp: Date;
}

export interface WatchlistItem {
  asset: Asset;
  currentPrice?: PriceData;
  addedAt: Date;
}

export interface ChartData {
  symbol: string;
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
  candlesticks: CandlestickData[];
  lastUpdated: Date;
}

// API Response types
export interface ErrorResponse {
  errorCode: string;
  message: string;
  details?: Record<string, unknown>;
}

// IndexedDB Schema types
export interface WatchlistDB {
  id?: number;
  symbol: string;
  name: string;
  assetType: 'stock' | 'crypto';
  exchange?: string;
  addedAt: Date;
}

export interface PriceCacheDB {
  id?: number;
  symbol: string;
  price: number;
  volume?: number;
  marketCap?: number;
  change24h?: number;
  timestamp: Date;
  expiresAt: Date;
}

export interface ChartCacheDB {
  id?: number;
  symbol: string;
  timeframe: string;
  data: CandlestickData[];
  lastUpdated: Date;
  expiresAt: Date;
}