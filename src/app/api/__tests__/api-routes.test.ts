/**
 * Basic API Routes Tests
 * Tests the API endpoints for proper error handling and response format
 */

import { NextRequest } from 'next/server';
import { GET as stocksSearch } from '../stocks/search/route';
import { GET as stocksDetails } from '../stocks/[symbol]/route';
import { GET as cryptoSearch } from '../crypto/search/route';
import { GET as cryptoDetails } from '../crypto/[symbol]/route';
import { GET as chartsDetails } from '../charts/[symbol]/route';
import { GET as chartsInfo } from '../charts/route';

// Mock environment variables
process.env.ALPHA_VANTAGE_API_KEY = 'test-key';
process.env.COINGECKO_API_KEY = 'test-key';

describe('API Routes Error Handling', () => {
  describe('Stock Search API', () => {
    it('should return error for missing query parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/search');
      const response = await stocksSearch(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_SYMBOL');
    });

    it('should return error for empty query parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/search?query=');
      const response = await stocksSearch(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_SYMBOL');
    });

    it('should return error for query too long', async () => {
      const longQuery = 'a'.repeat(51);
      const request = new NextRequest(`http://localhost:3000/api/stocks/search?query=${longQuery}`);
      const response = await stocksSearch(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_SYMBOL');
    });
  });

  describe('Stock Details API', () => {
    it('should return error for invalid symbol format', async () => {
      const params = Promise.resolve({ symbol: 'INVALID@SYMBOL!' });
      const request = new NextRequest('http://localhost:3000/api/stocks/INVALID@SYMBOL!');
      const response = await stocksDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_SYMBOL');
    });

    it('should return error for empty symbol', async () => {
      const params = Promise.resolve({ symbol: '' });
      const request = new NextRequest('http://localhost:3000/api/stocks/');
      const response = await stocksDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_SYMBOL');
    });
  });

  describe('Crypto Search API', () => {
    it('should return error for missing query parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/crypto/search');
      const response = await cryptoSearch(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_SYMBOL');
    });
  });

  describe('Crypto Details API', () => {
    it('should return error for invalid symbol format', async () => {
      const params = Promise.resolve({ symbol: 'invalid@symbol!' });
      const request = new NextRequest('http://localhost:3000/api/crypto/invalid@symbol!');
      const response = await cryptoDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_SYMBOL');
    });
  });

  describe('Charts API', () => {
    it('should return API info for GET request without parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/charts');
      const response = await chartsInfo(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Chart Data API');
    });

    it('should return timeframes for action=timeframes', async () => {
      const request = new NextRequest('http://localhost:3000/api/charts?action=timeframes');
      const response = await chartsInfo(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return error for missing assetType in chart details', async () => {
      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/charts/AAPL');
      const response = await chartsDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('assetType');
    });

    it('should return error for invalid assetType', async () => {
      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/charts/AAPL?assetType=invalid');
      const response = await chartsDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('assetType');
    });

    it('should return error for invalid timeframe', async () => {
      const params = Promise.resolve({ symbol: 'AAPL' });
      const request = new NextRequest('http://localhost:3000/api/charts/AAPL?assetType=stock&timeframe=invalid');
      const response = await chartsDetails(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('timeframe');
    });
  });
});

describe('API Response Format', () => {
  it('should have consistent error response format', async () => {
    const request = new NextRequest('http://localhost:3000/api/stocks/search');
    const response = await stocksSearch(request);
    const data = await response.json();

    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('timestamp');
    expect(data.error).toHaveProperty('code');
    expect(data.error).toHaveProperty('message');
    expect(data.error).toHaveProperty('details');
  });

  it('should have consistent success response format for charts info', async () => {
    const request = new NextRequest('http://localhost:3000/api/charts');
    const response = await chartsInfo(request);
    const data = await response.json();

    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('timestamp');
    expect(data.success).toBe(true);
  });
});

describe('HTTP Methods', () => {
  it('should return 405 for unsupported POST method on stock search', async () => {
    const { POST } = await import('../stocks/search/route');
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(405);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('should return 405 for unsupported PUT method on crypto details', async () => {
    const { PUT } = await import('../crypto/[symbol]/route');
    const response = await PUT();
    const data = await response.json();

    expect(response.status).toBe(405);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
  });
});