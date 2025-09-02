import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CoinGeckoClient } from '../coingecko';
import { ERROR_CODES } from '@/constants';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CoinGeckoClient', () => {
  let client: CoinGeckoClient;

  beforeEach(() => {
    client = new CoinGeckoClient();
    client.resetRequestCount();
    vi.clearAllMocks();
  });

  describe('searchCrypto', () => {
    it('should return empty array for empty query', async () => {
      const result = await client.searchCrypto('');
      expect(result).toEqual([]);
    });

    it('should search crypto successfully', async () => {
      const mockResponse = {
        coins: [
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'btc',
            thumb: 'https://example.com/thumb.png',
            large: 'https://example.com/large.png',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.searchCrypto('bitcoin');
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        image: 'https://example.com/large.png',
      });
    });

    it('should handle API errors', async () => {
      // Mock all retry attempts to return the same error response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: vi.fn().mockResolvedValue('Internal Server Error'),
      });

      await expect(client.searchCrypto('bitcoin')).rejects.toMatchObject({
        errorCode: ERROR_CODES.EXTERNAL_API_ERROR,
      });
    });

    it('should handle rate limit errors', async () => {
      // Mock all retry attempts to return the same rate limit response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: vi.fn().mockResolvedValue('Too Many Requests'),
      });

      await expect(client.searchCrypto('bitcoin')).rejects.toMatchObject({
        errorCode: ERROR_CODES.API_RATE_LIMIT,
      });
    });
  });

  describe('getCryptoDetails', () => {
    it('should throw error for empty coin ID', async () => {
      await expect(client.getCryptoDetails('')).rejects.toThrow('Coin ID is required');
    });

    it('should get crypto details successfully', async () => {
      const mockResponse = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          image: 'https://example.com/bitcoin.png',
          current_price: 45000,
          market_cap: 850000000000,
          total_volume: 25000000000,
          price_change_24h: 1500,
          price_change_percentage_24h: 3.45,
          last_updated: '2024-01-15T12:00:00.000Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getCryptoDetails('bitcoin');
      
      expect(result).toEqual({
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        image: 'https://example.com/bitcoin.png',
        current_price: 45000,
        price_change_24h: 1500,
        price_change_percentage_24h: 3.45,
        market_cap: 850000000000,
        total_volume: 25000000000,
        last_updated: '2024-01-15T12:00:00.000Z',
      });
    });

    it('should handle not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await expect(client.getCryptoDetails('nonexistent')).rejects.toThrow('Cryptocurrency not found');
    });
  });

  describe('getCryptoPrices', () => {
    it('should return empty object for empty array', async () => {
      const result = await client.getCryptoPrices([]);
      expect(result).toEqual({});
    });

    it('should get multiple crypto prices', async () => {
      const mockResponse = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          image: 'https://example.com/bitcoin.png',
          current_price: 45000,
          market_cap: 850000000000,
          total_volume: 25000000000,
          price_change_24h: 1500,
          price_change_percentage_24h: 3.45,
          last_updated: '2024-01-15T12:00:00.000Z',
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          image: 'https://example.com/ethereum.png',
          current_price: 2800,
          market_cap: 340000000000,
          total_volume: 15000000000,
          price_change_24h: 120,
          price_change_percentage_24h: 4.48,
          last_updated: '2024-01-15T12:00:00.000Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getCryptoPrices(['bitcoin', 'ethereum']);
      
      expect(Object.keys(result)).toHaveLength(2);
      expect(result.bitcoin.symbol).toBe('BTC');
      expect(result.ethereum.symbol).toBe('ETH');
    });
  });

  describe('getChartData', () => {
    it('should throw error for empty coin ID', async () => {
      await expect(client.getChartData('')).rejects.toThrow('Coin ID is required');
    });

    it('should get chart data successfully', async () => {
      const mockResponse = {
        prices: [
          [1705334400000, 45000], // 2024-01-15 12:00:00
          [1705338000000, 45500], // 2024-01-15 13:00:00
        ],
        market_caps: [
          [1705334400000, 850000000000],
          [1705338000000, 860000000000],
        ],
        total_volumes: [
          [1705334400000, 25000000000],
          [1705338000000, 26000000000],
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getChartData('bitcoin', 1);
      
      expect(result).toHaveLength(2);
      expect(result[0].timestamp).toBe(1705334400000);
      expect(result[0].close).toBe(45000);
      expect(result[1].timestamp).toBe(1705338000000);
      expect(result[1].close).toBe(45500);
    });
  });

  describe('getTrendingCrypto', () => {
    it('should get trending crypto successfully', async () => {
      const mockResponse = {
        coins: [
          {
            item: {
              id: 'bitcoin',
              name: 'Bitcoin',
              symbol: 'btc',
              thumb: 'https://example.com/thumb.png',
              large: 'https://example.com/large.png',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getTrendingCrypto();
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        image: 'https://example.com/large.png',
      });
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
        provider: 'CoinGecko',
        requestCount: 0,
        tier: 'Free',
      });
    });

    it('should reset request count', () => {
      client.resetRequestCount();
      const info = client.getUsageInfo();
      expect(info.requestCount).toBe(0);
    });
  });
});