import { NextRequest, NextResponse } from 'next/server';
import { coinGeckoClient } from '@/services/coingecko';
import { ERROR_CODES, ERROR_MESSAGES } from '@/constants';
import { BaseApiResponse, CryptoDetailsResponse } from '@/types';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ symbol: string }> }
) {
  let symbol: string = '';
  
  try {
    const resolvedParams = await params;
    symbol = resolvedParams.symbol;

    // Validate symbol parameter
    if (!symbol || symbol.trim().length === 0) {
      return NextResponse.json<BaseApiResponse>({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_SYMBOL,
          message: ERROR_MESSAGES[ERROR_CODES.INVALID_SYMBOL],
          details: { reason: 'Symbol parameter is required' }
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate symbol format (basic validation for crypto IDs)
    const symbolPattern = /^[a-zA-Z0-9-_]{1,50}$/;
    if (!symbolPattern.test(symbol)) {
      return NextResponse.json<BaseApiResponse>({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_SYMBOL,
          message: ERROR_MESSAGES[ERROR_CODES.INVALID_SYMBOL],
          details: { reason: 'Invalid symbol format' }
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Get cryptocurrency details
    const cryptoDetails = await coinGeckoClient.getCryptoDetails(symbol);

    return NextResponse.json<BaseApiResponse<CryptoDetailsResponse>>({
      success: true,
      data: cryptoDetails,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Crypto details API error for symbol ${symbol}:`, error);

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
          originalError: error instanceof Error ? error.message : String(error),
          symbol: symbol
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