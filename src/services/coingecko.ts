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
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly rateLimitDelay = 1000; // 1 second between requests for free tier

  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY;
    this.timeout = API_CONFIG.TIMEOUT;
    this.maxRetries = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  /**
   * Search for cryptocurrencies by name or symbol
   */
  async searchCrypto(query: string): Promise<CryptoSearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const response = await this.makeRequest<CoinGeckoSearchResponse>('/search', {
        query: query.trim(),
      });

      if (!response.coins) {
        return [];
      }

      return response.coins
        .slice(0, 10) // Limit to top 10 results
        .map(coin => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          image: coin.large,
        }));
    } catch (error) {
      console.error('CoinGecko search error:', error);
      throw this.handleError(error);
    }
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
   * Enforce rate limiting for free tier (50 calls/minute)
   */
  private async enforceRateLimit(): Promise<void> {
    if (!this.apiKey) { // Free tier rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.rateLimitDelay) {
        const waitTime = this.rateLimitDelay - timeSinceLastRequest;
        await this.delay(waitTime);
      }
    }
  }

  /**
   * Handle and standardize errors
   */
  private handleError(error: unknown): ErrorResponse {
    if (error instanceof Error) {
      if (error.message.includes('Rate limit') || error.message.includes('rate limit') || error.message.includes('429')) {
        return {
          errorCode: ERROR_CODES.API_RATE_LIMIT,
          message: 'API rate limit exceeded',
          details: { originalError: error.message },
        };
      }

      if (error.message.includes('not found') || error.message.includes('404')) {
        return {
          errorCode: ERROR_CODES.ASSET_NOT_FOUND,
          message: 'Cryptocurrency not found',
          details: { originalError: error.message },
        };
      }

      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return {
          errorCode: ERROR_CODES.NETWORK_ERROR,
          message: 'Request timeout',
          details: { originalError: error.message },
        };
      }

      return {
        errorCode: ERROR_CODES.EXTERNAL_API_ERROR,
        message: error.message,
        details: { originalError: error.message },
      };
    }

    return {
      errorCode: ERROR_CODES.EXTERNAL_API_ERROR,
      message: 'Unknown error occurred',
      details: { originalError: String(error) },
    };
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
    return {
      hasApiKey: this.isConfigured(),
      provider: 'CoinGecko',
      requestCount: this.requestCount,
      tier: this.apiKey ? 'Pro' : 'Free',
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