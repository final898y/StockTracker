import { 
  ChartDataPoint, 
  ChartResponse,
  ErrorResponse,
  TimeframeType,
  AssetType 
} from '@/types';
import { ERROR_CODES, TIMEFRAMES } from '@/constants';
import { alphaVantageClient } from './alpha-vantage';
import { coinGeckoClient } from './coingecko';

// Chart data configuration for different timeframes
const TIMEFRAME_CONFIG = {
  '1D': { days: 2, interval: 'hourly' }, // 增加到 2 天以確保包含最新資料
  '1W': { days: 8, interval: 'hourly' }, // 增加到 8 天
  '1M': { days: 32, interval: 'daily' }, // 增加到 32 天
  '3M': { days: 95, interval: 'daily' }, // 增加到 95 天
  '1Y': { days: 370, interval: 'daily' }, // 增加到 370 天
} as const;

export class ChartDataClient {
  /**
   * Get chart data for any asset (stock or crypto)
   */
  async getChartData(
    symbol: string, 
    assetType: AssetType, 
    timeframe: TimeframeType = '1M'
  ): Promise<ChartResponse> {
    if (!symbol.trim()) {
      throw new Error('Symbol is required');
    }

    if (!Object.keys(TIMEFRAMES).includes(timeframe)) {
      throw new Error(`Invalid timeframe: ${timeframe}`);
    }

    try {
      let chartData: ChartDataPoint[];

      if (assetType === 'stock') {
        chartData = await this.getStockChartData(symbol, timeframe);
      } else if (assetType === 'crypto') {
        chartData = await this.getCryptoChartData(symbol, timeframe);
      } else {
        throw new Error(`Unsupported asset type: ${assetType}`);
      }

      return {
        symbol: symbol.toUpperCase(),
        timeframe,
        data: chartData,
      };
    } catch (error) {
      console.error('Chart data error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get stock chart data from Alpha Vantage
   */
  private async getStockChartData(symbol: string, timeframe: TimeframeType): Promise<ChartDataPoint[]> {
    try {
      // For now, Alpha Vantage free tier only provides daily data
      // In a production app, you might want to use different endpoints for intraday data
      const rawData = await alphaVantageClient.getChartData(symbol);
      
      return this.filterDataByTimeframe(rawData, timeframe);
    } catch (error) {
      console.error('Stock chart data error:', error);
      throw error;
    }
  }

  /**
   * Get crypto chart data from CoinGecko
   */
  private async getCryptoChartData(symbol: string, timeframe: TimeframeType): Promise<ChartDataPoint[]> {
    try {
      const config = TIMEFRAME_CONFIG[timeframe];
      const rawData = await coinGeckoClient.getChartData(symbol, config.days);
      
      return this.filterDataByTimeframe(rawData, timeframe);
    } catch (error) {
      console.error('Crypto chart data error:', error);
      throw error;
    }
  }

  /**
   * Filter and format chart data based on timeframe
   */
  private filterDataByTimeframe(data: ChartDataPoint[], timeframe: TimeframeType): ChartDataPoint[] {
    if (!data.length) {
      return [];
    }

    // Sort by timestamp ascending first
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

    let filteredData: ChartDataPoint[];

    // Use time-based filtering but with more lenient cutoff times
    const now = Date.now();
    const config = TIMEFRAME_CONFIG[timeframe];
    
    // For daily stock data, we need to be more flexible with time ranges
    // since Alpha Vantage provides end-of-day data
    let cutoffTime: number;
    
    switch (timeframe) {
      case '1D':
        // For 1D, show data from the last 7 days to ensure we get enough recent data
        cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case '1W':
        // For 1W, show data from the last 10 days
        cutoffTime = now - (10 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        // For 1M, show data from the last 35 days
        cutoffTime = now - (35 * 24 * 60 * 60 * 1000);
        break;
      case '3M':
        // For 3M, show data from the last 95 days
        cutoffTime = now - (95 * 24 * 60 * 60 * 1000);
        break;
      case '1Y':
        // For 1Y, show all available data (Alpha Vantage compact gives ~100 days)
        cutoffTime = 0; // Show all data
        break;
      default:
        cutoffTime = now - (config.days * 24 * 60 * 60 * 1000);
    }

    // Filter data by the calculated cutoff time
    filteredData = sortedData.filter(point => point.timestamp >= cutoffTime);
    
    // If no data after filtering, return the most recent data points
    if (filteredData.length === 0) {
      switch (timeframe) {
        case '1D':
          filteredData = sortedData.slice(-7); // Last 7 days as fallback
          break;
        case '1W':
          filteredData = sortedData.slice(-10); // Last 10 days as fallback
          break;
        case '1M':
          filteredData = sortedData.slice(-30); // Last 30 days as fallback
          break;
        case '3M':
          filteredData = sortedData.slice(-90); // Last 90 days as fallback
          break;
        default:
          filteredData = sortedData; // All data as fallback
      }
    }

    // For shorter timeframes, we might want to sample the data
    if (timeframe === '1D' && filteredData.length > 24) {
      // For 1 day, show hourly data (max 24 points)
      filteredData = this.sampleData(filteredData, 24);
    } else if (timeframe === '1W' && filteredData.length > 168) {
      // For 1 week, show hourly data (max 168 points)
      filteredData = this.sampleData(filteredData, 168);
    } else if (filteredData.length > 365) {
      // For longer periods, limit to max 365 points
      filteredData = this.sampleData(filteredData, 365);
    }

    return filteredData;
  }

  /**
   * Sample data to reduce the number of points while preserving the overall shape
   */
  private sampleData(data: ChartDataPoint[], maxPoints: number): ChartDataPoint[] {
    if (data.length <= maxPoints) {
      return data;
    }

    const step = Math.floor(data.length / maxPoints);
    const sampledData: ChartDataPoint[] = [];

    for (let i = 0; i < data.length; i += step) {
      sampledData.push(data[i]);
    }

    // Always include the last data point
    if (sampledData[sampledData.length - 1] !== data[data.length - 1]) {
      sampledData.push(data[data.length - 1]);
    }

    return sampledData;
  }

  /**
   * Get multiple chart datasets (useful for comparison)
   */
  async getMultipleChartData(
    requests: Array<{ symbol: string; assetType: AssetType; timeframe?: TimeframeType }>
  ): Promise<ChartResponse[]> {
    const promises = requests.map(({ symbol, assetType, timeframe = '1M' }) =>
      this.getChartData(symbol, assetType, timeframe).catch(error => {
        console.warn(`Failed to get chart data for ${symbol}:`, error);
        return null;
      })
    );

    const results = await Promise.all(promises);
    return results.filter((result): result is ChartResponse => result !== null);
  }

  /**
   * Validate chart data quality
   */
  validateChartData(data: ChartDataPoint[]): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!data.length) {
      issues.push('No data points available');
      return { isValid: false, issues };
    }

    // Check for missing or invalid values
    const invalidPoints = data.filter(point => 
      !point.timestamp || 
      isNaN(point.open) || 
      isNaN(point.high) || 
      isNaN(point.low) || 
      isNaN(point.close) ||
      point.high < point.low ||
      point.open < 0 ||
      point.close < 0
    );

    if (invalidPoints.length > 0) {
      issues.push(`${invalidPoints.length} invalid data points found`);
    }

    // Check for data gaps (more than 2x expected interval)
    if (data.length > 1) {
      const intervals = [];
      for (let i = 1; i < data.length; i++) {
        intervals.push(data[i].timestamp - data[i - 1].timestamp);
      }
      
      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const largeGaps = intervals.filter(interval => interval > avgInterval * 2).length;
      
      if (largeGaps > data.length * 0.1) { // More than 10% gaps
        issues.push('Significant data gaps detected');
      }
    }

    // Check for extreme volatility (might indicate data quality issues)
    const priceChanges = data.slice(1).map((point, i) => 
      Math.abs(point.close - data[i].close) / data[i].close
    );
    
    const extremeChanges = priceChanges.filter(change => change > 0.5).length; // 50% changes
    if (extremeChanges > priceChanges.length * 0.05) { // More than 5% extreme changes
      issues.push('Unusual price volatility detected');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get chart data with validation
   */
  async getValidatedChartData(
    symbol: string, 
    assetType: AssetType, 
    timeframe: TimeframeType = '1M'
  ): Promise<ChartResponse & { validation: { isValid: boolean; issues: string[] } }> {
    const chartResponse = await this.getChartData(symbol, assetType, timeframe);
    const validation = this.validateChartData(chartResponse.data);

    return {
      ...chartResponse,
      validation,
    };
  }

  /**
   * Handle and standardize errors
   */
  private handleError(error: unknown): ErrorResponse {
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return {
          errorCode: ERROR_CODES.API_RATE_LIMIT,
          message: 'API rate limit exceeded',
          details: { originalError: error.message },
        };
      }

      if (error.message.includes('not found')) {
        return {
          errorCode: ERROR_CODES.ASSET_NOT_FOUND,
          message: 'Chart data not found',
          details: { originalError: error.message },
        };
      }

      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return {
          errorCode: ERROR_CODES.INVALID_SYMBOL,
          message: error.message,
          details: { originalError: error.message },
        };
      }

      if (error.message.includes('timeout')) {
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
   * Get supported timeframes
   */
  getSupportedTimeframes(): TimeframeType[] {
    return Object.keys(TIMEFRAMES) as TimeframeType[];
  }

  /**
   * Get timeframe configuration
   */
  getTimeframeConfig(timeframe: TimeframeType) {
    return TIMEFRAME_CONFIG[timeframe];
  }

  /**
   * Check if a timeframe is supported
   */
  isTimeframeSupported(timeframe: string): timeframe is TimeframeType {
    return Object.keys(TIMEFRAMES).includes(timeframe);
  }
}

// Export singleton instance
export const chartDataClient = new ChartDataClient();