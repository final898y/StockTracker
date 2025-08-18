import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChartDataClient } from '../chart-data';
import { ERROR_CODES, TIMEFRAMES } from '@/constants';
import { ChartDataPoint } from '@/types';

// Mock the API clients
vi.mock('../alpha-vantage', () => ({
  alphaVantageClient: {
    getChartData: vi.fn(),
  },
}));

vi.mock('../coingecko', () => ({
  coinGeckoClient: {
    getChartData: vi.fn(),
  },
}));

import { alphaVantageClient } from '../alpha-vantage';
import { coinGeckoClient } from '../coingecko';

// Create typed mocks
const mockAlphaVantageClient = alphaVantageClient as {
  getChartData: ReturnType<typeof vi.fn>;
};

const mockCoinGeckoClient = coinGeckoClient as {
  getChartData: ReturnType<typeof vi.fn>;
};

describe('ChartDataClient', () => {
  let client: ChartDataClient;

  beforeEach(() => {
    client = new ChartDataClient();
    vi.clearAllMocks();
  });

  const mockChartData: ChartDataPoint[] = [
    {
      timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
      open: 45000,
      high: 45500,
      low: 44800,
      close: 45200,
      volume: 1000000,
    },
    {
      timestamp: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
      open: 45200,
      high: 45800,
      low: 45000,
      close: 45600,
      volume: 1200000,
    },
  ];

  describe('getChartData', () => {
    it('should throw error for empty symbol', async () => {
      await expect(client.getChartData('', 'stock')).rejects.toThrow('Symbol is required');
    });

    it('should throw error for invalid timeframe', async () => {
      await expect(client.getChartData('AAPL', 'stock', '2D' as never)).rejects.toThrow('Invalid timeframe: 2D');
    });

    it('should throw error for unsupported asset type', async () => {
      await expect(client.getChartData('AAPL', 'forex' as never)).rejects.toThrow('Unsupported asset type: forex');
    });

    it('should get stock chart data successfully', async () => {
      mockAlphaVantageClient.getChartData.mockResolvedValueOnce(mockChartData);

      const result = await client.getChartData('AAPL', 'stock', '1M');
      
      expect(result).toEqual({
        symbol: 'AAPL',
        timeframe: '1M',
        data: mockChartData,
      });
      
      expect(mockAlphaVantageClient.getChartData).toHaveBeenCalledWith('AAPL');
    });

    it('should get crypto chart data successfully', async () => {
      mockCoinGeckoClient.getChartData.mockResolvedValueOnce(mockChartData);

      const result = await client.getChartData('bitcoin', 'crypto', '1W');
      
      expect(result).toEqual({
        symbol: 'BITCOIN',
        timeframe: '1W',
        data: mockChartData,
      });
      
      expect(mockCoinGeckoClient.getChartData).toHaveBeenCalledWith('bitcoin', 7);
    });

    it('should handle API errors', async () => {
      mockAlphaVantageClient.getChartData.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getChartData('AAPL', 'stock')).rejects.toMatchObject({
        errorCode: ERROR_CODES.EXTERNAL_API_ERROR,
      });
    });
  });

  describe('getMultipleChartData', () => {
    it('should get multiple chart datasets', async () => {
      mockAlphaVantageClient.getChartData.mockResolvedValueOnce(mockChartData);
      mockCoinGeckoClient.getChartData.mockResolvedValueOnce(mockChartData);

      const requests = [
        { symbol: 'AAPL', assetType: 'stock' as const },
        { symbol: 'bitcoin', assetType: 'crypto' as const },
      ];

      const results = await client.getMultipleChartData(requests);
      
      expect(results).toHaveLength(2);
      expect(results[0].symbol).toBe('AAPL');
      expect(results[1].symbol).toBe('BITCOIN');
    });

    it('should handle partial failures', async () => {
      mockAlphaVantageClient.getChartData.mockResolvedValueOnce(mockChartData);
      mockCoinGeckoClient.getChartData.mockRejectedValueOnce(new Error('API Error'));

      const requests = [
        { symbol: 'AAPL', assetType: 'stock' as const },
        { symbol: 'bitcoin', assetType: 'crypto' as const },
      ];

      const results = await client.getMultipleChartData(requests);
      
      expect(results).toHaveLength(1);
      expect(results[0].symbol).toBe('AAPL');
    });
  });

  describe('validateChartData', () => {
    it('should validate good data', () => {
      const result = client.validateChartData(mockChartData);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect empty data', () => {
      const result = client.validateChartData([]);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('No data points available');
    });

    it('should detect invalid data points', () => {
      const invalidData: ChartDataPoint[] = [
        {
          timestamp: 1705334400000,
          open: 45000,
          high: 44000, // High < Low (invalid)
          low: 45000,
          close: 45200,
          volume: 1000000,
        },
      ];

      const result = client.validateChartData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.issues[0]).toContain('invalid data points found');
    });

    it('should detect negative prices', () => {
      const invalidData: ChartDataPoint[] = [
        {
          timestamp: 1705334400000,
          open: -100, // Negative price (invalid)
          high: 45500,
          low: 44800,
          close: 45200,
          volume: 1000000,
        },
      ];

      const result = client.validateChartData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.issues[0]).toContain('invalid data points found');
    });
  });

  describe('getValidatedChartData', () => {
    it('should return chart data with validation', async () => {
      mockAlphaVantageClient.getChartData.mockResolvedValueOnce(mockChartData);

      const result = await client.getValidatedChartData('AAPL', 'stock', '1M');
      
      expect(result.symbol).toBe('AAPL');
      expect(result.timeframe).toBe('1M');
      expect(result.data).toEqual(mockChartData);
      expect(result.validation.isValid).toBe(true);
    });
  });

  describe('utility methods', () => {
    it('should return supported timeframes', () => {
      const timeframes = client.getSupportedTimeframes();
      expect(timeframes).toEqual(Object.keys(TIMEFRAMES));
    });

    it('should return timeframe config', () => {
      const config = client.getTimeframeConfig('1M');
      expect(config).toEqual({ days: 30, interval: 'daily' });
    });

    it('should check if timeframe is supported', () => {
      expect(client.isTimeframeSupported('1M')).toBe(true);
      expect(client.isTimeframeSupported('2D')).toBe(false);
    });
  });
});