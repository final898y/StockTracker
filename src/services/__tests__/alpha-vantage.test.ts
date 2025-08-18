import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlphaVantageClient } from '../alpha-vantage';
import { ERROR_CODES } from '@/constants';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AlphaVantageClient', () => {
  let client: AlphaVantageClient;

  beforeEach(() => {
    client = new AlphaVantageClient();
    vi.clearAllMocks();
  });

  describe('searchStocks', () => {
    it('should return empty array for empty query', async () => {
      const result = await client.searchStocks('');
      expect(result).toEqual([]);
    });

    it('should search stocks successfully', async () => {
      const mockResponse = {
        bestMatches: [
          {
            '1. symbol': 'AAPL',
            '2. name': 'Apple Inc.',
            '3. type': 'Equity',
            '4. region': 'United States',
            '5. marketOpen': '09:30',
            '6. marketClose': '16:00',
            '7. timezone': 'UTC-04',
            '8. currency': 'USD',
            '9. matchScore': '1.0000',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.searchStocks('AAPL');
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        symbol: 'AAPL',
        name: 'Apple Inc.',
        exchange: 'US',
        currency: 'USD',
        type: 'stock',
      });
    });

    it('should handle API errors', async () => {
      // Mock all retry attempts to return the same error response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.searchStocks('AAPL')).rejects.toMatchObject({
        errorCode: ERROR_CODES.EXTERNAL_API_ERROR,
      });
    });

    it('should handle rate limit errors', async () => {
      // Mock all retry attempts to return the same rate limit response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ Note: 'API rate limit exceeded' }),
      });

      await expect(client.searchStocks('AAPL')).rejects.toMatchObject({
        errorCode: ERROR_CODES.API_RATE_LIMIT,
      });
    });
  });

  describe('getStockDetails', () => {
    it('should throw error for empty symbol', async () => {
      await expect(client.getStockDetails('')).rejects.toThrow('Stock symbol is required');
    });

    it('should get stock details successfully', async () => {
      const mockResponse = {
        'Global Quote': {
          '01. symbol': 'AAPL',
          '02. open': '150.00',
          '03. high': '155.00',
          '04. low': '149.00',
          '05. price': '152.50',
          '06. volume': '50000000',
          '07. latest trading day': '2024-01-15',
          '08. previous close': '151.00',
          '09. change': '1.50',
          '10. change percent': '0.99%',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getStockDetails('AAPL');
      
      expect(result).toEqual({
        symbol: 'AAPL',
        name: 'AAPL',
        exchange: 'US',
        currency: 'USD',
        price: 152.50,
        change: 1.50,
        changePercent: 0.99,
        volume: 50000000,
        marketCap: undefined,
        timestamp: '2024-01-15',
      });
    });
  });

  describe('getChartData', () => {
    it('should throw error for empty symbol', async () => {
      await expect(client.getChartData('')).rejects.toThrow('Stock symbol is required');
    });

    it('should get chart data successfully', async () => {
      const mockResponse = {
        'Meta Data': {
          '1. Information': 'Daily Prices',
          '2. Symbol': 'AAPL',
          '3. Last Refreshed': '2024-01-15',
          '4. Interval': 'Daily',
          '5. Output Size': 'Compact',
          '6. Time Zone': 'US/Eastern',
        },
        'Time Series (Daily)': {
          '2024-01-15': {
            '1. open': '150.00',
            '2. high': '155.00',
            '3. low': '149.00',
            '4. close': '152.50',
            '5. volume': '50000000',
          },
          '2024-01-14': {
            '1. open': '148.00',
            '2. high': '151.00',
            '3. low': '147.00',
            '4. close': '150.00',
            '5. volume': '45000000',
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getChartData('AAPL');
      
      expect(result).toHaveLength(2);
      expect(result[0].open).toBe(148.00);
      expect(result[0].close).toBe(150.00);
      expect(result[1].open).toBe(150.00);
      expect(result[1].close).toBe(152.50);
    });
  });

  describe('utility methods', () => {
    it('should check if configured', () => {
      // Since we don't have API key in test environment
      expect(client.isConfigured()).toBe(false);
    });

    it('should return usage info', () => {
      const info = client.getUsageInfo();
      expect(info).toEqual({
        hasApiKey: false,
        provider: 'Alpha Vantage',
      });
    });
  });
});