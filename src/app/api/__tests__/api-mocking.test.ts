/**
 * API Mock 測試
 * 測試各種 Mock 外部 API 回應的情況
 */

import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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
    isTimeframeSupported: vi.fn(() => true),
    getSupportedTimeframes: vi.fn(() => ['1D', '1W', '1M', '3M', '1Y']),
    getTimeframeConfig: vi.fn(),
  },
}));

vi.mock('@/lib/api-usage-tracker', () => ({
  getAllUsageData: vi.fn(),
  incrementApiUsage: vi.fn(),
  checkApiAvailability: vi.fn(() => ({ available: true, remaining: 100, resetTime: null })),
}));

import { alphaVantageClient } from '@/services/alpha-vantage';
import { coinGeckoClient } from '@/services/coingecko';
import { chartDataClient } from '@/services/chart-data';
import { getAllUsageData } from '@/lib/api-usage-tracker';

describe('Alpha Vantage API Mocking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Stock Search Mocking', () => {
    it('應該 Mock 成功的股票搜尋回應', async () => {
      const mockSearchResults = [
        {
          '1. symbol': 'AAPL',
          '2. name': 'Apple Inc.',
          '3. type': 'Equity',
          '4. region': 'United States',
          '5. marketOpen': '09:30',
          '6. marketClose': '16:00',
          '7. timezone': 'UTC-04',
          '8. currency': 'USD',
          '9. matchScore': '1.0000'
        },
        {
          '1. symbol': 'AAPLW',
          '2. name': 'Apple Inc. Warrants',
          '3. type': 'Warrant',
          '4. region': 'United States',
          '5. marketOpen': '09:30',
          '6. marketClose': '16:00',
          '7. timezone': 'UTC-04',
          '8. currency': 'USD',
          '9. matchScore': '0.8000'
        }
      ];

      vi.mocked(alphaVantageClient.searchStocks).mockResolvedValue(mockSearchResults);

      const { GET } = await import('../stocks/search/route');
      const request = new NextRequest('http://localhost:3000/api/stocks/search?query=AAPL');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockSearchResults);
      expect(alphaVantageClient.searchStocks).toHaveBeenCalledWith('AAPL');
    });

    it('應該 Mock 空的搜尋結果', async () => {
      vi.mocked(alphaVantageClient.searchStocks).mockResolvedValue([]);

      const { GET } = await import('../stocks/search/route');
      const request = new NextRequest('http://localhost:3000/api/stocks/search?query=NONEXISTENT');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('應該 Mock API 限制錯誤', async () => {
      vi.mocked(alphaVantageClient.searchStocks).mockRejectedValue({
        errorCode: 'API_RATE_LIMIT',
        message: 'API call frequency is 5 calls per minute and 500 calls per day',
        details: { 
          callsPerMinute: 5,
          callsPerDay: 500,
          currentCalls: 6
        }
      });

      const { GET } = await import('../stocks/search/route');
      const request = new NextRequest('http://localhost:3000/api/stocks/search?query=AAPL');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_API_ERROR');
    });
  });

  describe('Stock Details Mocking', () => {
    it('應該 Mock 成功的股票詳情回應', async () => {
      const mockStockDetails = {
        '01. symbol': 'AAPL',
        '02. open': '150.00',
        '03. high': '155.50',
        '04. low': '149.25',
        '05. price': '152.75',
        '06. volume': '45678900',
        '07. latest trading day': '2024-01-15',
        '08. previous close': '151.25',
        '09. change': '1.50',
        '10. change percent': '0.99%'
      };

      vi.mocked(alphaVantageClient.getStockDetails).mockResolvedValue(mockStockDetails);

      const { GET } = await import('../stocks/[symbol]/route');
      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/stocks/AAPL');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStockDetails);
    });

    it('應該 Mock 股票不存在錯誤', async () => {
      vi.mocked(alphaVantageClient.getStockDetails).mockRejectedValue({
        errorCode: 'ASSET_NOT_FOUND',
        message: 'Invalid API call. Please retry or visit the documentation',
        details: { symbol: 'INVALID' }
      });

      const { GET } = await import('../stocks/[symbol]/route');
      const params = Promise.resolve({ symbol: 'INVALID' });
      const request = new NextRequest('http://localhost:3000/api/stocks/INVALID');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('ASSET_NOT_FOUND');
    });

    it('應該 Mock 網路錯誤', async () => {
      vi.mocked(alphaVantageClient.getStockDetails).mockRejectedValue({
        errorCode: 'NETWORK_ERROR',
        message: 'Network request failed',
        details: { 
          code: 'ECONNREFUSED',
          errno: -61,
          syscall: 'connect'
        }
      });

      const { GET } = await import('../stocks/[symbol]/route');
      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/stocks/AAPL');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NETWORK_ERROR');
    });
  });
});

