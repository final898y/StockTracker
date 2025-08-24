import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWatchlistStore } from '../watchlist-store';
import { watchlistService } from '@/services';
import { Asset, PriceData } from '@/types';

// Mock the watchlist service
vi.mock('@/services', () => ({
  watchlistService: {
    addToWatchlist: vi.fn(),
    removeFromWatchlist: vi.fn(),
    getWatchlist: vi.fn(),
    clearWatchlist: vi.fn(),
  },
}));

describe('WatchlistStore', () => {
  beforeEach(() => {
    // Reset store state
    useWatchlistStore.setState({
      items: [],
      loading: false,
      error: null,
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('addToWatchlist', () => {
    it('should add asset to watchlist successfully', async () => {
      const mockAsset: Asset = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock',
        exchange: 'NASDAQ',
      };

      vi.mocked(watchlistService.addToWatchlist).mockResolvedValue();

      const { addToWatchlist } = useWatchlistStore.getState();
      
      await addToWatchlist(mockAsset);

      // Get updated state after the async operation
      const { items } = useWatchlistStore.getState();

      expect(watchlistService.addToWatchlist).toHaveBeenCalledWith(mockAsset);
      expect(items).toHaveLength(1);
      expect(items[0].asset).toEqual(mockAsset);
      expect(items[0].addedAt).toBeInstanceOf(Date);
    });

    it('should throw error when asset already exists', async () => {
      const mockAsset: Asset = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock',
        exchange: 'NASDAQ',
      };

      // Add asset first
      useWatchlistStore.setState({
        items: [{
          asset: mockAsset,
          addedAt: new Date(),
        }],
      });

      const { addToWatchlist } = useWatchlistStore.getState();
      
      await expect(addToWatchlist(mockAsset)).rejects.toThrow('AAPL 已在追蹤清單中');
    });

    it('should handle service error', async () => {
      const mockAsset: Asset = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock',
        exchange: 'NASDAQ',
      };

      const errorMessage = 'Service error';
      vi.mocked(watchlistService.addToWatchlist).mockRejectedValue(new Error(errorMessage));

      const { addToWatchlist } = useWatchlistStore.getState();
      
      await expect(addToWatchlist(mockAsset)).rejects.toThrow(errorMessage);
      
      const { error, loading } = useWatchlistStore.getState();
      expect(error).toBe(errorMessage);
      expect(loading).toBe(false);
    });
  });

  describe('removeFromWatchlist', () => {
    it('should remove asset from watchlist successfully', async () => {
      const mockAsset: Asset = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock',
        exchange: 'NASDAQ',
      };

      // Setup initial state
      useWatchlistStore.setState({
        items: [{
          asset: mockAsset,
          addedAt: new Date(),
        }],
      });

      vi.mocked(watchlistService.removeFromWatchlist).mockResolvedValue();

      const { removeFromWatchlist } = useWatchlistStore.getState();
      
      await removeFromWatchlist('AAPL');

      // Get updated state after the async operation
      const { items } = useWatchlistStore.getState();

      expect(watchlistService.removeFromWatchlist).toHaveBeenCalledWith('AAPL');
      expect(items).toHaveLength(0);
    });
  });

  describe('loadWatchlist', () => {
    it('should load watchlist from service successfully', async () => {
      const mockWatchlistData = [
        {
          id: 1,
          symbol: 'AAPL',
          name: 'Apple Inc.',
          assetType: 'stock' as const,
          exchange: 'NASDAQ',
          addedAt: new Date(),
        },
        {
          id: 2,
          symbol: 'BTC',
          name: 'Bitcoin',
          assetType: 'crypto' as const,
          addedAt: new Date(),
        },
      ];

      vi.mocked(watchlistService.getWatchlist).mockResolvedValue(mockWatchlistData);

      const { loadWatchlist } = useWatchlistStore.getState();
      
      await loadWatchlist();

      // Get updated state after the async operation
      const { items } = useWatchlistStore.getState();

      expect(watchlistService.getWatchlist).toHaveBeenCalled();
      expect(items).toHaveLength(2);
      expect(items[0].asset.symbol).toBe('AAPL');
      expect(items[1].asset.symbol).toBe('BTC');
    });
  });

  describe('updatePrice', () => {
    it('should update price for specific asset', () => {
      const mockAsset: Asset = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock',
        exchange: 'NASDAQ',
      };

      const mockPriceData: PriceData = {
        price: 150.25,
        volume: 1000000,
        change24h: 2.5,
        timestamp: new Date(),
      };

      // Setup initial state
      useWatchlistStore.setState({
        items: [{
          asset: mockAsset,
          addedAt: new Date(),
        }],
      });

      const { updatePrice } = useWatchlistStore.getState();
      
      updatePrice('AAPL', mockPriceData);

      // Get updated state after the operation
      const { items } = useWatchlistStore.getState();

      expect(items[0].currentPrice).toEqual(mockPriceData);
    });
  });

  describe('updatePrices', () => {
    it('should update prices for multiple assets', () => {
      const mockAssets = [
        {
          asset: { symbol: 'AAPL', name: 'Apple Inc.', assetType: 'stock' as const },
          addedAt: new Date(),
        },
        {
          asset: { symbol: 'BTC', name: 'Bitcoin', assetType: 'crypto' as const },
          addedAt: new Date(),
        },
      ];

      const mockPriceUpdates = {
        'AAPL': {
          price: 150.25,
          volume: 1000000,
          change24h: 2.5,
          timestamp: new Date(),
        },
        'BTC': {
          price: 45000,
          volume: 500000,
          change24h: -1.2,
          timestamp: new Date(),
        },
      };

      // Setup initial state
      useWatchlistStore.setState({ items: mockAssets });

      const { updatePrices } = useWatchlistStore.getState();
      
      updatePrices(mockPriceUpdates);

      // Get updated state after the operation
      const { items } = useWatchlistStore.getState();

      expect(items[0].currentPrice).toEqual(mockPriceUpdates['AAPL']);
      expect(items[1].currentPrice).toEqual(mockPriceUpdates['BTC']);
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      const mockItems = [
        {
          asset: { symbol: 'AAPL', name: 'Apple Inc.', assetType: 'stock' as const },
          addedAt: new Date(),
        },
        {
          asset: { symbol: 'BTC', name: 'Bitcoin', assetType: 'crypto' as const },
          addedAt: new Date(),
        },
      ];

      useWatchlistStore.setState({ items: mockItems });
    });

    it('should check if asset is in watchlist', () => {
      const { isInWatchlist } = useWatchlistStore.getState();
      
      expect(isInWatchlist('AAPL')).toBe(true);
      expect(isInWatchlist('GOOGL')).toBe(false);
    });

    it('should get watchlist item by symbol', () => {
      const { getWatchlistItem } = useWatchlistStore.getState();
      
      const item = getWatchlistItem('AAPL');
      expect(item?.asset.symbol).toBe('AAPL');
      
      const nonExistentItem = getWatchlistItem('GOOGL');
      expect(nonExistentItem).toBeUndefined();
    });

    it('should get all watchlist symbols', () => {
      const { getWatchlistSymbols } = useWatchlistStore.getState();
      
      const symbols = getWatchlistSymbols();
      expect(symbols).toEqual(['AAPL', 'BTC']);
    });
  });
});