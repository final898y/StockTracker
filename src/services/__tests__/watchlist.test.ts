// Unit tests for Watchlist service
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WatchlistService } from '../watchlist';
import { indexedDBService } from '../indexeddb';
import { Asset, PriceData, WatchlistDB } from '@/types';

// Mock the indexedDBService
vi.mock('../indexeddb', () => ({
  indexedDBService: {
    addToWatchlist: vi.fn(),
    removeFromWatchlist: vi.fn(),
    getWatchlist: vi.fn(),
    getWatchlistByType: vi.fn(),
    isInWatchlist: vi.fn(),
    getCachedPriceData: vi.fn(),
    cachePriceData: vi.fn(),
    clearWatchlist: vi.fn(),
  }
}));

describe('WatchlistService', () => {
  let service: WatchlistService;
  const mockIndexedDBService = indexedDBService as any;

  beforeEach(() => {
    service = new WatchlistService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('addAsset', () => {
    const mockAsset: Asset = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      assetType: 'stock',
      exchange: 'NASDAQ'
    };

    it('should add asset to watchlist successfully', async () => {
      mockIndexedDBService.isInWatchlist.mockResolvedValue(false);
      mockIndexedDBService.addToWatchlist.mockResolvedValue(1);

      await service.addAsset(mockAsset);

      expect(mockIndexedDBService.isInWatchlist).toHaveBeenCalledWith('AAPL');
      expect(mockIndexedDBService.addToWatchlist).toHaveBeenCalledWith(mockAsset);
    });

    it('should throw error if asset is already in watchlist', async () => {
      mockIndexedDBService.isInWatchlist.mockResolvedValue(true);

      await expect(service.addAsset(mockAsset)).rejects.toThrow(
        'Failed to add asset to watchlist: Asset AAPL is already in watchlist'
      );

      expect(mockIndexedDBService.addToWatchlist).not.toHaveBeenCalled();
    });

    it('should handle IndexedDB errors', async () => {
      mockIndexedDBService.isInWatchlist.mockRejectedValue(new Error('DB Error'));

      await expect(service.addAsset(mockAsset)).rejects.toThrow(
        'Failed to add asset to watchlist: DB Error'
      );
    });
  });

  describe('removeAsset', () => {
    it('should remove asset from watchlist successfully', async () => {
      mockIndexedDBService.removeFromWatchlist.mockResolvedValue(undefined);

      await service.removeAsset('AAPL');

      expect(mockIndexedDBService.removeFromWatchlist).toHaveBeenCalledWith('AAPL');
    });

    it('should handle IndexedDB errors', async () => {
      mockIndexedDBService.removeFromWatchlist.mockRejectedValue(new Error('DB Error'));

      await expect(service.removeAsset('AAPL')).rejects.toThrow(
        'Failed to remove asset from watchlist: DB Error'
      );
    });
  });

  describe('getWatchlistWithPrices', () => {
    const mockWatchlistDB: WatchlistDB[] = [
      {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock',
        exchange: 'NASDAQ',
        addedAt: new Date('2024-01-01')
      },
      {
        id: 2,
        symbol: 'BTC',
        name: 'Bitcoin',
        assetType: 'crypto',
        addedAt: new Date('2024-01-02')
      }
    ];

    const mockPriceData = {
      price: 150.25,
      volume: 1000000,
      marketCap: 2500000000,
      change24h: 2.5,
      timestamp: new Date('2024-01-01T10:00:00Z')
    };

    it('should return watchlist with cached prices', async () => {
      mockIndexedDBService.getWatchlist.mockResolvedValue(mockWatchlistDB);
      mockIndexedDBService.getCachedPriceData
        .mockResolvedValueOnce(mockPriceData) // For AAPL
        .mockResolvedValueOnce(null); // For BTC (no cached price)

      const result = await service.getWatchlistWithPrices();

      expect(result).toHaveLength(2);
      
      // Check AAPL item with price
      const appleItem = result.find(item => item.asset.symbol === 'AAPL');
      expect(appleItem).toBeDefined();
      expect(appleItem?.asset.name).toBe('Apple Inc.');
      expect(appleItem?.currentPrice).toEqual({
        price: 150.25,
        volume: 1000000,
        marketCap: 2500000000,
        change24h: 2.5,
        timestamp: mockPriceData.timestamp
      });

      // Check BTC item without price
      const btcItem = result.find(item => item.asset.symbol === 'BTC');
      expect(btcItem).toBeDefined();
      expect(btcItem?.asset.name).toBe('Bitcoin');
      expect(btcItem?.currentPrice).toBeUndefined();
    });

    it('should handle IndexedDB errors', async () => {
      mockIndexedDBService.getWatchlist.mockRejectedValue(new Error('DB Error'));

      await expect(service.getWatchlistWithPrices()).rejects.toThrow(
        'Failed to get watchlist: DB Error'
      );
    });
  });

  describe('getWatchlistByType', () => {
    const mockStockItems: WatchlistDB[] = [
      {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock',
        exchange: 'NASDAQ',
        addedAt: new Date('2024-01-01')
      }
    ];

    it('should return watchlist items filtered by type', async () => {
      mockIndexedDBService.getWatchlistByType.mockResolvedValue(mockStockItems);
      mockIndexedDBService.getCachedPriceData.mockResolvedValue(null);

      const result = await service.getWatchlistByType('stock');

      expect(mockIndexedDBService.getWatchlistByType).toHaveBeenCalledWith('stock');
      expect(result).toHaveLength(1);
      expect(result[0].asset.assetType).toBe('stock');
    });

    it('should handle IndexedDB errors', async () => {
      mockIndexedDBService.getWatchlistByType.mockRejectedValue(new Error('DB Error'));

      await expect(service.getWatchlistByType('crypto')).rejects.toThrow(
        'Failed to get watchlist by type: DB Error'
      );
    });
  });

  describe('isAssetTracked', () => {
    it('should return true if asset is tracked', async () => {
      mockIndexedDBService.isInWatchlist.mockResolvedValue(true);

      const result = await service.isAssetTracked('AAPL');

      expect(result).toBe(true);
      expect(mockIndexedDBService.isInWatchlist).toHaveBeenCalledWith('AAPL');
    });

    it('should return false if asset is not tracked', async () => {
      mockIndexedDBService.isInWatchlist.mockResolvedValue(false);

      const result = await service.isAssetTracked('GOOGL');

      expect(result).toBe(false);
    });

    it('should handle IndexedDB errors', async () => {
      mockIndexedDBService.isInWatchlist.mockRejectedValue(new Error('DB Error'));

      await expect(service.isAssetTracked('AAPL')).rejects.toThrow(
        'Failed to check if asset is tracked: DB Error'
      );
    });
  });

  describe('updateAssetPrice', () => {
    const mockPriceData: PriceData = {
      price: 150.25,
      volume: 1000000,
      marketCap: 2500000000,
      change24h: 2.5,
      timestamp: new Date()
    };

    it('should update price for tracked asset', async () => {
      mockIndexedDBService.isInWatchlist.mockResolvedValue(true);
      mockIndexedDBService.cachePriceData.mockResolvedValue(undefined);

      await service.updateAssetPrice('AAPL', mockPriceData);

      expect(mockIndexedDBService.isInWatchlist).toHaveBeenCalledWith('AAPL');
      expect(mockIndexedDBService.cachePriceData).toHaveBeenCalledWith('AAPL', mockPriceData);
    });

    it('should throw error if asset is not tracked', async () => {
      mockIndexedDBService.isInWatchlist.mockResolvedValue(false);

      await expect(service.updateAssetPrice('AAPL', mockPriceData)).rejects.toThrow(
        'Failed to update asset price: Asset AAPL is not in watchlist'
      );

      expect(mockIndexedDBService.cachePriceData).not.toHaveBeenCalled();
    });
  });

  describe('updateMultipleAssetPrices', () => {
    const mockPriceUpdates = [
      {
        symbol: 'AAPL',
        priceData: {
          price: 150.25,
          volume: 1000000,
          marketCap: 2500000000,
          change24h: 2.5,
          timestamp: new Date()
        }
      },
      {
        symbol: 'GOOGL',
        priceData: {
          price: 2800.50,
          volume: 500000,
          marketCap: 1800000000,
          change24h: -1.2,
          timestamp: new Date()
        }
      }
    ];

    it('should update prices for multiple assets', async () => {
      mockIndexedDBService.isInWatchlist.mockResolvedValue(true);
      mockIndexedDBService.cachePriceData.mockResolvedValue(undefined);

      await service.updateMultipleAssetPrices(mockPriceUpdates);

      expect(mockIndexedDBService.isInWatchlist).toHaveBeenCalledTimes(2);
      expect(mockIndexedDBService.cachePriceData).toHaveBeenCalledTimes(2);
    });
  });

  describe('getWatchlistStats', () => {
    const mockWatchlistDB: WatchlistDB[] = [
      {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock',
        exchange: 'NASDAQ',
        addedAt: new Date()
      },
      {
        id: 2,
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        assetType: 'stock',
        exchange: 'NASDAQ',
        addedAt: new Date()
      },
      {
        id: 3,
        symbol: 'BTC',
        name: 'Bitcoin',
        assetType: 'crypto',
        addedAt: new Date()
      }
    ];

    it('should return correct watchlist statistics', async () => {
      mockIndexedDBService.getWatchlist.mockResolvedValue(mockWatchlistDB);
      mockIndexedDBService.getCachedPriceData
        .mockResolvedValueOnce({ price: 150 }) // AAPL has cached price
        .mockResolvedValueOnce(null) // GOOGL no cached price
        .mockResolvedValueOnce({ price: 45000 }); // BTC has cached price

      const stats = await service.getWatchlistStats();

      expect(stats).toEqual({
        totalAssets: 3,
        stockCount: 2,
        cryptoCount: 1,
        assetsWithPrices: 2
      });
    });
  });

  describe('clearWatchlist', () => {
    it('should clear all watchlist data', async () => {
      mockIndexedDBService.clearWatchlist.mockResolvedValue(undefined);

      await service.clearWatchlist();

      expect(mockIndexedDBService.clearWatchlist).toHaveBeenCalled();
    });

    it('should handle IndexedDB errors', async () => {
      mockIndexedDBService.clearWatchlist.mockRejectedValue(new Error('DB Error'));

      await expect(service.clearWatchlist()).rejects.toThrow(
        'Failed to clear watchlist: DB Error'
      );
    });
  });

  describe('exportWatchlist', () => {
    const mockWatchlistDB: WatchlistDB[] = [
      {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock',
        exchange: 'NASDAQ',
        addedAt: new Date()
      }
    ];

    it('should export watchlist data', async () => {
      mockIndexedDBService.getWatchlist.mockResolvedValue(mockWatchlistDB);

      const result = await service.exportWatchlist();

      expect(result).toEqual(mockWatchlistDB);
      expect(mockIndexedDBService.getWatchlist).toHaveBeenCalled();
    });
  });

  describe('importWatchlist', () => {
    const mockImportData = [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock' as const,
        exchange: 'NASDAQ',
        addedAt: new Date()
      }
    ];

    it('should import watchlist data', async () => {
      mockIndexedDBService.clearWatchlist.mockResolvedValue(undefined);
      mockIndexedDBService.addToWatchlist.mockResolvedValue(1);

      await service.importWatchlist(mockImportData);

      expect(mockIndexedDBService.clearWatchlist).toHaveBeenCalled();
      expect(mockIndexedDBService.addToWatchlist).toHaveBeenCalledWith({
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock',
        exchange: 'NASDAQ'
      });
    });

    it('should handle import errors', async () => {
      mockIndexedDBService.clearWatchlist.mockRejectedValue(new Error('Clear Error'));

      await expect(service.importWatchlist(mockImportData)).rejects.toThrow(
        'Failed to import watchlist: Clear Error'
      );
    });
  });
});