describe('CoinGecko API Mocking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Crypto Search Mocking', () => {
    it('應該 Mock 成功的加密貨幣搜尋回應', async () => {
      const mockSearchResults = [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          market_cap_rank: 1,
          thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
          large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
        },
        {
          id: 'bitcoin-cash',
          name: 'Bitcoin Cash',
          symbol: 'BCH',
          market_cap_rank: 15,
          thumb: 'https://assets.coingecko.com/coins/images/780/thumb/bitcoin-cash-circle.png',
          large: 'https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png'
        }
      ];

      vi.mocked(coinGeckoClient.searchCrypto).mockResolvedValue(mockSearchResults);

      const { GET } = await import('../crypto/search/route');
      const request = new NextRequest('http://localhost:3000/api/crypto/search?query=bitcoin');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockSearchResults);
      expect(coinGeckoClient.searchCrypto).toHaveBeenCalledWith('bitcoin');
    });

    it('應該 Mock 加密貨幣搜尋無結果', async () => {
      vi.mocked(coinGeckoClient.searchCrypto).mockResolvedValue([]);

      const { GET } = await import('../crypto/search/route');
      const request = new NextRequest('http://localhost:3000/api/crypto/search?query=nonexistentcoin');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });
  });

  describe('Crypto Details Mocking', () => {
    it('應該 Mock 成功的加密貨幣詳情回應', async () => {
      const mockCryptoDetails = {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: {
          thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
          small: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
          large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
        },
        market_data: {
          current_price: { usd: 45000 },
          price_change_24h: 1200,
          price_change_percentage_24h: 2.74,
          market_cap: { usd: 880000000000 },
          total_volume: { usd: 25000000000 }
        },
        last_updated: '2024-01-15T10:30:00.000Z'
      };

      vi.mocked(coinGeckoClient.getCryptoDetails).mockResolvedValue(mockCryptoDetails);

      const { GET } = await import('../crypto/[symbol]/route');
      const params = Promise.resolve({ symbol: 'bitcoin' });
      const request = new NextRequest('http://localhost:3000/api/crypto/bitcoin');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCryptoDetails);
    });

    it('應該 Mock 加密貨幣不存在錯誤', async () => {
      vi.mocked(coinGeckoClient.getCryptoDetails).mockRejectedValue({
        errorCode: 'ASSET_NOT_FOUND',
        message: 'Coin not found',
        details: { coinId: 'nonexistent-coin' }
      });

      const { GET } = await import('../crypto/[symbol]/route');
      const params = Promise.resolve({ symbol: 'nonexistent-coin' });
      const request = new NextRequest('http://localhost:3000/api/crypto/nonexistent-coin');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('ASSET_NOT_FOUND');
    });
  });
});

describe('Chart Data API Mocking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Chart Data Mocking', () => {
    it('應該 Mock 成功的股票圖表資料', async () => {
      const mockChartData = {
        symbol: 'AAPL',
        timeframe: '1M',
        data: [
          {
            timestamp: 1640995200000, // 2022-01-01
            open: 150.00,
            high: 155.50,
            low: 149.25,
            close: 152.75,
            volume: 45678900
          },
          {
            timestamp: 1641081600000, // 2022-01-02
            open: 152.75,
            high: 158.20,
            low: 151.80,
            close: 157.45,
            volume: 52341200
          }
        ]
      };

      vi.mocked(chartDataClient.getChartData).mockResolvedValue(mockChartData);

      const { GET } = await import('../charts/[symbol]/route');
      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/charts/AAPL?assetType=stock&timeframe=1M');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockChartData);
      expect(chartDataClient.getChartData).toHaveBeenCalledWith('AAPL', 'stock', '1M');
    });

    it('應該 Mock 加密貨幣圖表資料', async () => {
      const mockChartData = {
        symbol: 'bitcoin',
        timeframe: '1W',
        data: [
          {
            timestamp: 1640995200000,
            open: 45000,
            high: 46500,
            low: 44200,
            close: 45800,
            volume: 1234567
          }
        ]
      };

      vi.mocked(chartDataClient.getChartData).mockResolvedValue(mockChartData);

      const { GET } = await import('../charts/[symbol]/route');
      const params = Promise.resolve({ symbol: 'bitcoin' });
      const request = new NextRequest('http://localhost:3000/api/charts/bitcoin?assetType=crypto&timeframe=1W');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockChartData);
    });

    it('應該 Mock 驗證模式的圖表資料', async () => {
      const mockValidatedData = {
        symbol: 'AAPL',
        timeframe: '1M',
        data: [],
        validation: {
          isValid: false,
          issues: ['Missing data points', 'Invalid timestamp format']
        }
      };

      vi.mocked(chartDataClient.getValidatedChartData).mockResolvedValue(mockValidatedData);

      const { GET } = await import('../charts/[symbol]/route');
      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/charts/AAPL?assetType=stock&includeValidation=true');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.validation).toBeDefined();
      expect(data.data.validation.isValid).toBe(false);
      expect(data.data.validation.issues).toHaveLength(2);
    });

    it('應該 Mock 批次圖表請求', async () => {
      const mockBatchResults = [
        { symbol: 'AAPL', timeframe: '1M', data: [] },
        { symbol: 'GOOGL', timeframe: '1M', data: [] },
        { symbol: 'bitcoin', timeframe: '1M', data: [] }
      ];

      vi.mocked(chartDataClient.getMultipleChartData).mockResolvedValue(mockBatchResults);

      const { POST } = await import('../charts/route');
      const batchRequest = [
        { symbol: 'AAPL', assetType: 'stock' as const },
        { symbol: 'GOOGL', assetType: 'stock' as const },
        { symbol: 'bitcoin', assetType: 'crypto' as const }
      ];

      const request = new NextRequest('http://localhost:3000/api/charts', {
        method: 'POST',
        body: JSON.stringify(batchRequest),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockBatchResults);
      expect(chartDataClient.getMultipleChartData).toHaveBeenCalledWith(batchRequest);
    });
  });
});

