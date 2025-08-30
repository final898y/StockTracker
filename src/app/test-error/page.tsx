'use client';

import React, { useState } from 'react';
import { 
  ApiErrorDisplay, 
  InlineErrorMessage, 
  ErrorToast,
  ApiUsageMonitor,
  ApiUsageWarning,
  OfflineNotice,
  useErrorHandling,
  useApiErrorHandler,
  useNetworkStatus
} from '@/components/error';
import { ERROR_CODES } from '@/constants';

export default function TestErrorPage() {
  const [showToast, setShowToast] = useState(false);
  const [showUsageWarning, setShowUsageWarning] = useState(false);
  const { handleError, errors, clearErrors } = useErrorHandling();
  const { handleApiError } = useApiErrorHandler();
  const { isOnline } = useNetworkStatus();

  const testErrors = [
    {
      code: ERROR_CODES.NETWORK_ERROR,
      message: '網路連線發生錯誤',
      details: { timeout: true }
    },
    {
      code: ERROR_CODES.API_RATE_LIMIT,
      message: 'API 請求次數已達上限',
      details: { provider: 'Alpha Vantage', limit: 25 }
    },
    {
      code: ERROR_CODES.ASSET_NOT_FOUND,
      message: '找不到指定的股票代碼',
      details: { symbol: 'INVALID' }
    },
    {
      code: ERROR_CODES.EXTERNAL_API_ERROR,
      message: '外部 API 發生錯誤',
      details: { status: 500 }
    }
  ];

  const triggerError = (error: { code?: string; message: string; details?: Record<string, unknown> }) => {
    handleError(error, 'Test Error');
  };

  const triggerApiError = (error: { response?: { status: number; data?: unknown } }) => {
    handleApiError(error, '/api/test');
  };

  const triggerJavaScriptError = () => {
    // 這會觸發全域錯誤邊界
    throw new Error('測試 JavaScript 錯誤');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            錯誤處理組件測試頁面
          </h1>

          {/* 網路狀態 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">網路狀態</h2>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                isOnline 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {isOnline ? '已連線' : '離線'}
              </span>
            </div>
          </div>

          {/* 離線提示 */}
          <OfflineNotice className="mb-6" />

          {/* API 使用量監控 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">API 使用量監控</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ApiUsageMonitor showDetails={false} />
              <ApiUsageMonitor showDetails={true} />
            </div>
          </div>

          {/* 錯誤測試按鈕 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">錯誤測試</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {testErrors.map((error, index) => (
                <button
                  key={index}
                  onClick={() => triggerError(error)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                >
                  {error.code.replace('_', ' ')}
                </button>
              ))}
              
              <button
                onClick={() => setShowToast(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
              >
                顯示 Toast
              </button>
              
              <button
                onClick={() => setShowUsageWarning(true)}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
              >
                使用量警告
              </button>
              
              <button
                onClick={triggerJavaScriptError}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
              >
                JS 錯誤
              </button>
              
              <button
                onClick={clearErrors}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
              >
                清除錯誤
              </button>
            </div>
          </div>

          {/* 錯誤顯示區域 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">錯誤顯示</h2>
            
            {errors.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                沒有錯誤。點擊上方按鈕測試錯誤處理。
              </div>
            ) : (
              errors.map((error, index) => (
                <ApiErrorDisplay
                  key={index}
                  error={error}
                  onRetry={() => console.log('重試:', error)}
                  size="md"
                />
              ))
            )}
          </div>

          {/* 內聯錯誤訊息示例 */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">內聯錯誤訊息</h2>
            <div className="space-y-2">
              <InlineErrorMessage message="這是一個內聯錯誤訊息" />
              <InlineErrorMessage message="另一個錯誤訊息示例" className="text-orange-600" />
            </div>
          </div>

          {/* API 錯誤測試 */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">API 錯誤測試</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => triggerApiError({ 
                  response: { status: 404, data: { message: 'Not found' } }
                })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                404 錯誤
              </button>
              
              <button
                onClick={() => triggerApiError({ 
                  response: { status: 429, data: { message: 'Rate limited' } }
                })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                429 錯誤
              </button>
            </div>
          </div>
        </div>

        {/* Toast 錯誤通知 */}
        {showToast && (
          <ErrorToast
            error={{
              code: ERROR_CODES.API_RATE_LIMIT,
              message: '這是一個測試 Toast 錯誤通知'
            }}
            onClose={() => setShowToast(false)}
          />
        )}

        {/* API 使用量警告 */}
        {showUsageWarning && (
          <div className="fixed bottom-4 right-4 max-w-sm">
            <ApiUsageWarning
              provider="Alpha Vantage"
              percentage={85}
              onClose={() => setShowUsageWarning(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}