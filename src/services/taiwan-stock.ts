import { IStockDataProvider } from './data-providers';
import { StockSearchResult, StockDetailsResponse, ChartResponse, TimeframeType } from '@/types';

export class TaiwanStockClient implements IStockDataProvider {
  private readonly baseUrl = 'https://mock-taiwan-stock-api.com'; // Placeholder URL

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    console.warn('TaiwanStockClient: searchStocks not fully implemented, returning mock data.');
    // Mock data for demonstration
    if (query.toLowerCase().includes('tsmc')) {
      return [{ symbol: '2330.TW', name: 'Taiwan Semiconductor Manufacturing Company Limited', assetType: 'stock', exchange: 'TWSE', market: 'TW' }];
    }
    return [];
  }

  async getStockDetails(symbol: string): Promise<StockDetailsResponse> {
    console.warn('TaiwanStockClient: getStockDetails not fully implemented, returning mock data.');
    // Mock data for demonstration
    return {
      symbol: symbol,
      name: 'Mock Taiwan Stock',
      assetType: 'stock',
      exchange: 'TWSE',
      market: 'TW',
      currentPrice: 100,
      priceChange: 1,
      priceChangePercent: 1,
      high: 101,
      low: 99,
      open: 99.5,
      previousClose: 99,
      volume: 100000,
      marketCap: 1000000000,
      peRatio: 20,
      dividendYield: 2,
    };
  }

  async getStockChartData(symbol: string, timeframe: TimeframeType): Promise<ChartResponse> {
    console.warn('TaiwanStockClient: getStockChartData not fully implemented, returning mock data.');
    // Mock data for demonstration
    const mockData = Array.from({ length: 30 }).map((_, i) => ({
      time: `2025-08-${String(i + 1).padStart(2, '0')}`,
      open: 100 + Math.random() * 10 - 5,
      high: 105 + Math.random() * 5,
      low: 95 - Math.random() * 5,
      close: 100 + Math.random() * 10 - 5,
    }));
    return { symbol, timeframe, data: mockData };
  }
}

export const taiwanStockClient = new TaiwanStockClient();