describe('Usage Tracking API Mocking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('應該 Mock API 使用量資料', async () => {
    const mockUsageData = {
      'Alpha Vantage': {
        count: 45,
        limit: 500,
        resetTime: '2024-01-16T00:00:00.000Z',
        remaining: 455
      },
      'CoinGecko': {
        count: 23,
        limit: 100,
        resetTime: '2024-01-15T12:00:00.000Z',
        remaining: 77
      }
    };

    vi.mocked(getAllUsageData).mockReturnValue(mockUsageData);

    const { GET } = await import('../usage/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.usage).toEqual(mockUsageData);
  });

  it('應該 Mock 使用量獲取錯誤', async () => {
    vi.mocked(getAllUsageData).mockImplementation(() => {
      throw new Error('Redis connection failed');
    });

    const { GET } = await import('../usage/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('USAGE_FETCH_ERROR');
  });
});

describe('Complex Mock Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('應該 Mock 連續的 API 調用', async () => {
    // 第一次調用成功
    vi.mocked(alphaVantageClient.searchStocks)
      .mockResolvedValueOnce([{ symbol: 'AAPL', name: 'Apple Inc.' }])
      .mockResolvedValueOnce([{ symbol: 'GOOGL', name: 'Alphabet Inc.' }]);

    const { GET } = await import('../stocks/search/route');

    // 第一次請求
    const request1 = new NextRequest('http://localhost:3000/api/stocks/search?query=AAPL');
    const response1 = await GET(request1);
    const data1 = await response1.json();

    expect(data1.data[0].symbol).toBe('AAPL');

    // 第二次請求
    const request2 = new NextRequest('http://localhost:3000/api/stocks/search?query=GOOGL');
    const response2 = await GET(request2);
    const data2 = await response2.json();

    expect(data2.data[0].symbol).toBe('GOOGL');
    expect(alphaVantageClient.searchStocks).toHaveBeenCalledTimes(2);
  });

  it('應該 Mock 條件性回應', async () => {
    vi.mocked(coinGeckoClient.searchCrypto).mockImplementation((query: string) => {
      if (query === 'bitcoin') {
        return Promise.resolve([{ id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' }]);
      } else if (query === 'ethereum') {
        return Promise.resolve([{ id: 'ethereum', name: 'Ethereum', symbol: 'ETH' }]);
      } else {
        return Promise.resolve([]);
      }
    });

    const { GET } = await import('../crypto/search/route');

    // 測試 Bitcoin 搜尋
    const bitcoinRequest = new NextRequest('http://localhost:3000/api/crypto/search?query=bitcoin');
    const bitcoinResponse = await GET(bitcoinRequest);
    const bitcoinData = await bitcoinResponse.json();

    expect(bitcoinData.data[0].name).toBe('Bitcoin');

    // 測試 Ethereum 搜尋
    const ethRequest = new NextRequest('http://localhost:3000/api/crypto/search?query=ethereum');
    const ethResponse = await GET(ethRequest);
    const ethData = await ethResponse.json();

    expect(ethData.data[0].name).toBe('Ethereum');

    // 測試無結果搜尋
    const noResultRequest = new NextRequest('http://localhost:3000/api/crypto/search?query=unknown');
    const noResultResponse = await GET(noResultRequest);
    const noResultData = await noResultResponse.json();

    expect(noResultData.data).toEqual([]);
  });

  it('應該 Mock 延遲回應', async () => {
    vi.mocked(alphaVantageClient.getStockDetails).mockImplementation(
      () => new Promise(resolve => 
        setTimeout(() => resolve({ symbol: 'AAPL', price: 150 }), 100)
      )
    );

    const { GET } = await import('../stocks/[symbol]/route');
    const params = Promise.resolve({ symbol: 'AAPL' });
    const request = new NextRequest('http://localhost:3000/api/stocks/AAPL');

    const startTime = Date.now();
    const response = await GET(request, { params });
    const endTime = Date.now();
    const data = await response.json();

    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    expect(data.success).toBe(true);
    expect(data.data.symbol).toBe('AAPL');
  });
});