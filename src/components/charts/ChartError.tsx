'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

interface ChartErrorProps {
  error: string;
  width?: number;
  height?: number;
  className?: string;
  onRetry?: () => void;
}

export function ChartError({ 
  error, 
  width = 800, 
  height = 400, 
  className = '',
  onRetry 
}: ChartErrorProps) {
  return (
    <div 
      className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}
      style={{ width, height }}
    >
      <div className="flex flex-col items-center space-y-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-red-900">圖表載入失敗</h3>
          <p className="text-sm text-red-700 max-w-md">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>重新載入</span>
          </button>
        )}
      </div>
    </div>
  );
}