import { NextRequest, NextResponse } from 'next/server';
import { chartDataClient } from '@/services/chart-data';
import { ERROR_CODES, ERROR_MESSAGES } from '@/constants';
import { BaseApiResponse, ChartResponse, AssetType, TimeframeType } from '@/types';

// Interface for batch chart request
interface BatchChartRequest {
  symbol: string;
  assetType: AssetType;
  timeframe?: TimeframeType;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Handle different actions
    switch (action) {
      case 'timeframes':
        return getTimeframes();
      case 'config':
        return getConfiguration();
      default:
        return getApiInfo();
    }

  } catch (error) {
    console.error('Charts API error:', error);

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle batch chart data requests
    if (Array.isArray(body) && body.length > 0) {
      return handleBatchRequest(body);
    }

    // Handle single chart request via POST
    if (body.symbol && body.assetType) {
      return handleSingleRequest(body);
    }

    return NextResponse.json<BaseApiResponse>({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_SYMBOL,
        message: 'Invalid request body',
        details: { 
          reason: 'Expected array of chart requests or single chart request object',
          received: typeof body
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 400 });

  } catch (error) {
    console.error('Charts batch API error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json<BaseApiResponse>({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_SYMBOL,
          message: 'Invalid JSON in request body',
          details: { originalError: error.message }
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

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

// Get supported timeframes
function getTimeframes() {
  const timeframes = chartDataClient.getSupportedTimeframes();
  const timeframeDetails = timeframes.map(tf => ({
    value: tf,
    config: chartDataClient.getTimeframeConfig(tf)
  }));

  return NextResponse.json<BaseApiResponse<typeof timeframeDetails>>({
    success: true,
    data: timeframeDetails,
    timestamp: new Date().toISOString()
  });
}

// Get chart configuration
function getConfiguration() {
  const config = {
    supportedAssetTypes: ['stock', 'crypto'],
    supportedTimeframes: chartDataClient.getSupportedTimeframes(),
    maxBatchSize: 10,
    endpoints: {
      single: '/api/charts/[symbol]',
      batch: '/api/charts',
      timeframes: '/api/charts?action=timeframes',
      config: '/api/charts?action=config'
    },
    parameters: {
      required: ['symbol', 'assetType'],
      optional: ['timeframe', 'includeValidation']
    }
  };

  return NextResponse.json<BaseApiResponse<typeof config>>({
    success: true,
    data: config,
    timestamp: new Date().toISOString()
  });
}

// Get API information
function getApiInfo() {
  const info = {
    name: 'Chart Data API',
    version: '1.0.0',
    description: 'Provides historical chart data for stocks and cryptocurrencies',
    endpoints: {
      'GET /api/charts': 'Get API information',
      'GET /api/charts?action=timeframes': 'Get supported timeframes',
      'GET /api/charts?action=config': 'Get API configuration',
      'GET /api/charts/[symbol]': 'Get chart data for a specific symbol',
      'POST /api/charts': 'Batch chart data requests'
    },
    supportedAssetTypes: ['stock', 'crypto'],
    supportedTimeframes: chartDataClient.getSupportedTimeframes()
  };

  return NextResponse.json<BaseApiResponse<typeof info>>({
    success: true,
    data: info,
    timestamp: new Date().toISOString()
  });
}

// Handle batch chart requests
async function handleBatchRequest(requests: BatchChartRequest[]) {
  // Validate batch size
  if (requests.length > 10) {
    return NextResponse.json<BaseApiResponse>({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_SYMBOL,
        message: 'Batch size too large',
        details: { 
          reason: 'Maximum 10 requests per batch',
          received: requests.length
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  // Validate each request
  for (let i = 0; i < requests.length; i++) {
    const req = requests[i];
    if (!req.symbol || !req.assetType) {
      return NextResponse.json<BaseApiResponse>({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_SYMBOL,
          message: `Invalid request at index ${i}`,
          details: { 
            reason: 'Each request must have symbol and assetType',
            request: req
          }
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    if (!['stock', 'crypto'].includes(req.assetType)) {
      return NextResponse.json<BaseApiResponse>({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_SYMBOL,
          message: `Invalid assetType at index ${i}`,
          details: { 
            reason: 'assetType must be either "stock" or "crypto"',
            provided: req.assetType
          }
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    if (req.timeframe && !chartDataClient.isTimeframeSupported(req.timeframe)) {
      return NextResponse.json<BaseApiResponse>({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_SYMBOL,
          message: `Invalid timeframe at index ${i}`,
          details: { 
            reason: `Timeframe must be one of: ${chartDataClient.getSupportedTimeframes().join(', ')}`,
            provided: req.timeframe
          }
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
  }

  // Process batch requests
  const results = await chartDataClient.getMultipleChartData(requests);

  return NextResponse.json<BaseApiResponse<ChartResponse[]>>({
    success: true,
    data: results,
    timestamp: new Date().toISOString()
  });
}

// Handle single chart request via POST
async function handleSingleRequest(request: BatchChartRequest) {
  // Validate request
  if (!request.symbol || !request.assetType) {
    return NextResponse.json<BaseApiResponse>({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_SYMBOL,
        message: 'Invalid request',
        details: { 
          reason: 'Request must have symbol and assetType',
          request
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  if (!['stock', 'crypto'].includes(request.assetType)) {
    return NextResponse.json<BaseApiResponse>({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_SYMBOL,
        message: 'Invalid assetType',
        details: { 
          reason: 'assetType must be either "stock" or "crypto"',
          provided: request.assetType
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  const timeframe = request.timeframe || '1M';
  if (!chartDataClient.isTimeframeSupported(timeframe)) {
    return NextResponse.json<BaseApiResponse>({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_SYMBOL,
        message: 'Invalid timeframe',
        details: { 
          reason: `Timeframe must be one of: ${chartDataClient.getSupportedTimeframes().join(', ')}`,
          provided: timeframe
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  // Get chart data
  const chartResponse = await chartDataClient.getChartData(request.symbol, request.assetType, timeframe);

  return NextResponse.json<BaseApiResponse<ChartResponse>>({
    success: true,
    data: chartResponse,
    timestamp: new Date().toISOString()
  });
}

// Handle unsupported methods
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