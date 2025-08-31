/**
 * 綜合 API Routes 單元測試
 * 測試所有 API 端點的正常和錯誤情況，Mock 外部 API 回應進行測試
 * 測試錯誤處理和邊界條件
 */

import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Import API route handlers
import { GET as stocksSearch, POST as stocksSearchPost } from '../stocks/search/route';
import { GET as stocksDetails, POST as stocksDetailsPost } from '../stocks/[symbol]/route';
import { GET as cryptoSearch, POST as cryptoSearchPost } from '../crypto/search/route';
import { GET as cryptoDetails, POST as cryptoDetailsPost } from '../crypto/[symbol]/route';
import { GET as chartsDetails, POST as chartsDetailsPost } from '../charts/[symbol]/route';
import { GET as chartsInfo, POST as chartsInfoPost } from '../charts/route';
import { GET as healthCheck, HEAD as healthHead } from '../health/route';
import { GET as usageInfo } from '../usage/route';

// Mock external services
vi.mock('@/services/alpha-vantage', () => ({
  alphaVantageClient: {
    searchStocks: vi.fn(),
    getStockDetails: vi.fn(),
    isConfigured: vi.fn(() => true),
  },
}));

vi.mock('@/services/coingecko', () => ({
  coinGeckoClient: {
    searchCrypto: vi.fn(),
    getCryptoDetails: vi.fn(),
  },
}));

vi.mock('@/services/chart-data', () => ({
  chartDataClient: {
    getChartData: vi.fn(),
    getValidatedChartData: vi.fn(),
    getMultipleChartData: vi.fn(),
    isTimeframeSupported: vi.fn(),
    getSupportedTimeframes: vi.fn(() => ['1D', '1W', '1M', '3M', '1Y']),
    getTimeframeConfig: vi.fn(),
  },
}));

vi.mock('@/lib/api-usage-tracker', () => ({
  getAllUsageData: vi.fn(),
  incrementApiUsage: vi.fn(),
  checkApiAvailability: vi.fn(() => ({ available: true, remaining: 100, resetTime: null })),
}));

// Import mocked services
import { alphaVantageClient } from '@/services/alpha-vantage';
import { coinGeckoClient } from '@/services/coingecko';
import { chartDataClient } from '@/services/chart-data';
import { getAllUsageData } from '@/lib/api-usage-tracker';

// Mock environment variables
process.env.ALPHA_VANTAGE_API_KEY = 'test-alpha-vantage-key';
process.env.COINGECKO_API_KEY = 'test-coingecko-key';

