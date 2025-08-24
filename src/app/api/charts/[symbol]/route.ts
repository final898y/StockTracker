import { NextRequest, NextResponse } from 'next/server';
import { chartDataClient } from '@/services/chart-data';
import { ERROR_CODES, ERROR_MESSAGES, TIMEFRAMES } from '@/constants';
import { BaseApiResponse, ChartResponse, AssetType, TimeframeType } from '@/types';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ symbol: string }> }
) {
  let symbol: string = '';
  
  try {
    const resolvedParams = await params;
    symbol = resolvedParams.symbol;
    const { searchParams } = new URL(request.url);

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

    // Get and validate query parameters
    const assetType = searchParams.get('assetType') as AssetType;
    const timeframe = (searchParams.get('timeframe') || '1M') as TimeframeType;
    const includeValidation = searchParams.get('includeValidation') === 'true';

    // Validate asset type
    if (!assetType || !['stock', 'crypto'].includes(assetType)) {
      return NextResponse.json<BaseApiResponse>({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_SYMBOL,
          message: 'Invalid or missing assetType parameter',
          details: { 
            reason: 'assetType must be either "stock" or "crypto"',
            provided: assetType 
          }
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate timeframe
    if (!chartDataClient.isTimeframeSupported(timeframe)) {
      return NextResponse.json<BaseApiResponse>({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_SYMBOL,
          message: 'Invalid timeframe parameter',
          details: { 
            reason: `Timeframe must be one of: ${Object.keys(TIMEFRAMES).join(', ')}`,
            provided: timeframe,
            supported: chartDataClient.getSupportedTimeframes()
          }
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate symbol format based on asset type
    if (assetType === 'stock') {
      const stockSymbolPattern = /^[A-Za-z0-9.-]{1,10}$/;
      if (!stockSymbolPattern.test(symbol)) {
        return NextResponse.json<BaseApiResponse>({
          success: false,
          error: {
            code: ERROR_CODES.INVALID_SYMBOL,
            message: ERROR_MESSAGES[ERROR_CODES.INVALID_SYMBOL],
            details: { reason: 'Invalid stock symbol format' }
          },
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }
    } else if (assetType === 'crypto') {
      const cryptoSymbolPattern = /^[a-zA-Z0-9-_]{1,50}$/;
      if (!cryptoSymbolPattern.test(symbol)) {
        return NextResponse.json<BaseApiResponse>({
          success: false,
          error: {
            code: ERROR_CODES.INVALID_SYMBOL,
            message: ERROR_MESSAGES[ERROR_CODES.INVALID_SYMBOL],
            details: { reason: 'Invalid crypto symbol format' }
          },
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }
    }

    // Get chart data
    let chartResponse: ChartResponse;
    let validation: { isValid: boolean; issues: string[] } | undefined;

    if (includeValidation) {
      const validatedResponse = await chartDataClient.getValidatedChartData(symbol, assetType, timeframe);
      chartResponse = {
        symbol: validatedResponse.symbol,
        timeframe: validatedResponse.timeframe,
        data: validatedResponse.data,
      };
      validation = validatedResponse.validation;
    } else {
      chartResponse = await chartDataClient.getChartData(symbol, assetType, timeframe);
    }

    // Prepare response data
    const responseData: ChartResponse & { validation?: { isValid: boolean; issues: string[] } } = {
      ...chartResponse,
      ...(validation && { validation })
    };

    return NextResponse.json<BaseApiResponse<typeof responseData>>({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Chart data API error for symbol ${symbol}:`, error);

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