// API-specific types and interfaces

// Base API response wrapper
export interface BaseApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp?: string;
}

// External API provider types
export interface AlphaVantageQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

export interface AlphaVantageSearchMatch {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

export interface CoinGeckoSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

export interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_data: {
    current_price: {
      usd: number;
    };
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
  };
  last_updated: string;
}

// Request/Response types for our API routes
export interface SearchRequest {
  query: string;
  limit?: number;
}

export interface PriceRequest {
  symbol: string;
  assetType: 'stock' | 'crypto';
}

export interface ChartRequest {
  symbol: string;
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
  assetType: 'stock' | 'crypto';
}

// Normalized response types (what our API returns)
export interface NormalizedAsset {
  symbol: string;
  name: string;
  assetType: 'stock' | 'crypto';
  exchange?: string;
  currency?: string;
}

export interface NormalizedPrice {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: number;
  timestamp: string;
}

export interface NormalizedChartData {
  symbol: string;
  timeframe: string;
  data: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}