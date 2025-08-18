// Cache service for managing price and chart data caching with TTL
import { indexedDBService } from './indexeddb';
import { PriceData, CandlestickData, ChartCacheDB, PriceCacheDB } from '@/types';

export class CacheService {
  // Default TTL values in minutes
  private readonly DEFAULT_PRICE_TTL = 1; // 1 minute for price data
  private readonly DEFAULT_CHART_TTL = 5; // 5 minutes for chart data

  // ==================== PRICE CACHE OPERATIONS ====================

  /**
   * Cache price data with custom or default TTL
   */
  async cachePrice(symbol: string, priceData: PriceData, ttlMinutes?: number): Promise<void> {
    try {
      const ttl = ttlMinutes ?? this.DEFAULT_PRICE_TTL;
      await indexedDBService.cachePriceData(symbol, priceData, ttl);
    } catch (error) {
      throw new Error(`Failed to cache price data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cached price data if available and not expired
   */
  async getCachedPrice(symbol: string): Promise<PriceData | null> {
    try {
      const cachedData = await indexedDBService.getCachedPriceData(symbol);
      
      if (!cachedData) {
        return null;
      }

      return {
        price: cachedData.price,
        volume: cachedData.volume,
        marketCap: cachedData.marketCap,
        change24h: cachedData.change24h,
        timestamp: cachedData.timestamp
      };
    } catch (error) {
      throw new Error(`Failed to get cached price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if price data is cached and not expired
   */
  async isPriceCached(symbol: string): Promise<boolean> {
    try {
      const cachedData = await this.getCachedPrice(symbol);
      return cachedData !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Bulk cache multiple price data entries
   */
  async cachePrices(priceEntries: Array<{ symbol: string; priceData: PriceData; ttlMinutes?: number }>): Promise<void> {
    try {
      const cachePromises = priceEntries.map(({ symbol, priceData, ttlMinutes }) =>
        this.cachePrice(symbol, priceData, ttlMinutes)
      );
      
      await Promise.all(cachePromises);
    } catch (error) {
      throw new Error(`Failed to cache multiple prices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get multiple cached prices
   */
  async getCachedPrices(symbols: string[]): Promise<Record<string, PriceData | null>> {
    try {
      const pricePromises = symbols.map(async (symbol) => {
        const price = await this.getCachedPrice(symbol);
        return { symbol, price };
      });
      
      const results = await Promise.all(pricePromises);
      
      return results.reduce((acc, { symbol, price }) => {
        acc[symbol] = price;
        return acc;
      }, {} as Record<string, PriceData | null>);
    } catch (error) {
      throw new Error(`Failed to get cached prices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== CHART CACHE OPERATIONS ====================

  /**
   * Cache chart data with custom or default TTL
   */
  async cacheChart(
    symbol: string, 
    timeframe: string, 
    chartData: CandlestickData[], 
    ttlMinutes?: number
  ): Promise<void> {
    try {
      const ttl = ttlMinutes ?? this.DEFAULT_CHART_TTL;
      await indexedDBService.cacheChartData(symbol, timeframe, chartData, ttl);
    } catch (error) {
      throw new Error(`Failed to cache chart data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cached chart data if available and not expired
   */
  async getCachedChart(symbol: string, timeframe: string): Promise<CandlestickData[] | null> {
    try {
      const cachedData = await indexedDBService.getCachedChartData(symbol, timeframe);
      
      if (!cachedData) {
        return null;
      }

      return cachedData.data;
    } catch (error) {
      throw new Error(`Failed to get cached chart data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if chart data is cached and not expired
   */
  async isChartCached(symbol: string, timeframe: string): Promise<boolean> {
    try {
      const cachedData = await this.getCachedChart(symbol, timeframe);
      return cachedData !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get chart cache metadata (without the actual data)
   */
  async getChartCacheInfo(symbol: string, timeframe: string): Promise<{
    lastUpdated: Date;
    expiresAt: Date;
    dataPoints: number;
  } | null> {
    try {
      const cachedData = await indexedDBService.getCachedChartData(symbol, timeframe);
      
      if (!cachedData) {
        return null;
      }

      return {
        lastUpdated: cachedData.lastUpdated,
        expiresAt: cachedData.expiresAt,
        dataPoints: cachedData.data.length
      };
    } catch (error) {
      throw new Error(`Failed to get chart cache info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== CACHE MANAGEMENT OPERATIONS ====================

  /**
   * Clean up all expired cache entries
   */
  async cleanupExpiredCache(): Promise<void> {
    try {
      await Promise.all([
        indexedDBService.cleanupExpiredPriceCache(),
        indexedDBService.cleanupExpiredChartCache()
      ]);
    } catch (error) {
      throw new Error(`Failed to cleanup expired cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all price cache data
   */
  async clearPriceCache(): Promise<void> {
    try {
      await indexedDBService.clearPriceCache();
    } catch (error) {
      throw new Error(`Failed to clear price cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all chart cache data
   */
  async clearChartCache(): Promise<void> {
    try {
      await indexedDBService.clearChartCache();
    } catch (error) {
      throw new Error(`Failed to clear chart cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all cache data
   */
  async clearAllCache(): Promise<void> {
    try {
      await Promise.all([
        this.clearPriceCache(),
        this.clearChartCache()
      ]);
    } catch (error) {
      throw new Error(`Failed to clear all cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    priceCacheCount: number;
    chartCacheCount: number;
    totalCacheSize: number;
  }> {
    try {
      const stats = await indexedDBService.getStats();
      
      return {
        priceCacheCount: stats.priceCacheCount,
        chartCacheCount: stats.chartCacheCount,
        totalCacheSize: stats.priceCacheCount + stats.chartCacheCount
      };
    } catch (error) {
      throw new Error(`Failed to get cache stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cache health information
   */
  async getCacheHealth(): Promise<{
    priceCache: {
      total: number;
      expired: number;
      valid: number;
    };
    chartCache: {
      total: number;
      expired: number;
      valid: number;
    };
  }> {
    try {
      // This would require additional IndexedDB queries to check expiration
      // For now, return basic stats and recommend cleanup
      const stats = await this.getCacheStats();
      
      // Trigger cleanup to get accurate counts
      await this.cleanupExpiredCache();
      const cleanStats = await this.getCacheStats();
      
      return {
        priceCache: {
          total: stats.priceCacheCount,
          expired: stats.priceCacheCount - cleanStats.priceCacheCount,
          valid: cleanStats.priceCacheCount
        },
        chartCache: {
          total: stats.chartCacheCount,
          expired: stats.chartCacheCount - cleanStats.chartCacheCount,
          valid: cleanStats.chartCacheCount
        }
      };
    } catch (error) {
      throw new Error(`Failed to get cache health: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Preload cache for multiple symbols
   */
  async preloadCache(symbols: string[], timeframes: string[] = ['1D']): Promise<void> {
    try {
      // This method would be used in conjunction with API services
      // to preload frequently accessed data
      console.log(`Preloading cache for ${symbols.length} symbols and ${timeframes.length} timeframes`);
      
      // Implementation would depend on API services being available
      // For now, this is a placeholder for future implementation
    } catch (error) {
      throw new Error(`Failed to preload cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cache configuration
   */
  getCacheConfig(): {
    defaultPriceTTL: number;
    defaultChartTTL: number;
  } {
    return {
      defaultPriceTTL: this.DEFAULT_PRICE_TTL,
      defaultChartTTL: this.DEFAULT_CHART_TTL
    };
  }

  /**
   * Validate cache integrity
   */
  async validateCacheIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    try {
      const issues: string[] = [];
      
      // Check if IndexedDB is accessible
      try {
        await indexedDBService.getStats();
      } catch (error) {
        issues.push('IndexedDB is not accessible');
      }
      
      // Check for expired entries
      const health = await this.getCacheHealth();
      if (health.priceCache.expired > 0) {
        issues.push(`${health.priceCache.expired} expired price cache entries found`);
      }
      if (health.chartCache.expired > 0) {
        issues.push(`${health.chartCache.expired} expired chart cache entries found`);
      }
      
      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [`Cache validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();