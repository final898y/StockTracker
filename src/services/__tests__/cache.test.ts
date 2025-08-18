// Unit tests for Cache service
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheService } from '../cache';
import { indexedDBService } from '../indexeddb';
import { PriceData, CandlestickData } from '@/types';

// Mock the indexedDBService
vi.mock('../indexeddb', () => ({
  indexedDBService: {
    cachePriceData: vi.fn(),
    getCachedPriceData: vi.fn(),
    cacheChartData: vi.fn(),
    getCachedChartData: vi.fn(),
    cleanupExpiredPriceCache: vi.fn(),
    cleanupExpiredChartCache: vi.fn(),
    clearPriceCache: vi.fn(),
    clearChartCache: vi.fn(),
    getStats: vi.fn(),
  }
}));

describe('CacheService', () => {
  let service: CacheService;
  const mockIndexedDBService = indexedDBService as any;

  beforeEach(() => {
    service = new CacheService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Price Cache Operations', () => {
    const mockPriceData: PriceData = {
      price: 150.25,
      volume: 1000000,
      marketCap: 2500000000,
      change24h: 2.5,
      timestamp: new Date()
    };

    describe('cachePrice', () => {
      it('should cache price data with default TTL', async () => {
        mockIndexedDBService.cachePriceData.mockResolvedValue(undefined);

        await service.cachePrice('AAPL', mockPriceData);

        expect(mockIndexedDBService.cachePriceData).toHaveBeenCalledWith('AAPL', mockPriceData, 1);
      });

      it('should cache price data with custom TTL', async () => {
        mockIndexedDBService.cachePriceData.mockResolvedValue(undefined);

        await service.cachePrice('AAPL', mockPriceData, 5);

        expect(mockIndexedDBService.cachePriceData).toHaveBeenCalledWith('AAPL', mockPriceData, 5);
      });

      it('should handle caching errors', async () => {
        mockIndexedDBService.cachePriceData.mockRejectedValue(new Error('Cache Error'));

        await expect(service.cachePrice('AAPL', mockPriceData)).rejects.toThrow(
          'Failed to cache price data: Cache Error'
        );
      });
    });

    describe('getCachedPrice', () => {
      const mockCachedData = {
        id: 1,
        symbol: 'AAPL',
        price: 150.25,
        volume: 1000000,
        marketCap: 2500000000,
        change24h: 2.5,
        timestamp: new Date(),
        expiresAt: new Date()
      };

      it('should return cached price data', async () => {
        mockIndexedDBService.getCachedPriceData.mockResolvedValue(mockCachedData);

        const result = await service.getCachedPrice('AAPL');

        expect(result).toEqual({
          price: 150.25,
          volume: 1000000,
          marketCap: 2500000000,
          change24h: 2.5,
          timestamp: mockCachedData.timestamp
        });
      });

      it('should return null if no cached data exists', async () => {
        mockIndexedDBService.getCachedPriceData.mockResolvedValue(null);

        const result = await service.getCachedPrice('AAPL');

        expect(result).toBeNull();
      });

      it('should handle retrieval errors', async () => {
        mockIndexedDBService.getCachedPriceData.mockRejectedValue(new Error('Retrieval Error'));

        await expect(service.getCachedPrice('AAPL')).rejects.toThrow(
          'Failed to get cached price: Retrieval Error'
        );
      });
    });

    describe('isPriceCached', () => {
      it('should return true if price is cached', async () => {
        mockIndexedDBService.getCachedPriceData.mockResolvedValue({
          price: 150.25,
          timestamp: new Date()
        });

        const result = await service.isPriceCached('AAPL');

        expect(result).toBe(true);
      });

      it('should return false if price is not cached', async () => {
        mockIndexedDBService.getCachedPriceData.mockResolvedValue(null);

        const result = await service.isPriceCached('AAPL');

        expect(result).toBe(false);
      });

      it('should return false on errors', async () => {
        mockIndexedDBService.getCachedPriceData.mockRejectedValue(new Error('Error'));

        const result = await service.isPriceCached('AAPL');

        expect(result).toBe(false);
      });
    });

    describe('cachePrices', () => {
      const mockPriceEntries = [
        { symbol: 'AAPL', priceData: mockPriceData },
        { symbol: 'GOOGL', priceData: { ...mockPriceData, price: 2800 }, ttlMinutes: 10 }
      ];

      it('should cache multiple prices', async () => {
        mockIndexedDBService.cachePriceData.mockResolvedValue(undefined);

        await service.cachePrices(mockPriceEntries);

        expect(mockIndexedDBService.cachePriceData).toHaveBeenCalledTimes(2);
        expect(mockIndexedDBService.cachePriceData).toHaveBeenCalledWith('AAPL', mockPriceData, 1);
        expect(mockIndexedDBService.cachePriceData).toHaveBeenCalledWith('GOOGL', { ...mockPriceData, price: 2800 }, 10);
      });
    });

    describe('getCachedPrices', () => {
      it('should return cached prices for multiple symbols', async () => {
        mockIndexedDBService.getCachedPriceData
          .mockResolvedValueOnce({ price: 150.25, timestamp: new Date() })
          .mockResolvedValueOnce(null);

        const result = await service.getCachedPrices(['AAPL', 'GOOGL']);

        expect(result).toEqual({
          AAPL: { price: 150.25, timestamp: expect.any(Date) },
          GOOGL: null
        });
      });
    });
  });

  describe('Chart Cache Operations', () => {
    const mockChartData: CandlestickData[] = [
      {
        openPrice: 150.0,
        highPrice: 155.0,
        lowPrice: 149.0,
        closePrice: 152.5,
        volume: 1000000,
        timestamp: new Date()
      }
    ];

    describe('cacheChart', () => {
      it('should cache chart data with default TTL', async () => {
        mockIndexedDBService.cacheChartData.mockResolvedValue(undefined);

        await service.cacheChart('AAPL', '1D', mockChartData);

        expect(mockIndexedDBService.cacheChartData).toHaveBeenCalledWith('AAPL', '1D', mockChartData, 5);
      });

      it('should cache chart data with custom TTL', async () => {
        mockIndexedDBService.cacheChartData.mockResolvedValue(undefined);

        await service.cacheChart('AAPL', '1D', mockChartData, 15);

        expect(mockIndexedDBService.cacheChartData).toHaveBeenCalledWith('AAPL', '1D', mockChartData, 15);
      });

      it('should handle caching errors', async () => {
        mockIndexedDBService.cacheChartData.mockRejectedValue(new Error('Cache Error'));

        await expect(service.cacheChart('AAPL', '1D', mockChartData)).rejects.toThrow(
          'Failed to cache chart data: Cache Error'
        );
      });
    });

    describe('getCachedChart', () => {
      const mockCachedChartData = {
        id: 1,
        symbol: 'AAPL',
        timeframe: '1D',
        data: mockChartData,
        lastUpdated: new Date(),
        expiresAt: new Date()
      };

      it('should return cached chart data', async () => {
        mockIndexedDBService.getCachedChartData.mockResolvedValue(mockCachedChartData);

        const result = await service.getCachedChart('AAPL', '1D');

        expect(result).toEqual(mockChartData);
      });

      it('should return null if no cached data exists', async () => {
        mockIndexedDBService.getCachedChartData.mockResolvedValue(null);

        const result = await service.getCachedChart('AAPL', '1D');

        expect(result).toBeNull();
      });

      it('should handle retrieval errors', async () => {
        mockIndexedDBService.getCachedChartData.mockRejectedValue(new Error('Retrieval Error'));

        await expect(service.getCachedChart('AAPL', '1D')).rejects.toThrow(
          'Failed to get cached chart data: Retrieval Error'
        );
      });
    });

    describe('isChartCached', () => {
      it('should return true if chart is cached', async () => {
        mockIndexedDBService.getCachedChartData.mockResolvedValue({
          data: mockChartData
        });

        const result = await service.isChartCached('AAPL', '1D');

        expect(result).toBe(true);
      });

      it('should return false if chart is not cached', async () => {
        mockIndexedDBService.getCachedChartData.mockResolvedValue(null);

        const result = await service.isChartCached('AAPL', '1D');

        expect(result).toBe(false);
      });

      it('should return false on errors', async () => {
        mockIndexedDBService.getCachedChartData.mockRejectedValue(new Error('Error'));

        const result = await service.isChartCached('AAPL', '1D');

        expect(result).toBe(false);
      });
    });

    describe('getChartCacheInfo', () => {
      const mockCachedChartData = {
        id: 1,
        symbol: 'AAPL',
        timeframe: '1D',
        data: mockChartData,
        lastUpdated: new Date('2024-01-01T10:00:00Z'),
        expiresAt: new Date('2024-01-01T10:05:00Z')
      };

      it('should return chart cache metadata', async () => {
        mockIndexedDBService.getCachedChartData.mockResolvedValue(mockCachedChartData);

        const result = await service.getChartCacheInfo('AAPL', '1D');

        expect(result).toEqual({
          lastUpdated: mockCachedChartData.lastUpdated,
          expiresAt: mockCachedChartData.expiresAt,
          dataPoints: 1
        });
      });

      it('should return null if no cached data exists', async () => {
        mockIndexedDBService.getCachedChartData.mockResolvedValue(null);

        const result = await service.getChartCacheInfo('AAPL', '1D');

        expect(result).toBeNull();
      });
    });
  });

  describe('Cache Management Operations', () => {
    describe('cleanupExpiredCache', () => {
      it('should cleanup expired cache entries', async () => {
        mockIndexedDBService.cleanupExpiredPriceCache.mockResolvedValue(undefined);
        mockIndexedDBService.cleanupExpiredChartCache.mockResolvedValue(undefined);

        await service.cleanupExpiredCache();

        expect(mockIndexedDBService.cleanupExpiredPriceCache).toHaveBeenCalled();
        expect(mockIndexedDBService.cleanupExpiredChartCache).toHaveBeenCalled();
      });

      it('should handle cleanup errors', async () => {
        mockIndexedDBService.cleanupExpiredPriceCache.mockRejectedValue(new Error('Cleanup Error'));

        await expect(service.cleanupExpiredCache()).rejects.toThrow(
          'Failed to cleanup expired cache: Cleanup Error'
        );
      });
    });

    describe('clearPriceCache', () => {
      it('should clear price cache', async () => {
        mockIndexedDBService.clearPriceCache.mockResolvedValue(undefined);

        await service.clearPriceCache();

        expect(mockIndexedDBService.clearPriceCache).toHaveBeenCalled();
      });
    });

    describe('clearChartCache', () => {
      it('should clear chart cache', async () => {
        mockIndexedDBService.clearChartCache.mockResolvedValue(undefined);

        await service.clearChartCache();

        expect(mockIndexedDBService.clearChartCache).toHaveBeenCalled();
      });
    });

    describe('clearAllCache', () => {
      it('should clear all cache data', async () => {
        mockIndexedDBService.clearPriceCache.mockResolvedValue(undefined);
        mockIndexedDBService.clearChartCache.mockResolvedValue(undefined);

        await service.clearAllCache();

        expect(mockIndexedDBService.clearPriceCache).toHaveBeenCalled();
        expect(mockIndexedDBService.clearChartCache).toHaveBeenCalled();
      });
    });

    describe('getCacheStats', () => {
      it('should return cache statistics', async () => {
        mockIndexedDBService.getStats.mockResolvedValue({
          watchlistCount: 5,
          priceCacheCount: 10,
          chartCacheCount: 3
        });

        const result = await service.getCacheStats();

        expect(result).toEqual({
          priceCacheCount: 10,
          chartCacheCount: 3,
          totalCacheSize: 13
        });
      });
    });

    describe('getCacheHealth', () => {
      it('should return cache health information', async () => {
        mockIndexedDBService.getStats
          .mockResolvedValueOnce({
            watchlistCount: 5,
            priceCacheCount: 10,
            chartCacheCount: 5
          })
          .mockResolvedValueOnce({
            watchlistCount: 5,
            priceCacheCount: 8,
            chartCacheCount: 4
          });
        
        mockIndexedDBService.cleanupExpiredPriceCache.mockResolvedValue(undefined);
        mockIndexedDBService.cleanupExpiredChartCache.mockResolvedValue(undefined);

        const result = await service.getCacheHealth();

        expect(result).toEqual({
          priceCache: {
            total: 10,
            expired: 2,
            valid: 8
          },
          chartCache: {
            total: 5,
            expired: 1,
            valid: 4
          }
        });
      });
    });

    describe('validateCacheIntegrity', () => {
      it('should return valid integrity when no issues', async () => {
        mockIndexedDBService.getStats.mockResolvedValue({
          watchlistCount: 5,
          priceCacheCount: 10,
          chartCacheCount: 5
        });
        
        // Mock getCacheHealth to return no expired entries
        mockIndexedDBService.cleanupExpiredPriceCache.mockResolvedValue(undefined);
        mockIndexedDBService.cleanupExpiredChartCache.mockResolvedValue(undefined);

        const result = await service.validateCacheIntegrity();

        expect(result.isValid).toBe(true);
        expect(result.issues).toHaveLength(0);
      });

      it('should return invalid integrity when IndexedDB is not accessible', async () => {
        mockIndexedDBService.getStats.mockRejectedValue(new Error('DB Error'));

        const result = await service.validateCacheIntegrity();

        expect(result.isValid).toBe(false);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0]).toContain('Cache validation failed');
      });
    });
  });

  describe('Configuration', () => {
    describe('getCacheConfig', () => {
      it('should return cache configuration', () => {
        const config = service.getCacheConfig();

        expect(config).toEqual({
          defaultPriceTTL: 1,
          defaultChartTTL: 5
        });
      });
    });
  });
});