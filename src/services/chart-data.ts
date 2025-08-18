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
  '1D': { days: 1, interval: 'hourly' },
  '1W': { days: 7, interval: 'hourly' },
  '1M': { days: 30, interval: 'daily' },
  '3M': { days: 90, interval: 'daily' },
  '1Y': { days: 365, interval: 'daily' },
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

    const now = Date.now();
    const config = TIMEFRAME_CONFIG[timeframe];
    const cutoffTime = now - (config.days * 24 * 60 * 60 * 1000);

    // Filter data by timeframe
    let filteredData = data.filter(point => point.timestamp >= cutoffTime);

    // Sort by timestamp ascending
    filteredData.sort((a, b) => a.timestamp - b.timestamp);

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