// Error codes and constants

export const ERROR_CODES = {
  ASSET_NOT_FOUND: "ASSET_NOT_FOUND",
  API_RATE_LIMIT: "API_RATE_LIMIT", 
  EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR",
  INVALID_SYMBOL: "INVALID_SYMBOL",
  NETWORK_ERROR: "NETWORK_ERROR"
} as const;

// API endpoints
export const API_ENDPOINTS = {
  STOCKS: {
    SEARCH: '/api/stocks/search',
    DETAILS: '/api/stocks',
  },
  CRYPTO: {
    SEARCH: '/api/crypto/search',
    DETAILS: '/api/crypto',
  },
  CHARTS: '/api/charts',
} as const;

// Cache TTL (Time To Live) in milliseconds
export const CACHE_TTL = {
  PRICE_DATA: 60 * 1000, // 1 minute
  CHART_DATA: 5 * 60 * 1000, // 5 minutes
  SEARCH_RESULTS: 10 * 60 * 1000, // 10 minutes
} as const;

// Chart timeframes
export const TIMEFRAMES = {
  '1D': '1D',
  '1W': '1W', 
  '1M': '1M',
  '3M': '3M',
  '1Y': '1Y',
} as const;

// Asset types
export const ASSET_TYPES = {
  STOCK: 'stock',
  CRYPTO: 'crypto',
} as const;

// IndexedDB configuration
export const DB_CONFIG = {
  NAME: 'StockTrackerDB',
  VERSION: 1,
  STORES: {
    WATCHLIST: 'watchlist',
    PRICE_CACHE: 'priceCache',
    CHART_CACHE: 'chartCache',
  },
} as const;

// API configuration
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// UI constants
export const UI_CONFIG = {
  SEARCH_DEBOUNCE_MS: 300,
  PRICE_UPDATE_INTERVAL_MS: 60000, // 1 minute
  MAX_WATCHLIST_ITEMS: 50,
  CHART_HEIGHT: 400,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.ASSET_NOT_FOUND]: '找不到指定的資產',
  [ERROR_CODES.API_RATE_LIMIT]: 'API 請求次數已達上限，請稍後再試',
  [ERROR_CODES.EXTERNAL_API_ERROR]: '外部 API 發生錯誤',
  [ERROR_CODES.INVALID_SYMBOL]: '無效的股票或加密貨幣代碼',
  [ERROR_CODES.NETWORK_ERROR]: '網路連線發生錯誤',
} as const;