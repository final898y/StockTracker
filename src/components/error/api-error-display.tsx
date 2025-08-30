'use client';

import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, Clock, TrendingDown } from 'lucide-react';
import { ERROR_CODES, ERROR_MESSAGES } from '@/constants';

interface ApiErrorDisplayProps {
  error: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
  onRetry?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showRetryButton?: boolean;
}

export function ApiErrorDisplay({ 
  error, 
  onRetry, 
  className = '', 
  size = 'md',
  showRetryButton = true 
}: ApiErrorDisplayProps) {
  const getErrorIcon = (errorCode?: string) => {
    switch (errorCode) {
      case ERROR_CODES.NETWORK_ERROR:
        return <WifiOff className="h-5 w-5 text-red-500" />;
      case ERROR_CODES.API_RATE_LIMIT:
        return <Clock className="h-5 w-5 text-orange-500" />;
      case ERROR_CODES.ASSET_NOT_FOUND:
        return <TrendingDown className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getErrorMessage = (error: { code?: string; message?: string }) => {
    if (error.code && ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES]) {
      return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES];
    }
    return error.message || '發生未知錯誤';
  };

  const getErrorColor = (errorCode?: string) => {
    switch (errorCode) {
      case ERROR_CODES.API_RATE_LIMIT:
        return 'text-orange-600 dark:text-orange-400';
      case ERROR_CODES.ASSET_NOT_FOUND:
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-red-600 dark:text-red-400';
    }
  };

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  };

  return (
    <div className={`
      bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg 
      ${sizeClasses[size]} ${className}
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {React.cloneElement(getErrorIcon(error.code), { 
            className: `${iconSizes[size]} ${getErrorColor(error.code)}` 
          })}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${getErrorColor(error.code)} mb-1`}>
            {error.code === ERROR_CODES.API_RATE_LIMIT ? 'API 使用量限制' :
             error.code === ERROR_CODES.NETWORK_ERROR ? '網路連線錯誤' :
             error.code === ERROR_CODES.ASSET_NOT_FOUND ? '找不到資產' :
             '載入錯誤'}
          </h3>
          
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {getErrorMessage(error)}
          </p>

          {error.code === ERROR_CODES.API_RATE_LIMIT && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              💡 提示：請稍等片刻後再試，或考慮減少查詢頻率
            </p>
          )}

          {error.code === ERROR_CODES.NETWORK_ERROR && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              💡 提示：請檢查網路連線狀態
            </p>
          )}
        </div>

        {showRetryButton && onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            重試
          </button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && error.details && (
        <details className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
          <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400">
            錯誤詳情 (開發模式)
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(error.details, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

// 簡化版本的錯誤顯示組件
export function InlineErrorMessage({ 
  message, 
  className = '' 
}: { 
  message: string; 
  className?: string; 
}) {
  return (
    <div className={`flex items-center gap-2 text-red-600 dark:text-red-400 text-sm ${className}`}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Toast 風格的錯誤通知
export function ErrorToast({ 
  error, 
  onClose, 
  autoClose = true 
}: { 
  error: { code?: string; message?: string }; 
  onClose: () => void;
  autoClose?: boolean;
}) {
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            錯誤通知
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {getErrorMessage(error)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <span className="sr-only">關閉</span>
          ×
        </button>
      </div>
    </div>
  );
}

function getErrorMessage(error: { code?: string; message?: string }) {
  if (error.code && ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES]) {
    return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES];
  }
  return error.message || '發生未知錯誤';
}