describe('綜合 API Routes 測試', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Stock API 端點測試', () => {
    it('應該成功搜尋股票', async () => {
      const mockResults = [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States' }
      ];
      vi.mocked(alphaVantageClient.searchStocks).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost:3000/api/stocks/search?query=AAPL');
      const response = await stocksSearch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResults);
    });

    it('應該成功獲取股票詳情', async () => {
      const mockDetails = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 150.25,
        change: 2.5,
        changePercent: 1.69
      };
      vi.mocked(alphaVantageClient.getStockDetails).mockResolvedValue(mockDetails);

      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/stocks/AAPL');
      const response = await stocksDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockDetails);
    });

    it('應該拒絕無效的股票代碼格式', async () => {
      const params = Promise.resolve({ symbol: 'INVALID@SYMBOL!' });
      const request = new NextRequest('http://localhost:3000/api/stocks/INVALID@SYMBOL!');
      const response = await stocksDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_SYMBOL');
    });

    it('應該拒絕不支援的 HTTP 方法', async () => {
      const response = await stocksSearchPost();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    });
  });

  describe('Crypto API 端點測試', () => {
    it('應該成功搜尋加密貨幣', async () => {
      const mockResults = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', market_cap_rank: 1 }
      ];
      vi.mocked(coinGeckoClient.searchCrypto).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost:3000/api/crypto/search?query=bitcoin');
      const response = await cryptoSearch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResults);
    });

    it('應該成功獲取加密貨幣詳情', async () => {
      const mockDetails = {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 45000,
        change24h: 1200,
        changePercent24h: 2.74
      };
      vi.mocked(coinGeckoClient.getCryptoDetails).mockResolvedValue(mockDetails);

      const params = Promise.resolve({ symbol: 'bitcoin' });
      const request = new NextRequest('http://localhost:3000/api/crypto/bitcoin');
      const response = await cryptoDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockDetails);
    });

    it('應該拒絕無效的加密貨幣代碼格式', async () => {
      const params = Promise.resolve({ symbol: 'invalid@symbol!' });
      const request = new NextRequest('http://localhost:3000/api/crypto/invalid@symbol!');
      const response = await cryptoDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_SYMBOL');
    });

    it('應該拒絕不支援的 HTTP 方法', async () => {
      const response = await cryptoSearchPost();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    });
  });

  describe('Charts API 端點測試', () => {
    beforeEach(() => {
      vi.mocked(chartDataClient.isTimeframeSupported).mockReturnValue(true);
    });

    it('應該返回 API 資訊', async () => {
      const request = new NextRequest('http://localhost:3000/api/charts');
      const response = await chartsInfo(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Chart Data API');
    });

    it('應該成功獲取圖表資料', async () => {
      const mockChartData = {
        symbol: 'AAPL',
        timeframe: '1M',
        data: [
          { timestamp: 1640995200000, open: 150, high: 155, low: 148, close: 152, volume: 1000000 }
        ]
      };
      vi.mocked(chartDataClient.getChartData).mockResolvedValue(mockChartData);

      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/charts/AAPL?assetType=stock&timeframe=1M');
      const response = await chartsDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockChartData);
    });

    it('應該拒絕缺少 assetType 參數', async () => {
      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/charts/AAPL');
      const response = await chartsDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('assetType');
    });

    it('應該處理批次圖表請求', async () => {
      const mockResults = [
        { symbol: 'AAPL', timeframe: '1M', data: [] },
        { symbol: 'bitcoin', timeframe: '1M', data: [] }
      ];
      vi.mocked(chartDataClient.getMultipleChartData).mockResolvedValue(mockResults);

      const batchRequest = [
        { symbol: 'AAPL', assetType: 'stock' as const },
        { symbol: 'bitcoin', assetType: 'crypto' as const }
      ];

      const request = new NextRequest('http://localhost:3000/api/charts', {
        method: 'POST',
        body: JSON.stringify(batchRequest),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await chartsInfoPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResults);
    });
  });

  describe('Health Check 和 Usage API 測試', () => {
    it('應該返回健康狀態', async () => {
      const response = await healthCheck();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('healthy');
      expect(data.data).toHaveProperty('timestamp');
      expect(data.data).toHaveProperty('uptime');
    });

    it('應該支援 HEAD 請求', async () => {
      const response = await healthHead();

      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
    });

    it('應該返回 API 使用量資料', async () => {
      const mockUsage = {
        'Alpha Vantage': { count: 10, limit: 100, resetTime: null },
        'CoinGecko': { count: 5, limit: 50, resetTime: null }
      };
      vi.mocked(getAllUsageData).mockReturnValue(mockUsage);

      const response = await usageInfo();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.usage).toEqual(mockUsage);
    });
  });

  describe('錯誤處理和邊界條件測試', () => {
    it('應該處理過長的查詢字串', async () => {
      const longQuery = 'a'.repeat(51);
      const request = new NextRequest(`http://localhost:3000/api/stocks/search?query=${longQuery}`);
      const response = await stocksSearch(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_SYMBOL');
    });

    it('應該處理空的查詢參數', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/search');
      const response = await stocksSearch(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_SYMBOL');
    });

    it('應該處理包含特殊字元的有效股票代碼', async () => {
      const specialSymbol = 'BRK.A';
      const mockDetails = { symbol: specialSymbol, name: 'Berkshire Hathaway', price: 400000 };
      vi.mocked(alphaVantageClient.getStockDetails).mockResolvedValue(mockDetails);

      const params = Promise.resolve({ symbol: specialSymbol });
      const request = new NextRequest(`http://localhost:3000/api/stocks/${specialSymbol}`);
      const response = await stocksDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('應該處理 API 回應格式一致性', async () => {
      const request = new NextRequest('http://localhost:3000/api/charts');
      const response = await chartsInfo(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('timestamp');
      expect(data.success).toBe(true);
      expect(typeof data.timestamp).toBe('string');
    });

    it('應該處理未知錯誤類型', async () => {
      vi.mocked(alphaVantageClient.searchStocks).mockRejectedValue(new Error('Unknown error'));

      const request = new NextRequest('http://localhost:3000/api/stocks/search?query=AAPL');
      const response = await stocksSearch(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_API_ERROR');
    });
  });
});