import { NextRequest, NextResponse } from 'next/server';
import { alphaVantageClient } from '@/services/alpha-vantage';
import { ERROR_CODES } from '@/constants';
import { ApiErrorHandler, withApiErrorHandling } from '@/lib/api-error-handler';

async function handleStockSearch(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  // 驗證請求參數
  const validation = ApiErrorHandler.validateRequest(request, ['query']);
  if (!validation.isValid) {
    return validation.error!;
  }

  // 驗證查詢長度
  if (query && query.length > 50) {
    return ApiErrorHandler.createErrorResponse(
      ERROR_CODES.INVALID_SYMBOL,
      '查詢字串過長',
      { maxLength: 50, provided: query.length },
      400
    );
  }

  // 使用錯誤處理包裝器執行 API 調用
  const results = await ApiErrorHandler.withErrorHandling(
    () => alphaVantageClient.searchStocks(query!),
    'Alpha Vantage',
    'Stock Search'
  );

  return ApiErrorHandler.createSuccessResponse(results);
}

export const GET = withApiErrorHandling(handleStockSearch);

// 處理不支援的 HTTP 方法
export async function POST() {
  return ApiErrorHandler.createErrorResponse(
    'METHOD_NOT_ALLOWED',
    '不支援的 HTTP 方法',
    { allowedMethods: ['GET'] },
    405
  );
}

export async function PUT() {
  return ApiErrorHandler.createErrorResponse(
    'METHOD_NOT_ALLOWED',
    '不支援的 HTTP 方法',
    { allowedMethods: ['GET'] },
    405
  );
}

export async function DELETE() {
  return ApiErrorHandler.createErrorResponse(
    'METHOD_NOT_ALLOWED',
    '不支援的 HTTP 方法',
    { allowedMethods: ['GET'] },
    405
  );
}