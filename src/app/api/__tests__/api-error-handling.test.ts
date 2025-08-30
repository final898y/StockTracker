/**
 * API 錯誤處理專項測試
 * 專門測試各種錯誤情況和邊界條件
 */

import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ApiErrorHandler, withApiErrorHandling } from '@/lib/api-error-handler';

// Mock external services for error testing
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

vi.mock('@/lib/api-usage-tracker', () => ({
  incrementApiUsage: vi.fn(),
  checkApiAvailability: vi.fn(() => ({ available: true, remaining: 100, resetTime: null })),
}));

import { alphaVantageClient } from '@/services/alpha-vantage';
import { coinGeckoClient } from '@/services/coingecko';

describe('API Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ApiErrorHandler.handleError', () => {
    it('應該處理自定義錯誤對象', () => {
      const customError = {
        code: 'CUSTOM_ERROR',
        message: '自定義錯誤訊息',
        details: { reason: 'test' }
      };

      const response = ApiErrorHandler.handleError(customError, 'Test Context');
      expect(response.status).toBe(500);
    });

    it('應該處理 HTTP 錯誤', () => {
      const httpError = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      };

      const response = ApiErrorHandler.handleError(httpError, 'HTTP Test');
      expect(response.status).toBe(404);
    });

    it('應該處理網路錯誤', () => {
      const networkError = {
        code: 'ENOTFOUND'
      };

      const response = ApiErrorHandler.handleError(networkError, 'Network Test');
      expect(response.status).toBe(500);
    });

    it('應該處理超時錯誤', () => {
      const timeoutError = {
        code: 'ETIMEDOUT'
      };

      const response = ApiErrorHandler.handleError(timeoutError, 'Timeout Test');
      expect(response.status).toBe(500);
    });

    it('應該處理 TimeoutError 類型', () => {
      const timeoutError = {
        name: 'TimeoutError',
        message: 'Request timeout'
      };

      const response = ApiErrorHandler.handleError(timeoutError, 'Timeout Test');
      expect(response.status).toBe(500);
    });

    it('應該處理未知錯誤', () => {
      const unknownError = 'Unknown string error';

      const response = ApiErrorHandler.handleError(unknownError, 'Unknown Test');
      expect(response.status).toBe(500);
    });
  });

  describe('ApiErrorHandler.createErrorResponse', () => {
    it('應該創建標準錯誤回應', async () => {
      const response = ApiErrorHandler.createErrorResponse(
        'TEST_ERROR',
        '測試錯誤訊息',
        { test: true },
        400
      );

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('TEST_ERROR');
      expect(data.error.message).toBe('測試錯誤訊息');
      expect(data.error.details.test).toBe(true);
      expect(data.timestamp).toBeDefined();
    });

    it('應該使用預設狀態碼 500', async () => {
      const response = ApiErrorHandler.createErrorResponse('TEST_ERROR', '測試錯誤');
      expect(response.status).toBe(500);
    });
  });

  describe('ApiErrorHandler.createSuccessResponse', () => {
    it('應該創建成功回應', async () => {
      const testData = { test: 'data' };
      const response = ApiErrorHandler.createSuccessResponse(testData, '成功訊息');

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(testData);
      expect(data.message).toBe('成功訊息');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('ApiErrorHandler.validateRequest', () => {
    it('應該驗證必要參數存在', () => {
      const request = new Request('http://localhost:3000/test?param1=value1&param2=value2');
      const result = ApiErrorHandler.validateRequest(request, ['param1', 'param2']);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('應該檢測缺少的參數', async () => {
      const request = new Request('http://localhost:3000/test?param1=value1');
      const result = ApiErrorHandler.validateRequest(request, ['param1', 'param2']);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();

      const errorData = await result.error!.json();
      expect(errorData.error.code).toBe('INVALID_SYMBOL');
      expect(errorData.error.message).toContain('缺少必要參數');
      expect(errorData.error.details.missingParams).toEqual(['param2']);
    });

    it('應該檢測空參數', async () => {
      const request = new Request('http://localhost:3000/test?param1=&param2=value2');
      const result = ApiErrorHandler.validateRequest(request, ['param1', 'param2']);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();

      const errorData = await result.error!.json();
      expect(errorData.error.details.missingParams).toEqual(['param1']);
    });
  });

  describe('ApiErrorHandler.withErrorHandling', () => {
    it('應該成功執行操作並記錄使用量', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success result');
      
      const result = await ApiErrorHandler.withErrorHandling(
        mockOperation,
        'TestProvider',
        'Test Operation'
      );

      expect(result).toBe('success result');
      expect(mockOperation).toHaveBeenCalledOnce();
    });

    it('應該處理 API 不可用的情況', async () => {
      const { checkApiAvailability } = await import('@/lib/api-usage-tracker');
      vi.mocked(checkApiAvailability).mockReturnValue({
        available: false,
        remaining: 0,
        resetTime: new Date()
      });

      const mockOperation = vi.fn();

      await expect(
        ApiErrorHandler.withErrorHandling(mockOperation, 'TestProvider', 'Test Operation')
      ).rejects.toMatchObject({
        code: 'API_RATE_LIMIT',
        message: 'TestProvider API 使用量已達上限'
      });

      expect(mockOperation).not.toHaveBeenCalled();
    });

    it('應該重新拋出操作錯誤', async () => {
      // 確保 API 可用，這樣才會執行操作
      const { checkApiAvailability } = await import('@/lib/api-usage-tracker');
      vi.mocked(checkApiAvailability).mockReturnValue({
        available: true,
        remaining: 100,
        resetTime: null
      });

      const testError = new Error('Operation failed');
      const mockOperation = vi.fn().mockRejectedValue(testError);

      await expect(
        ApiErrorHandler.withErrorHandling(mockOperation, 'TestProvider', 'Test Operation')
      ).rejects.toBe(testError);
    });
  });

  describe('withApiErrorHandling 裝飾器', () => {
    it('應該包裝 API 路由處理器', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }))
      );

      const wrappedHandler = withApiErrorHandling(mockHandler);
      const request = new NextRequest('http://localhost:3000/test');

      const response = await wrappedHandler(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith(request, undefined);
    });

    it('應該捕獲並處理處理器錯誤', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Handler error'));
      const wrappedHandler = withApiErrorHandling(mockHandler);
      const request = new NextRequest('http://localhost:3000/test');

      const response = await wrappedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_API_ERROR');
    });
  });
});

