// IndexedDB wrapper service for local data storage
import { 
  WatchlistDB, 
  PriceCacheDB, 
  ChartCacheDB, 
  CandlestickData,
  Asset,
  PriceData 
} from '@/types';

export class IndexedDBService {
  private dbName = 'StockTrackerDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private isClient: boolean;
  private isSupported: boolean;
  
  // Fallback memory storage for SSR/unsupported environments
  private memoryStorage: {
    watchlist: WatchlistDB[];
    priceCache: PriceCacheDB[];
    chartCache: ChartCacheDB[];
  } = {
    watchlist: [],
    priceCache: [],
    chartCache: []
  };

  // Store names
  private readonly STORES = {
    WATCHLIST: 'watchlist',
    PRICE_CACHE: 'priceCache',
    CHART_CACHE: 'chartCache'
  } as const;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.isSupported = this.isClient && 'indexedDB' in window;
    
    // Only initialize DB in client environment
    if (this.isSupported) {
      this.initDB();
    }
  }

  /**
   * Initialize IndexedDB database and create object stores
   */
  private async initDB(): Promise<void> {
    if (!this.isSupported) {
      throw new Error('IndexedDB is not supported in this environment');
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create watchlist store
        if (!db.objectStoreNames.contains(this.STORES.WATCHLIST)) {
          const watchlistStore = db.createObjectStore(this.STORES.WATCHLIST, {
            keyPath: 'id',
            autoIncrement: true
          });
          watchlistStore.createIndex('symbol', 'symbol', { unique: true });
          watchlistStore.createIndex('assetType', 'assetType', { unique: false });
        }

        // Create price cache store
        if (!db.objectStoreNames.contains(this.STORES.PRICE_CACHE)) {
          const priceCacheStore = db.createObjectStore(this.STORES.PRICE_CACHE, {
            keyPath: 'id',
            autoIncrement: true
          });
          priceCacheStore.createIndex('symbol', 'symbol', { unique: true });
          priceCacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        // Create chart cache store
        if (!db.objectStoreNames.contains(this.STORES.CHART_CACHE)) {
          const chartCacheStore = db.createObjectStore(this.STORES.CHART_CACHE, {
            keyPath: 'id',
            autoIncrement: true
          });
          chartCacheStore.createIndex('symbol_timeframe', ['symbol', 'timeframe'], { unique: true });
          chartCacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.isSupported) {
      throw new Error('IndexedDB is not supported in this environment');
    }
    
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }

  /**
   * Generic method to perform database operations
   */
  private async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.ensureDB();
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Transaction failed: ${request.error?.message}`));
      transaction.onerror = () => reject(new Error(`Transaction failed: ${transaction.error?.message}`));
    });
  }

  // ==================== FALLBACK METHODS ====================

  /**
   * Check if IndexedDB is available, otherwise use memory storage
   */
  private isUsingFallback(): boolean {
    return !this.isSupported;
  }

  /**
   * Generate a simple ID for memory storage
   */
  private generateId(): number {
    return Date.now() + Math.random();
  }

  // ==================== WATCHLIST OPERATIONS ====================

  /**
   * Add asset to watchlist
   */
  async addToWatchlist(asset: Asset): Promise<IDBValidKey> {
    if (this.isUsingFallback()) {
      const id = this.generateId();
      const watchlistItem: WatchlistDB = {
        id,
        symbol: asset.symbol,
        name: asset.name,
        assetType: asset.assetType,
        exchange: asset.exchange,
        addedAt: new Date()
      };
      this.memoryStorage.watchlist.push(watchlistItem);
      return id;
    }
    const watchlistItem: Omit<WatchlistDB, 'id'> = {
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.assetType,
      exchange: asset.exchange,
      addedAt: new Date()
    };

    return this.performTransaction(
      this.STORES.WATCHLIST,
      'readwrite',
      (store) => store.add(watchlistItem)
    );
  }

  /**
   * Remove asset from watchlist by symbol
   */
  async removeFromWatchlist(symbol: string): Promise<void> {
    if (this.isUsingFallback()) {
      const index = this.memoryStorage.watchlist.findIndex(item => item.symbol === symbol);
      if (index > -1) {
        this.memoryStorage.watchlist.splice(index, 1);
      }
      return;
    }
    const db = await this.ensureDB();
    const transaction = db.transaction([this.STORES.WATCHLIST], 'readwrite');
    const store = transaction.objectStore(this.STORES.WATCHLIST);
    const index = store.index('symbol');
    
    return new Promise((resolve, reject) => {
      const request = index.get(symbol);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const deleteRequest = store.delete(result.id);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(new Error(`Failed to delete: ${deleteRequest.error?.message}`));
        } else {
          resolve(); // Item not found, consider it removed
        }
      };
      
      request.onerror = () => reject(new Error(`Failed to find item: ${request.error?.message}`));
    });
  }

  /**
   * Get all watchlist items
   */
  async getWatchlist(): Promise<WatchlistDB[]> {
    if (this.isUsingFallback()) {
      return [...this.memoryStorage.watchlist];
    }
    return this.performTransaction(
      this.STORES.WATCHLIST,
      'readonly',
      (store) => store.getAll()
    );
  }

  /**
   * Check if asset is in watchlist
   */
  async isInWatchlist(symbol: string): Promise<boolean> {
    if (this.isUsingFallback()) {
      return this.memoryStorage.watchlist.some(item => item.symbol === symbol);
    }
    const db = await this.ensureDB();
    const transaction = db.transaction([this.STORES.WATCHLIST], 'readonly');
    const store = transaction.objectStore(this.STORES.WATCHLIST);
    const index = store.index('symbol');
    
    return new Promise((resolve, reject) => {
      const request = index.get(symbol);
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(new Error(`Failed to check watchlist: ${request.error?.message}`));
    });
  }

  /**
   * Get watchlist items by asset type
   */
  async getWatchlistByType(assetType: 'stock' | 'crypto'): Promise<WatchlistDB[]> {
    if (this.isUsingFallback()) {
      return this.memoryStorage.watchlist.filter(item => item.assetType === assetType);
    }
    const db = await this.ensureDB();
    const transaction = db.transaction([this.STORES.WATCHLIST], 'readonly');
    const store = transaction.objectStore(this.STORES.WATCHLIST);
    const index = store.index('assetType');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(assetType);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to get watchlist by type: ${request.error?.message}`));
    });
  }

  // ==================== PRICE CACHE OPERATIONS ====================

  /**
   * Cache price data with TTL
   */
  async cachePriceData(symbol: string, priceData: PriceData, ttlMinutes: number = 1): Promise<void> {
    if (this.isUsingFallback()) {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

      const id = this.generateId();
      const cacheItem: PriceCacheDB = {
        id,
        symbol,
        price: priceData.price,
        volume: priceData.volume,
        marketCap: priceData.marketCap,
        change24h: priceData.change24h,
        timestamp: priceData.timestamp,
        expiresAt
      };

      // Remove existing entry for same symbol
      const existingIndex = this.memoryStorage.priceCache.findIndex(item => item.symbol === symbol);
      if (existingIndex > -1) {
        this.memoryStorage.priceCache[existingIndex] = cacheItem;
      } else {
        this.memoryStorage.priceCache.push(cacheItem);
      }
      return;
    }
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    const cacheItem: Omit<PriceCacheDB, 'id'> = {
      symbol,
      price: priceData.price,
      volume: priceData.volume,
      marketCap: priceData.marketCap,
      change24h: priceData.change24h,
      timestamp: priceData.timestamp,
      expiresAt
    };

    // First try to update existing entry
    const db = await this.ensureDB();
    const transaction = db.transaction([this.STORES.PRICE_CACHE], 'readwrite');
    const store = transaction.objectStore(this.STORES.PRICE_CACHE);
    const index = store.index('symbol');
    
    return new Promise((resolve, reject) => {
      const getRequest = index.get(symbol);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        
        if (existing) {
          // Update existing entry
          const updateItem = { ...cacheItem, id: existing.id };
          const putRequest = store.put(updateItem);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(new Error(`Failed to update price cache: ${putRequest.error?.message}`));
        } else {
          // Add new entry
          const addRequest = store.add(cacheItem);
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = () => reject(new Error(`Failed to add price cache: ${addRequest.error?.message}`));
        }
      };
      
      getRequest.onerror = () => reject(new Error(`Failed to check existing price cache: ${getRequest.error?.message}`));
    });
  }

  /**
   * Get cached price data if not expired
   */
  async getCachedPriceData(symbol: string): Promise<PriceCacheDB | null> {
    if (this.isUsingFallback()) {
      const item = this.memoryStorage.priceCache.find(item => item.symbol === symbol);
      
      if (!item) {
        return null;
      }
      
      // Check if expired
      if (new Date() > item.expiresAt) {
        // Remove expired entry
        const index = this.memoryStorage.priceCache.findIndex(item => item.symbol === symbol);
        if (index > -1) {
          this.memoryStorage.priceCache.splice(index, 1);
        }
        return null;
      }
      
      return item;
    }
    const db = await this.ensureDB();
    const transaction = db.transaction([this.STORES.PRICE_CACHE], 'readonly');
    const store = transaction.objectStore(this.STORES.PRICE_CACHE);
    const index = store.index('symbol');
    
    return new Promise((resolve, reject) => {
      const request = index.get(symbol);
      
      request.onsuccess = () => {
        const result = request.result;
        
        if (!result) {
          resolve(null);
          return;
        }
        
        // Check if expired
        if (new Date() > result.expiresAt) {
          // Clean up expired entry
          this.cleanupExpiredPriceCache();
          resolve(null);
          return;
        }
        
        resolve(result);
      };
      
      request.onerror = () => reject(new Error(`Failed to get cached price: ${request.error?.message}`));
    });
  }

  /**
   * Clean up expired price cache entries
   */
  async cleanupExpiredPriceCache(): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([this.STORES.PRICE_CACHE], 'readwrite');
    const store = transaction.objectStore(this.STORES.PRICE_CACHE);
    const index = store.index('expiresAt');
    const now = new Date();
    
    return new Promise((resolve, reject) => {
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(new Error(`Failed to cleanup expired price cache: ${request.error?.message}`));
    });
  }

  // ==================== CHART CACHE OPERATIONS ====================

  /**
   * Cache chart data with TTL
   */
  async cacheChartData(
    symbol: string, 
    timeframe: string, 
    data: CandlestickData[], 
    ttlMinutes: number = 5
  ): Promise<void> {
    if (this.isUsingFallback()) {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

      const id = this.generateId();
      const cacheItem: ChartCacheDB = {
        id,
        symbol,
        timeframe,
        data,
        lastUpdated: new Date(),
        expiresAt
      };

      // Remove existing entry for same symbol and timeframe
      const existingIndex = this.memoryStorage.chartCache.findIndex(
        item => item.symbol === symbol && item.timeframe === timeframe
      );
      if (existingIndex > -1) {
        this.memoryStorage.chartCache[existingIndex] = cacheItem;
      } else {
        this.memoryStorage.chartCache.push(cacheItem);
      }
      return;
    }
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    const cacheItem: Omit<ChartCacheDB, 'id'> = {
      symbol,
      timeframe,
      data,
      lastUpdated: new Date(),
      expiresAt
    };

    // First try to update existing entry
    const db = await this.ensureDB();
    const transaction = db.transaction([this.STORES.CHART_CACHE], 'readwrite');
    const store = transaction.objectStore(this.STORES.CHART_CACHE);
    const index = store.index('symbol_timeframe');
    
    return new Promise((resolve, reject) => {
      const getRequest = index.get([symbol, timeframe]);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        
        if (existing) {
          // Update existing entry
          const updateItem = { ...cacheItem, id: existing.id };
          const putRequest = store.put(updateItem);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(new Error(`Failed to update chart cache: ${putRequest.error?.message}`));
        } else {
          // Add new entry
          const addRequest = store.add(cacheItem);
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = () => reject(new Error(`Failed to add chart cache: ${addRequest.error?.message}`));
        }
      };
      
      getRequest.onerror = () => reject(new Error(`Failed to check existing chart cache: ${getRequest.error?.message}`));
    });
  }

  /**
   * Get cached chart data if not expired
   */
  async getCachedChartData(symbol: string, timeframe: string): Promise<ChartCacheDB | null> {
    if (this.isUsingFallback()) {
      const item = this.memoryStorage.chartCache.find(
        item => item.symbol === symbol && item.timeframe === timeframe
      );
      
      if (!item) {
        return null;
      }
      
      // Check if expired
      if (new Date() > item.expiresAt) {
        // Remove expired entry
        const index = this.memoryStorage.chartCache.findIndex(
          item => item.symbol === symbol && item.timeframe === timeframe
        );
        if (index > -1) {
          this.memoryStorage.chartCache.splice(index, 1);
        }
        return null;
      }
      
      return item;
    }
    const db = await this.ensureDB();
    const transaction = db.transaction([this.STORES.CHART_CACHE], 'readonly');
    const store = transaction.objectStore(this.STORES.CHART_CACHE);
    const index = store.index('symbol_timeframe');
    
    return new Promise((resolve, reject) => {
      const request = index.get([symbol, timeframe]);
      
      request.onsuccess = () => {
        const result = request.result;
        
        if (!result) {
          resolve(null);
          return;
        }
        
        // Check if expired
        if (new Date() > result.expiresAt) {
          // Clean up expired entry
          this.cleanupExpiredChartCache();
          resolve(null);
          return;
        }
        
        resolve(result);
      };
      
      request.onerror = () => reject(new Error(`Failed to get cached chart data: ${request.error?.message}`));
    });
  }

  /**
   * Clean up expired chart cache entries
   */
  async cleanupExpiredChartCache(): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([this.STORES.CHART_CACHE], 'readwrite');
    const store = transaction.objectStore(this.STORES.CHART_CACHE);
    const index = store.index('expiresAt');
    const now = new Date();
    
    return new Promise((resolve, reject) => {
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(new Error(`Failed to cleanup expired chart cache: ${request.error?.message}`));
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clear all data from a specific store
   */
  async clearStore(storeName: string): Promise<void> {
    if (this.isUsingFallback()) {
      switch (storeName) {
        case this.STORES.WATCHLIST:
          this.memoryStorage.watchlist = [];
          break;
        case this.STORES.PRICE_CACHE:
          this.memoryStorage.priceCache = [];
          break;
        case this.STORES.CHART_CACHE:
          this.memoryStorage.chartCache = [];
          break;
      }
      return;
    }
    return this.performTransaction(
      storeName,
      'readwrite',
      (store) => store.clear()
    );
  }

  /**
   * Clear all watchlist data
   */
  async clearWatchlist(): Promise<void> {
    return this.clearStore(this.STORES.WATCHLIST);
  }

  /**
   * Clear all price cache data
   */
  async clearPriceCache(): Promise<void> {
    return this.clearStore(this.STORES.PRICE_CACHE);
  }

  /**
   * Clear all chart cache data
   */
  async clearChartCache(): Promise<void> {
    return this.clearStore(this.STORES.CHART_CACHE);
  }

  /**
   * Clear all data from database
   */
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.clearWatchlist(),
      this.clearPriceCache(),
      this.clearChartCache()
    ]);
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    watchlistCount: number;
    priceCacheCount: number;
    chartCacheCount: number;
  }> {
    if (this.isUsingFallback()) {
      return {
        watchlistCount: this.memoryStorage.watchlist.length,
        priceCacheCount: this.memoryStorage.priceCache.length,
        chartCacheCount: this.memoryStorage.chartCache.length
      };
    }
    const db = await this.ensureDB();
    
    const getCount = (storeName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error(`Failed to count ${storeName}: ${request.error?.message}`));
      });
    };

    const [watchlistCount, priceCacheCount, chartCacheCount] = await Promise.all([
      getCount(this.STORES.WATCHLIST),
      getCount(this.STORES.PRICE_CACHE),
      getCount(this.STORES.CHART_CACHE)
    ]);

    return {
      watchlistCount,
      priceCacheCount,
      chartCacheCount
    };
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService();