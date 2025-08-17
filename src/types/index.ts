// Core data models and TypeScript interfaces

// Re-export API types
export * from './api';

// Re-export validators
export * from './validators';

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
}

// Stock API Response types
export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  type: string;
}

export interface StockSearchResponse {
  results: StockSearchResult[];
}

export interface StockDetailsResponse {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: string;
}

// Crypto API Response types
export interface CryptoSearchResult {
  id: string;
  symbol: string;
  name: string;
  image?: string;
}

export interface CryptoSearchResponse {
  results: CryptoSearchResult[];
}

export interface CryptoDetailsResponse {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  last_updated: string;
}

// Chart API Response types
export interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartResponse {
  symbol: string;
  timeframe: string;
  data: ChartDataPoint[];
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

// Utility types and enums
export type AssetType = 'stock' | 'crypto';

export type TimeframeType = '1D' | '1W' | '1M' | '3M' | '1Y';

export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface LoadingStatus {
  state: LoadingState;
  error?: string;
}

// Search related types
export interface SearchState {
  query: string;
  results: (StockSearchResult | CryptoSearchResult)[];
  loading: boolean;
  error?: string;
}

// Watchlist management types
export interface WatchlistState {
  items: WatchlistItem[];
  loading: boolean;
  error?: string;
}

// Chart state types
export interface ChartState {
  symbol?: string;
  timeframe: TimeframeType;
  data: CandlestickData[];
  loading: boolean;
  error?: string;
}

// Application state types
export interface AppState {
  watchlist: WatchlistState;
  search: SearchState;
  chart: ChartState;
}