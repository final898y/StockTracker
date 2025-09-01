import { 
  StockSearchResult, 
  StockDetailsResponse, 
  ChartDataPoint,
  ErrorResponse 
} from '@/types';
import { ERROR_CODES, API_CONFIG } from '@/constants';

// Alpha Vantage API response interfaces
interface AlphaVantageSearchResponse {
  bestMatches: Array<{
    '1. symbol': string;
    '2. name': string;
    '3. type': string;
    '4. region': string;
    '5. marketOpen': string;
    '6. marketClose': string;
    '7. timezone': string;
    '8. currency': string;
    '9. matchScore': string;
  }>;
}

interface AlphaVantageQuoteResponse {
  'Global Quote': {
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
  };
}

interface AlphaVantageTimeSeriesResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Interval': string;
    '5. Output Size': string;
    '6. Time Zone': string;
  };
  'Time Series (Daily)': Record<string, {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  }>;
}

export class AlphaVantageClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.alphavantage.co/query';
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || '';
    this.timeout = API_CONFIG.TIMEOUT;
    this.maxRetries = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;

    if (!this.apiKey) {
      console.warn('Alpha Vantage API key not found in environment variables');
    }
  }

  /**
   * Search for US stocks by symbol or company name
   */
  async searchStocks(query: string): Promise<StockSearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    // Return mock data if API key is not configured (for development)
    if (!this.isConfigured()) {
      return this.getMockSearchResults(query);
    }

    try {
      const response = await this.makeRequest<AlphaVantageSearchResponse>({
        function: 'SYMBOL_SEARCH',
        keywords: query.trim(),
      });

      if (!response.bestMatches) {
        return [];
      }

      return response.bestMatches
        .filter(match => match['3. type'] === 'Equity' && match['4. region'] === 'United States')
        .slice(0, 10) // Limit to top 10 results
        .map(match => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          exchange: 'US', // Alpha Vantage primarily covers US markets
          currency: match['8. currency'] || 'USD',
          type: 'stock',
        }));
    } catch (error) {
      console.error('Alpha Vantage search error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get current stock price and details
   */
  async getStockDetails(symbol: string): Promise<StockDetailsResponse> {
    if (!symbol.trim()) {
      throw new Error('Stock symbol is required');
    }

    // Return mock data if API key is not configured (for development)
    if (!this.isConfigured()) {
      return this.getMockStockDetails(symbol);
    }

    try {
      const response = await this.makeRequest<AlphaVantageQuoteResponse>({
        function: 'GLOBAL_QUOTE',
        symbol: symbol.trim().toUpperCase(),
      });

      const quote = response['Global Quote'];
      if (!quote || !quote['01. symbol']) {
        throw new Error(`Stock not found: ${symbol}`);
      }

      const price = parseFloat(quote['05. price']);
      const change = parseFloat(quote['09. change']);
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
      const volume = parseInt(quote['06. volume']);

      return {
        symbol: quote['01. symbol'],
        name: quote['01. symbol'], // Alpha Vantage doesn't provide company name in quote
        exchange: 'US',
        currency: 'USD',
        price,
        change,
        changePercent,
        volume,
        marketCap: undefined, // Not available in basic quote
        timestamp: quote['07. latest trading day'],
      };
    } catch (error) {
      console.error('Alpha Vantage quote error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get historical chart data for a stock
   */
  async getChartData(symbol: string): Promise<ChartDataPoint[]> {
    if (!symbol.trim()) {
      throw new Error('Stock symbol is required');
    }

    // Return mock data if API key is not configured (for development)
    if (!this.isConfigured()) {
      return this.getMockChartData();
    }

    try {
      const response = await this.makeRequest<AlphaVantageTimeSeriesResponse>({
        function: 'TIME_SERIES_DAILY',
        symbol: symbol.trim().toUpperCase(),
        outputsize: 'compact', // Last 100 data points
      });

      const timeSeries = response['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error(`Chart data not found for symbol: ${symbol}`);
      }

      const chartData: ChartDataPoint[] = [];
      
      // Convert Alpha Vantage data to our format
      Object.entries(timeSeries)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime()) // Sort by date ascending
        .forEach(([date, data]) => {
          chartData.push({
            timestamp: new Date(date).getTime(),
            open: parseFloat(data['1. open']),
            high: parseFloat(data['2. high']),
            low: parseFloat(data['3. low']),
            close: parseFloat(data['4. close']),
            volume: parseInt(data['5. volume']),
          });
        });

      return chartData;
    } catch (error) {
      console.error('Alpha Vantage chart data error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Make HTTP request to Alpha Vantage API with retry logic
   */
  private async makeRequest<T>(params: Record<string, string>): Promise<T> {
    const url = new URL(this.baseUrl);
    url.searchParams.append('apikey', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'StockTracker/1.0',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Check for Alpha Vantage API errors
        if (data['Error Message']) {
          throw new Error(data['Error Message']);
        }

        if (data['Note']) {
          throw new Error('API rate limit exceeded. Please try again later.');
        }

        // Check for rate limit information message
        if (data['Information'] && data['Information'].includes('rate limit')) {
          throw new Error('API rate limit exceeded. Please try again later.');
        }

        return data as T;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Alpha Vantage API attempt ${attempt} failed:`, error);

        // Don't retry for rate limit errors to avoid wasting API quota
        if (error instanceof Error && error.message.includes('rate limit')) {
          console.warn('Rate limit detected, stopping retries to preserve API quota');
          throw error;
        }

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Handle and standardize errors
   */
  private handleError(error: unknown): ErrorResponse {
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('API call frequency')) {
        return {
          errorCode: ERROR_CODES.API_RATE_LIMIT,
          message: 'Alpha Vantage API 每日使用限制已達上限，請明天再試或升級到付費方案',
          details: { originalError: error.message },
        };
      }

      if (error.message.includes('not found') || error.message.includes('Invalid API call')) {
        return {
          errorCode: ERROR_CODES.ASSET_NOT_FOUND,
          message: '找不到該股票代碼',
          details: { originalError: error.message },
        };
      }

      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return {
          errorCode: ERROR_CODES.NETWORK_ERROR,
          message: '請求超時，請稍後再試',
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
      message: '發生未知錯誤',
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
   * Get API usage info (basic implementation)
   */
  getUsageInfo(): { hasApiKey: boolean; provider: string } {
    return {
      hasApiKey: this.isConfigured(),
      provider: 'Alpha Vantage',
    };
  }

  /**
   * Mock search results for development (when API key is not configured)
   */
  private getMockSearchResults(query: string): StockSearchResult[] {
    const mockStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', currency: 'USD', type: 'stock' as const },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', currency: 'USD', type: 'stock' as const },
      { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', currency: 'USD', type: 'stock' as const },
      { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', currency: 'USD', type: 'stock' as const },
      { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', currency: 'USD', type: 'stock' as const },
      { symbol: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ', currency: 'USD', type: 'stock' as const },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', currency: 'USD', type: 'stock' as const },
      { symbol: 'NFLX', name: 'Netflix, Inc.', exchange: 'NASDAQ', currency: 'USD', type: 'stock' as const },
    ];

    const queryLower = query.toLowerCase();
    return mockStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(queryLower) || 
      stock.name.toLowerCase().includes(queryLower)
    ).slice(0, 5);
  }

  /**
   * Mock stock details for development (when API key is not configured)
   */
  private getMockStockDetails(symbol: string): StockDetailsResponse {
    const basePrice = 150 + Math.random() * 200; // Random price between 150-350
    const change = (Math.random() - 0.5) * 10; // Random change between -5 to +5
    const changePercent = (change / basePrice) * 100;

    return {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Company`,
      exchange: 'NASDAQ',
      currency: 'USD',
      price: Math.round(basePrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
      timestamp: new Date().toISOString().split('T')[0],
    };
  }

  /**
   * Mock chart data for development (when API key is not configured)
   */
  private getMockChartData(): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const basePrice = 150 + Math.random() * 200;
    let currentPrice = basePrice;
    
    // Generate 30 days of mock data
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Random price movement
      const change = (Math.random() - 0.5) * 10;
      currentPrice = Math.max(10, currentPrice + change);
      
      const open = currentPrice;
      const high = open + Math.random() * 5;
      const low = open - Math.random() * 5;
      const close = low + Math.random() * (high - low);
      
      data.push({
        timestamp: date.getTime(),
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: Math.floor(Math.random() * 5000000) + 1000000,
      });
      
      currentPrice = close;
    }
    
    return data;
  }
}

// Export singleton instance
export const alphaVantageClient = new AlphaVantageClient();