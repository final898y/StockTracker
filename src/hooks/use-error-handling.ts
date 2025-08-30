'use client';

import { useState, useCallback, useEffect } from 'react';
import { ERROR_CODES } from '@/constants';

interface ErrorState {
  code?: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

interface ErrorHandlingOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  retryable?: boolean;
  maxRetries?: number;
}

export function useErrorHandling(options: ErrorHandlingOptions = {}) {
  const [errors, setErrors] = useState<ErrorState[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const {
    logToConsole = true,
    retryable = false,
    maxRetries = 3,
  } = options;

  // 處理特定類型的錯誤
  const handleSpecificError = useCallback((error: ErrorState) => {
    switch (error.code) {
      case ERROR_CODES.API_RATE_LIMIT:
        // API 限制錯誤 - 建議等待
        console.warn('⏰ API rate limit reached. Consider implementing exponential backoff.');
        break;
        
      case ERROR_CODES.NETWORK_ERROR:
        // 網路錯誤 - 檢查連線狀態
        console.warn('🌐 Network error detected. Checking connection status.');
        break;
        
      case ERROR_CODES.ASSET_NOT_FOUND:
        // 資產未找到 - 可能是用戶輸入錯誤
        console.info('🔍 Asset not found. This might be expected for invalid symbols.');
        break;
        
      default:
        console.warn('❓ Unhandled error type:', error.code);
    }
  }, []);

  // 處理錯誤的主要函數
  const handleError = useCallback((
    error: Error | { code?: string; message: string; details?: Record<string, unknown> },
    context?: string
  ) => {
    const errorState: ErrorState = {
      code: 'code' in error ? error.code : undefined,
      message: error.message || '發生未知錯誤',
      details: 'details' in error ? error.details : undefined,
      timestamp: new Date(),
    };

    // 記錄錯誤
    setErrors(prev => [...prev, errorState]);

    // 控制台日誌
    if (logToConsole) {
      console.group(`🚨 Error ${context ? `in ${context}` : ''}`);
      console.error('Error:', error);
      console.error('Timestamp:', errorState.timestamp);
      if (errorState.details) {
        console.error('Details:', errorState.details);
      }
      console.groupEnd();
    }

    // 根據錯誤類型進行特殊處理
    handleSpecificError(errorState);

    return errorState;
  }, [logToConsole, handleSpecificError]);

  // 重試函數
  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> => {
    if (!retryable || retryCount >= maxRetries) {
      throw new Error(`已達最大重試次數 (${maxRetries})`);
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      const result = await operation();
      setRetryCount(0); // 成功後重置重試計數
      return result;
    } catch (error) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // 指數退避，最大10秒
      
      console.warn(`🔄 Retry ${retryCount + 1}/${maxRetries} failed. Waiting ${delay}ms before next attempt.`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (retryCount + 1 >= maxRetries) {
        handleError(error as Error, context);
        throw error;
      }
      
      return retry(operation, context);
    } finally {
      setIsRetrying(false);
    }
  }, [retryable, maxRetries, retryCount, handleError]);

  // 清除錯誤
  const clearErrors = useCallback(() => {
    setErrors([]);
    setRetryCount(0);
  }, []);

  // 清除特定錯誤
  const clearError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 獲取最新錯誤
  const latestError = errors[errors.length - 1];

  // 檢查是否有特定類型的錯誤
  const hasErrorType = useCallback((errorCode: string) => {
    return errors.some(error => error.code === errorCode);
  }, [errors]);

  // 自動清理舊錯誤（超過5分鐘）
  useEffect(() => {
    const cleanup = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      setErrors(prev => prev.filter(error => error.timestamp > fiveMinutesAgo));
    }, 60000); // 每分鐘檢查一次

    return () => clearInterval(cleanup);
  }, []);

  return {
    errors,
    latestError,
    isRetrying,
    retryCount,
    handleError,
    retry,
    clearErrors,
    clearError,
    hasErrorType,
  };
}

// 全域錯誤處理 Hook
export function useGlobalErrorHandler() {
  const [globalErrors, setGlobalErrors] = useState<ErrorState[]>([]);

  // 監聽未捕獲的錯誤
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      const error: ErrorState = {
        message: event.message || '未捕獲的錯誤',
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        },
        timestamp: new Date(),
      };

      setGlobalErrors(prev => [...prev, error]);
      
      console.error('🚨 Unhandled Error:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error: ErrorState = {
        message: event.reason?.message || '未處理的 Promise 拒絕',
        details: {
          reason: event.reason,
          stack: event.reason?.stack,
        },
        timestamp: new Date(),
      };

      setGlobalErrors(prev => [...prev, error]);
      
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const clearGlobalErrors = useCallback(() => {
    setGlobalErrors([]);
  }, []);

  return {
    globalErrors,
    clearGlobalErrors,
  };
}

// API 錯誤處理專用 Hook
export function useApiErrorHandler() {
  const { handleError, ...rest } = useErrorHandling({
    showToast: true,
    logToConsole: true,
    retryable: true,
    maxRetries: 3,
  });

  const handleApiError = useCallback((
    error: unknown,
    endpoint?: string
  ) => {
    // 標準化 API 錯誤格式
    let standardizedError: ErrorState;

    // 檢查是否為 HTTP 錯誤回應
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as { response: { status: number; data?: unknown } };
      // HTTP 錯誤回應
      const status = httpError.response.status;
      const data = httpError.response.data;

      const errorData = data && typeof data === 'object' && 'error' in data 
        ? (data as { error: { code?: string; message?: string } }).error 
        : null;
      
      standardizedError = {
        code: errorData?.code || getErrorCodeFromStatus(status),
        message: errorData?.message || getDefaultErrorMessage(status),
        details: {
          status,
          endpoint,
          response: data,
        },
        timestamp: new Date(),
      };
    } else if (error && typeof error === 'object' && 'code' in error) {
      // 已格式化的錯誤
      const formattedError = error as { code: string; message: string; details?: Record<string, unknown> };
      standardizedError = {
        code: formattedError.code,
        message: formattedError.message,
        details: { endpoint, ...formattedError.details },
        timestamp: new Date(),
      };
    } else {
      // 一般錯誤
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : '外部 API 發生錯誤';
      standardizedError = {
        code: ERROR_CODES.EXTERNAL_API_ERROR,
        message: errorMessage,
        details: { endpoint, originalError: error },
        timestamp: new Date(),
      };
    }

    return handleError(standardizedError, endpoint);
  }, [handleError]);

  return {
    handleApiError,
    ...rest,
  };
}

// 輔助函數
function getErrorCodeFromStatus(status: number): string {
  switch (status) {
    case 404:
      return ERROR_CODES.ASSET_NOT_FOUND;
    case 429:
      return ERROR_CODES.API_RATE_LIMIT;
    case 500:
    case 502:
    case 503:
      return ERROR_CODES.EXTERNAL_API_ERROR;
    default:
      return ERROR_CODES.EXTERNAL_API_ERROR;
  }
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 404:
      return '找不到請求的資源';
    case 429:
      return 'API 請求次數已達上限';
    case 500:
      return '伺服器內部錯誤';
    case 502:
      return '伺服器閘道錯誤';
    case 503:
      return '服務暫時無法使用';
    default:
      return '發生未知的伺服器錯誤';
  }
}