describe('Specific Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rate Limiting Errors', () => {
    it('應該正確處理 Alpha Vantage 限制錯誤', async () => {
      vi.mocked(alphaVantageClient.searchStocks).mockRejectedValue({
        errorCode: 'API_RATE_LIMIT',
        message: 'API call frequency is 5 calls per minute',
        details: { provider: 'Alpha Vantage' }
      });

      const { GET } = await import('../stocks/search/route');
      const request = new NextRequest('http://localhost:3000/api/stocks/search?query=AAPL');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_API_ERROR');
    });

    it('應該正確處理 CoinGecko 限制錯誤', async () => {
      vi.mocked(coinGeckoClient.searchCrypto).mockRejectedValue({
        errorCode: 'API_RATE_LIMIT',
        message: 'Rate limit exceeded',
        details: { provider: 'CoinGecko' }
      });

      const { GET } = await import('../crypto/search/route');
      const request = new NextRequest('http://localhost:3000/api/crypto/search?query=bitcoin');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('API_RATE_LIMIT');
    });
  });

  describe('Network Errors', () => {
    it('應該處理 DNS 解析錯誤', async () => {
      vi.mocked(alphaVantageClient.getStockDetails).mockRejectedValue({
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND api.example.com'
      });

      const { GET } = await import('../stocks/[symbol]/route');
      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/stocks/AAPL');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_API_ERROR');
    });

    it('應該處理連線拒絕錯誤', async () => {
      vi.mocked(coinGeckoClient.getCryptoDetails).mockRejectedValue({
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED 127.0.0.1:80'
      });

      const { GET } = await import('../crypto/[symbol]/route');
      const params = Promise.resolve({ symbol: 'bitcoin' });
      const request = new NextRequest('http://localhost:3000/api/crypto/bitcoin');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_API_ERROR');
    });
  });

  describe('Malformed Data Errors', () => {
    it('應該處理無效 JSON 回應', async () => {
      // 先確保 API 可用
      const { checkApiAvailability } = await import('@/lib/api-usage-tracker');
      vi.mocked(checkApiAvailability).mockReturnValue({
        available: true,
        remaining: 100,
        resetTime: null
      });

      vi.mocked(alphaVantageClient.searchStocks).mockRejectedValue(
        new SyntaxError('Unexpected token < in JSON at position 0')
      );

      const { GET } = await import('../stocks/search/route');
      const request = new NextRequest('http://localhost:3000/api/stocks/search?query=AAPL');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_API_ERROR');
    });

    it('應該處理空回應', async () => {
      vi.mocked(coinGeckoClient.searchCrypto).mockResolvedValue(null as any);

      const { GET } = await import('../crypto/search/route');
      const request = new NextRequest('http://localhost:3000/api/crypto/search?query=bitcoin');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeNull();
    });
  });

  describe('Authentication Errors', () => {
    it('應該處理無效 API 金鑰', async () => {
      vi.mocked(alphaVantageClient.isConfigured).mockReturnValue(false);

      const { GET } = await import('../stocks/[symbol]/route');
      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/stocks/AAPL');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_API_ERROR');
      expect(data.error.message).toContain('not configured');
    });

    it('應該處理 API 金鑰過期', async () => {
      vi.mocked(alphaVantageClient.getStockDetails).mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Invalid API key' }
        }
      });

      const { GET } = await import('../stocks/[symbol]/route');
      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/stocks/AAPL');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_API_ERROR');
    });
  });
});