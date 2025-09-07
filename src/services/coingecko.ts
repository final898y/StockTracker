import { 
  CryptoSearchResult, 
  CryptoDetailsResponse, 
  ChartDataPoint,
  ErrorResponse 
} from '@/types';
import { ERROR_CODES, API_CONFIG } from '@/constants';

// CoinGecko API response interfaces
interface CoinGeckoSearchResponse {
  coins: Array<{
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    large: string;
  }>;
}

// Removed unused interface - keeping for future use if needed
// interface CoinGeckoPriceResponse {
//   [coinId: string]: {
//     usd: number;
//     usd_24h_change: number;
//     usd_market_cap: number;
//     usd_24h_vol: number;
//     last_updated_at: number;
//   };
// }

interface CoinGeckoMarketResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

interface CoinGeckoChartResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export class CoinGeckoClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly rateLimitDelay = 1200; // 1.2 seconds between requests for Demo plan (50 calls/minute = 1.2s interval)
  
  // Simple in-memory cache to reduce API calls
  private searchCache = new Map<string, { data: CryptoSearchResult[]; timestamp: number }>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY;
    
    // According to CoinGecko docs:
    // - Demo plan (Public API users) must use api.coingecko.com
    // - Only paid Pro subscribers should use pro-api.coingecko.com
    // Since we're using Demo plan, always use the standard API URL
    this.baseUrl = 'https://api.coingecko.com/api/v3';
      
    this.timeout = API_CONFIG.TIMEOUT;
    this.maxRetries = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
    
    if (process.env.NODE_ENV === 'development') {
      const tier = this.apiKey ? 'Demo' : 'Free';
      console.log(`CoinGecko Client initialized with ${tier} tier, URL: ${this.baseUrl}`);
    }
  }

  /**
   * Search for cryptocurrencies by name or symbol
   */
  async searchCrypto(query: string): Promise<CryptoSearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    
    // Check cache first
    const cached = this.searchCache.get(normalizedQuery);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Returning cached search results for: ${normalizedQuery}`);
      return cached.data;
    }

    try {
      // First try the dedicated search endpoint
      const response = await this.makeRequest<CoinGeckoSearchResponse>('/search', {
        query: normalizedQuery,
      });

      if (!response || !response.coins || !Array.isArray(response.coins)) {
        console.warn('CoinGecko search returned no coins data, trying fallback method');
        return await this.searchCryptoFallback(query);
      }

      const results = response.coins
        .slice(0, 10) // Limit to top 10 results
        .map(coin => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          image: coin.large || coin.thumb, // Fallback to thumb if large not available
        }));

      // Cache the results
      this.searchCache.set(normalizedQuery, { data: results, timestamp: Date.now() });
      
      return results;
    } catch (error) {
      console.error('CoinGecko search error, trying fallback:', error);
      
      // Try fallback method if search endpoint fails
      try {
        const fallbackResults = await this.searchCryptoFallback(query);
        
        // Cache fallback results too
        this.searchCache.set(normalizedQuery, { data: fallbackResults, timestamp: Date.now() });
        
        return fallbackResults;
      } catch (fallbackError) {
        console.error('CoinGecko fallback search also failed:', fallbackError);
        return Promise.reject(this.handleError(fallbackError)); // Throw fallback error
      }
    }
  }

  /**
   * Fallback search using markets endpoint when search endpoint fails
   */
  private async searchCryptoFallback(query: string): Promise<CryptoSearchResult[]> {
    const normalizedQuery = query.trim().toLowerCase();
    
    // Get top 250 cryptocurrencies and filter locally
    const response = await this.makeRequest<CoinGeckoMarketResponse[]>('/coins/markets', {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: '250',
      page: '1',
      sparkline: 'false',
    });

    if (!response || !Array.isArray(response)) {
      return [];
    }

    // Filter by symbol or name match
    const matches = response.filter(coin => 
      coin.symbol.toLowerCase().includes(normalizedQuery) ||
      coin.name.toLowerCase().includes(normalizedQuery) ||
      coin.id.toLowerCase().includes(normalizedQuery)
    );

    return matches
      .slice(0, 10) // Limit to top 10 results
      .map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
      }));
  }

  /**
   * Get current cryptocurrency price and details
   */
  async getCryptoDetails(coinId: string): Promise<CryptoDetailsResponse> {
    if (!coinId.trim()) {
      throw new Error('Coin ID is required');
    }

    try {
      // Use the markets endpoint for more comprehensive data
      const response = await this.makeRequest<CoinGeckoMarketResponse[]>('/coins/markets', {
        vs_currency: 'usd',
        ids: coinId.trim().toLowerCase(),
        order: 'market_cap_desc',
        per_page: '1',
        page: '1',
        sparkline: 'false',
        price_change_percentage: '24h',
      });

      if (!response || response.length === 0) {
        throw new Error(`Cryptocurrency not found: ${coinId}`);
      }

      const coin = response[0];

      return {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        price_change_24h: coin.price_change_24h || 0,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
        market_cap: coin.market_cap || 0,
        total_volume: coin.total_volume || 0,
        last_updated: coin.last_updated,
      };
    } catch (error) {
      console.error('CoinGecko details error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get multiple cryptocurrency prices (batch request)
   */
  async getCryptoPrices(coinIds: string[]): Promise<Record<string, CryptoDetailsResponse>> {
    if (!coinIds.length) {
      return {};
    }

    try {
      const idsParam = coinIds.map(id => id.toLowerCase()).join(',');
      const response = await this.makeRequest<CoinGeckoMarketResponse[]>('/coins/markets', {
        vs_currency: 'usd',
        ids: idsParam,
        order: 'market_cap_desc',
        per_page: coinIds.length.toString(),
        page: '1',
        sparkline: 'false',
        price_change_percentage: '24h',
      });

      const result: Record<string, CryptoDetailsResponse> = {};

      response.forEach(coin => {
        result[coin.id] = {
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price,
          price_change_24h: coin.price_change_24h || 0,
          price_change_percentage_24h: coin.price_change_percentage_24h || 0,
          market_cap: coin.market_cap || 0,
          total_volume: coin.total_volume || 0,
          last_updated: coin.last_updated,
        };
      });

      return result;
    } catch (error) {
      console.error('CoinGecko batch prices error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get historical chart data for a cryptocurrency
   */
  async getChartData(coinId: string, days: number = 30): Promise<ChartDataPoint[]> {
    if (!coinId.trim()) {
      throw new Error('Coin ID is required');
    }

    try {
      const response = await this.makeRequest<CoinGeckoChartResponse>(`/coins/${coinId.toLowerCase()}/market_chart`, {
        vs_currency: 'usd',
        days: days.toString(),
        interval: days <= 1 ? 'hourly' : 'daily',
      });

      if (!response.prices || response.prices.length === 0) {
        throw new Error(`Chart data not found for coin: ${coinId}`);
      }

      // CoinGecko returns OHLC data differently, we need to simulate it from price data
      const chartData: ChartDataPoint[] = [];
      
      for (let i = 0; i < response.prices.length; i++) {
        const [timestamp, price] = response.prices[i];
        const volume = response.total_volumes[i] ? response.total_volumes[i][1] : 0;
        
        // For crypto, we simulate OHLC from price points
        // This is a simplified approach - in reality, you'd want proper OHLC data
        const prevPrice = i > 0 ? response.prices[i - 1][1] : price;
        const nextPrice = i < response.prices.length - 1 ? response.prices[i + 1][1] : price;
        
        chartData.push({
          timestamp,
          open: prevPrice,
          high: Math.max(prevPrice, price, nextPrice),
          low: Math.min(prevPrice, price, nextPrice),
          close: price,
          volume,
        });
      }

      return chartData;
    } catch (error) {
      console.error('CoinGecko chart data error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get trending cryptocurrencies
   */
  async getTrendingCrypto(): Promise<CryptoSearchResult[]> {
    try {
      const response = await this.makeRequest<{ coins: Array<{ item: CoinGeckoSearchResponse['coins'][0] }> }>('/search/trending');

      return response.coins
        .slice(0, 10)
        .map(({ item }) => ({
          id: item.id,
          symbol: item.symbol.toUpperCase(),
          name: item.name,
          image: item.large,
        }));
    } catch (error) {
      console.error('CoinGecko trending error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Make HTTP request to CoinGecko API with rate limiting and retry logic
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    // Implement rate limiting for free tier
    await this.enforceRateLimit();

    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'StockTracker/1.0',
    };

    // Add API key if available (for pro tier)
    if (this.apiKey) {
      headers['x-cg-pro-api-key'] = this.apiKey;
    }

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`CoinGecko API Request: ${url.toString()}`);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Log response details for debugging
          const responseText = await response.text();
          console.error(`CoinGecko API Error Response (${response.status}):`, responseText);
          
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        this.requestCount++;
        this.lastRequestTime = Date.now();

        return data as T;
      } catch (error) {
        lastError = error as Error;
        console.warn(`CoinGecko API attempt ${attempt} failed:`, error);

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          await this.delay(delay);
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Enforce rate limiting for Demo plan (50 calls/minute) and Free tier (10-30 calls/minute)
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      await this.delay(waitTime);
    }
  }

  /**
   * Handle and standardize errors
   */
  private handleError(error: unknown): Error {
    let errorResponse: ErrorResponse;

    if (error instanceof Error) {
      if (error.message.includes('Rate limit') || error.message.includes('rate limit') || error.message.includes('429')) {
        errorResponse = {
          errorCode: ERROR_CODES.API_RATE_LIMIT,
          message: 'API rate limit exceeded',
          details: { originalError: error.message },
        };
      } else if (error.message.includes('not found') || error.message.includes('404')) {
        errorResponse = {
          errorCode: ERROR_CODES.ASSET_NOT_FOUND,
          message: 'Cryptocurrency not found',
          details: { originalError: error.message },
        };
      } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorResponse = {
          errorCode: ERROR_CODES.NETWORK_ERROR,
          message: 'Request timeout',
          details: { originalError: error.message },
        };
      } else {
        errorResponse = {
          errorCode: ERROR_CODES.EXTERNAL_API_ERROR,
          message: error.message,
          details: { originalError: error.message },
        };
      }
    } else {
      errorResponse = {
        errorCode: ERROR_CODES.EXTERNAL_API_ERROR,
        message: 'Unknown error occurred',
        details: { originalError: String(error) },
      };
    }
    
    const customError = new Error(JSON.stringify(errorResponse));
    customError.name = errorResponse.errorCode;
    return customError;
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get API usage info
   */
  getUsageInfo(): { hasApiKey: boolean; provider: string; requestCount: number; tier: string } {
    const tier = this.apiKey ? 'Demo' : 'Free';
    
    return {
      hasApiKey: this.isConfigured(),
      provider: 'CoinGecko',
      requestCount: this.requestCount,
      tier,
    };
  }

  /**
   * Reset request counter (useful for testing)
   */
  resetRequestCount(): void {
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }
}

// Export singleton instance
export const coinGeckoClient = new CoinGeckoClient();