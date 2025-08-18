// Watchlist service that provides high-level operations for managing user's tracked assets
import { indexedDBService } from './indexeddb';
import { Asset, WatchlistItem, PriceData, WatchlistDB } from '@/types';

export class WatchlistService {
  /**
   * Add an asset to the watchlist
   */
  async addAsset(asset: Asset): Promise<void> {
    try {
      // Check if already in watchlist
      const isAlreadyTracked = await indexedDBService.isInWatchlist(asset.symbol);
      if (isAlreadyTracked) {
        throw new Error(`Asset ${asset.symbol} is already in watchlist`);
      }

      await indexedDBService.addToWatchlist(asset);
    } catch (error) {
      throw new Error(`Failed to add asset to watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove an asset from the watchlist
   */
  async removeAsset(symbol: string): Promise<void> {
    try {
      await indexedDBService.removeFromWatchlist(symbol);
    } catch (error) {
      throw new Error(`Failed to remove asset from watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all watchlist items with current prices
   */
  async getWatchlistWithPrices(): Promise<WatchlistItem[]> {
    try {
      const watchlistItems = await indexedDBService.getWatchlist();
      
      const watchlistWithPrices: WatchlistItem[] = await Promise.all(
        watchlistItems.map(async (item) => {
          // Try to get cached price data
          const cachedPrice = await indexedDBService.getCachedPriceData(item.symbol);
          
          let currentPrice: PriceData | undefined;
          if (cachedPrice) {
            currentPrice = {
              price: cachedPrice.price,
              volume: cachedPrice.volume,
              marketCap: cachedPrice.marketCap,
              change24h: cachedPrice.change24h,
              timestamp: cachedPrice.timestamp
            };
          }

          return {
            asset: {
              symbol: item.symbol,
              name: item.name,
              assetType: item.assetType,
              exchange: item.exchange
            },
            currentPrice,
            addedAt: item.addedAt
          };
        })
      );

      return watchlistWithPrices;
    } catch (error) {
      throw new Error(`Failed to get watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get watchlist items by asset type
   */
  async getWatchlistByType(assetType: 'stock' | 'crypto'): Promise<WatchlistItem[]> {
    try {
      const watchlistItems = await indexedDBService.getWatchlistByType(assetType);
      
      const watchlistWithPrices: WatchlistItem[] = await Promise.all(
        watchlistItems.map(async (item) => {
          // Try to get cached price data
          const cachedPrice = await indexedDBService.getCachedPriceData(item.symbol);
          
          let currentPrice: PriceData | undefined;
          if (cachedPrice) {
            currentPrice = {
              price: cachedPrice.price,
              volume: cachedPrice.volume,
              marketCap: cachedPrice.marketCap,
              change24h: cachedPrice.change24h,
              timestamp: cachedPrice.timestamp
            };
          }

          return {
            asset: {
              symbol: item.symbol,
              name: item.name,
              assetType: item.assetType,
              exchange: item.exchange
            },
            currentPrice,
            addedAt: item.addedAt
          };
        })
      );

      return watchlistWithPrices;
    } catch (error) {
      throw new Error(`Failed to get watchlist by type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if an asset is in the watchlist
   */
  async isAssetTracked(symbol: string): Promise<boolean> {
    try {
      return await indexedDBService.isInWatchlist(symbol);
    } catch (error) {
      throw new Error(`Failed to check if asset is tracked: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update price data for a watchlist item
   */
  async updateAssetPrice(symbol: string, priceData: PriceData): Promise<void> {
    try {
      // Only update if the asset is in watchlist
      const isTracked = await indexedDBService.isInWatchlist(symbol);
      if (!isTracked) {
        throw new Error(`Asset ${symbol} is not in watchlist`);
      }

      await indexedDBService.cachePriceData(symbol, priceData);
    } catch (error) {
      throw new Error(`Failed to update asset price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Bulk update prices for multiple assets
   */
  async updateMultipleAssetPrices(priceUpdates: Array<{ symbol: string; priceData: PriceData }>): Promise<void> {
    try {
      const updatePromises = priceUpdates.map(({ symbol, priceData }) => 
        this.updateAssetPrice(symbol, priceData)
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      throw new Error(`Failed to update multiple asset prices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get watchlist statistics
   */
  async getWatchlistStats(): Promise<{
    totalAssets: number;
    stockCount: number;
    cryptoCount: number;
    assetsWithPrices: number;
  }> {
    try {
      const allItems = await indexedDBService.getWatchlist();
      const stockItems = allItems.filter(item => item.assetType === 'stock');
      const cryptoItems = allItems.filter(item => item.assetType === 'crypto');
      
      // Count items with cached prices
      let assetsWithPrices = 0;
      for (const item of allItems) {
        const cachedPrice = await indexedDBService.getCachedPriceData(item.symbol);
        if (cachedPrice) {
          assetsWithPrices++;
        }
      }

      return {
        totalAssets: allItems.length,
        stockCount: stockItems.length,
        cryptoCount: cryptoItems.length,
        assetsWithPrices
      };
    } catch (error) {
      throw new Error(`Failed to get watchlist stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all watchlist data
   */
  async clearWatchlist(): Promise<void> {
    try {
      await indexedDBService.clearWatchlist();
    } catch (error) {
      throw new Error(`Failed to clear watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export watchlist data for backup
   */
  async exportWatchlist(): Promise<WatchlistDB[]> {
    try {
      return await indexedDBService.getWatchlist();
    } catch (error) {
      throw new Error(`Failed to export watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import watchlist data from backup
   */
  async importWatchlist(watchlistData: Omit<WatchlistDB, 'id'>[]): Promise<void> {
    try {
      // Clear existing watchlist first
      await indexedDBService.clearWatchlist();
      
      // Add all items from backup
      const importPromises = watchlistData.map(item => {
        const asset: Asset = {
          symbol: item.symbol,
          name: item.name,
          assetType: item.assetType,
          exchange: item.exchange
        };
        return indexedDBService.addToWatchlist(asset);
      });
      
      await Promise.all(importPromises);
    } catch (error) {
      throw new Error(`Failed to import watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const watchlistService = new WatchlistService();