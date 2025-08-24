import { NextRequest, NextResponse } from 'next/server';
import { alphaVantageClient } from '@/services/alpha-vantage';
import { ERROR_CODES, ERROR_MESSAGES } from '@/constants';
import { BaseApiResponse, StockSearchResult } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      return NextResponse.json<BaseApiResponse>({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_SYMBOL,
          message: ERROR_MESSAGES[ERROR_CODES.INVALID_SYMBOL],
          details: { reason: 'Query parameter is required' }
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate query length (prevent abuse)
    if (query.length > 50) {
      return NextResponse.json<BaseApiResponse>({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_SYMBOL,
          message: ERROR_MESSAGES[ERROR_CODES.INVALID_SYMBOL],
          details: { reason: 'Query too long' }
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Check if Alpha Vantage client is configured
    if (!alphaVantageClient.isConfigured()) {
      return NextResponse.json<BaseApiResponse>({
        success: false,
        error: {
          code: ERROR_CODES.EXTERNAL_API_ERROR,
          message: 'Stock search service is not configured',
          details: { reason: 'Missing API key' }
        },
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    // Search for stocks
    const results = await alphaVantageClient.searchStocks(query);

    return NextResponse.json<BaseApiResponse<StockSearchResult[]>>({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stock search API error:', error);

    // Handle known error types
    if (error && typeof error === 'object' && 'errorCode' in error) {
      const knownError = error as { errorCode: string; message: string; details?: Record<string, unknown> };
      
      const statusCode = knownError.errorCode === ERROR_CODES.API_RATE_LIMIT ? 429 :
                        knownError.errorCode === ERROR_CODES.ASSET_NOT_FOUND ? 404 :
                        knownError.errorCode === ERROR_CODES.NETWORK_ERROR ? 503 : 500;

      return NextResponse.json<BaseApiResponse>({
        success: false,
        error: {
          code: knownError.errorCode,
          message: knownError.message,
          details: knownError.details
        },
        timestamp: new Date().toISOString()
      }, { status: statusCode });
    }

    // Handle unknown errors
    return NextResponse.json<BaseApiResponse>({
      success: false,
      error: {
        code: ERROR_CODES.EXTERNAL_API_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.EXTERNAL_API_ERROR],
        details: { 
          originalError: error instanceof Error ? error.message : String(error)
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json<BaseApiResponse>({
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed'
    },
    timestamp: new Date().toISOString()
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json<BaseApiResponse>({
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed'
    },
    timestamp: new Date().toISOString()
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json<BaseApiResponse>({
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed'
    },
    timestamp: new Date().toISOString()
  }, { status: 405 });
}