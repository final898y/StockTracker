import { NextResponse, NextRequest } from 'next/server';
import { ERROR_CODES } from '@/constants';
import { incrementApiUsage, checkApiAvailability } from '@/lib/api-usage-tracker';

// API 錯誤處理工具類
export class ApiErrorHandler {
  static handleError(error: unknown, context?: string): NextResponse {
    console.error(`API Error ${context ? `in ${context}` : ''}:`, error);

    // 檢查是否為自定義錯誤對象
    if (error && typeof error === 'object' && 'code' in error) {
      const customError = error as { code: string; message?: string; details?: Record<string, unknown> };
      return this.createErrorResponse(
        customError.code, 
        customError.message || '發生錯誤', 
        customError.details
      );
    }

    // 檢查是否為 HTTP 錯誤
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as { response: { status: number; data?: unknown } };
      const status = httpError.response.status;
      return this.createErrorResponseFromStatus(status, httpError.response.data);
    }

    // 檢查是否為網路錯誤
    if (error && typeof error === 'object' && 'code' in error) {
      const networkError = error as { code: string };
      if (networkError.code === 'ENOTFOUND' || networkError.code === 'ECONNREFUSED') {
        return this.createErrorResponse(
          ERROR_CODES.NETWORK_ERROR,
          '無法連接到外部服務',
          { originalError: networkError.code }
        );
      }
    }

    // 檢查是否為超時錯誤
    if (error && typeof error === 'object') {
      const timeoutError = error as { code?: string; name?: string };
      if (timeoutError.code === 'ETIMEDOUT' || timeoutError.name === 'TimeoutError') {
        return this.createErrorResponse(
          ERROR_CODES.NETWORK_ERROR,
          '請求超時，請稍後再試',
          { timeout: true }
        );
      }
    }

    // 預設錯誤
    const errorMessage = error && typeof error === 'object' && 'message' in error 
      ? (error as { message: string }).message 
      : '發生未知錯誤';
    
    return this.createErrorResponse(
      ERROR_CODES.EXTERNAL_API_ERROR,
      errorMessage
    );
  }

  static createErrorResponse(
    code: string,
    message: string,
    details?: Record<string, unknown>,
    status: number = 500
  ): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
          details,
        },
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  static createErrorResponseFromStatus(
    status: number,
    data?: unknown
  ): NextResponse {
    let code: string;
    let message: string;

    switch (status) {
      case 400:
        code = ERROR_CODES.INVALID_SYMBOL;
        message = '無效的請求參數';
        break;
      case 404:
        code = ERROR_CODES.ASSET_NOT_FOUND;
        message = '找不到請求的資源';
        break;
      case 429:
        code = ERROR_CODES.API_RATE_LIMIT;
        message = 'API 請求次數已達上限，請稍後再試';
        break;
      case 500:
        code = ERROR_CODES.EXTERNAL_API_ERROR;
        message = '外部服務發生錯誤';
        break;
      case 502:
        code = ERROR_CODES.EXTERNAL_API_ERROR;
        message = '外部服務暫時無法使用';
        break;
      case 503:
        code = ERROR_CODES.EXTERNAL_API_ERROR;
        message = '服務暫時無法使用';
        break;
      default:
        code = ERROR_CODES.EXTERNAL_API_ERROR;
        message = `HTTP ${status} 錯誤`;
    }

    return this.createErrorResponse(code, message, { status, response: data }, status);
  }

  // 包裝 API 調用以處理錯誤和使用量監控
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    provider: string,
    context?: string
  ): Promise<T> {
    try {
      // 檢查 API 可用性
      const availability = checkApiAvailability(provider);
      if (!availability.available) {
        throw {
          code: ERROR_CODES.API_RATE_LIMIT,
          message: `${provider} API 使用量已達上限`,
          details: {
            remaining: availability.remaining,
            resetTime: availability.resetTime,
          },
        };
      }

      // 執行操作
      const result = await operation();

      // 記錄 API 使用量
      incrementApiUsage(provider);

      return result;
    } catch (error) {
      // 記錄錯誤並重新拋出
      console.error(`Error in ${context || 'API operation'}:`, error);
      throw error;
    }
  }

  // 創建成功回應
  static createSuccessResponse<T>(
    data: T,
    message?: string
  ): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // 驗證請求參數
  static validateRequest(
    request: Request,
    requiredParams: string[]
  ): { isValid: boolean; error?: NextResponse } {
    const url = new URL(request.url);
    const missingParams: string[] = [];

    for (const param of requiredParams) {
      if (!url.searchParams.get(param)) {
        missingParams.push(param);
      }
    }

    if (missingParams.length > 0) {
      return {
        isValid: false,
        error: this.createErrorResponse(
          ERROR_CODES.INVALID_SYMBOL,
          `缺少必要參數: ${missingParams.join(', ')}`,
          { missingParams },
          400
        ),
      };
    }

    return { isValid: true };
  }

  // 處理 CORS 錯誤
  static handleCorsError(): NextResponse {
    return this.createErrorResponse(
      ERROR_CODES.NETWORK_ERROR,
      '跨域請求被阻止',
      { cors: true },
      403
    );
  }

  // 處理超時錯誤
  static handleTimeoutError(timeout: number): NextResponse {
    return this.createErrorResponse(
      ERROR_CODES.NETWORK_ERROR,
      `請求超時 (${timeout}ms)`,
      { timeout },
      408
    );
  }
}

// 裝飾器函數，用於包裝 API 路由
export function withApiErrorHandling<T extends NextRequest>(
  handler: (request: T, context?: unknown) => Promise<NextResponse>
) {
  return async (request: T, context?: unknown): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return ApiErrorHandler.handleError(error, `${request.method} ${request.url}`);
    }
  };
}

// 重試機制工具
export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    backoff: boolean = true
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // 如果是最後一次嘗試，直接拋出錯誤
        if (attempt === maxRetries) {
          break;
        }

        // 對於某些錯誤類型不重試
        if (this.shouldNotRetry(error)) {
          break;
        }

        // 計算延遲時間
        const currentDelay = backoff ? delay * Math.pow(2, attempt) : delay;
        
        console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${currentDelay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, currentDelay));
      }
    }

    throw lastError;
  }

  private static shouldNotRetry(error: unknown): boolean {
    // 不重試的錯誤類型
    const nonRetryableErrors = [
      ERROR_CODES.INVALID_SYMBOL,
      ERROR_CODES.ASSET_NOT_FOUND,
    ];

    // 檢查是否為有 code 屬性的錯誤
    if (error && typeof error === 'object' && 'code' in error) {
      const codeError = error as { code: string };
      if (nonRetryableErrors.includes(codeError.code as typeof nonRetryableErrors[number])) {
        return true;
      }
    }

    // 檢查是否為 HTTP 4xx 錯誤
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as { response: { status: number } };
      if (httpError.response.status >= 400 && httpError.response.status < 500) {
        return true;
      }
    }

    return false;
  }
}

// 快取工具
export class CacheHandler {
  private static cache = new Map<string, { data: unknown; expires: number }>();

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  static set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs,
    });
  }

  static clear(): void {
    this.cache.clear();
  }

  static delete(key: string): void {
    this.cache.delete(key);
  }
}