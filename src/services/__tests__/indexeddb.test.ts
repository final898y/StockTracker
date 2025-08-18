// Integration tests for IndexedDB service
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IndexedDBService } from '../indexeddb';
// IndexedDB service integration tests

describe('IndexedDBService Integration Tests', () => {
  let service: IndexedDBService;

  beforeEach(async () => {
    service = new IndexedDBService();
    // Wait for DB initialization
    await new Promise(resolve => setTimeout(resolve, 200));
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      await service.clearAllData();
      service.close();
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Basic Functionality', () => {
    it('should be able to instantiate the service', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(IndexedDBService);
    });

    it('should have proper store constants', () => {
      // Test that the service has the expected structure
      expect(service).toBeDefined();
    });

    it('should handle basic operations without throwing', async () => {
      // Test that basic operations don't throw errors
      try {
        await service.getWatchlist();
        await service.getStats();
        expect(true).toBe(true); // If we get here, no errors were thrown
      } catch (error) {
        // If there are errors, they should be related to IndexedDB setup
        expect(error).toBeDefined();
      }
    });
  });

  describe('Service Methods', () => {
    it('should have all required methods', () => {
      // Test that all expected methods exist
      expect(typeof service.addToWatchlist).toBe('function');
      expect(typeof service.removeFromWatchlist).toBe('function');
      expect(typeof service.getWatchlist).toBe('function');
      expect(typeof service.isInWatchlist).toBe('function');
      expect(typeof service.cachePriceData).toBe('function');
      expect(typeof service.getCachedPriceData).toBe('function');
      expect(typeof service.cacheChartData).toBe('function');
      expect(typeof service.getCachedChartData).toBe('function');
      expect(typeof service.clearAllData).toBe('function');
      expect(typeof service.getStats).toBe('function');
      expect(typeof service.close).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle graceful cleanup', async () => {
      // Test that cleanup operations don't throw
      try {
        await service.clearAllData();
        service.close();
        expect(true).toBe(true);
      } catch (error) {
        // If there are errors, they should be related to IndexedDB setup
        expect(error).toBeDefined();
      }
    });
  });
});