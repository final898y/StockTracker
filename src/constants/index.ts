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