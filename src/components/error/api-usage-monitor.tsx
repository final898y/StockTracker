'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, Clock } from 'lucide-react';

interface ApiUsageData {
  provider: string;
  used: number;
  limit: number;
  resetTime?: Date;
  lastUpdated: Date;
}

interface ApiUsageMonitorProps {
  className?: string;
  showDetails?: boolean;
  warningThreshold?: number; // 警告閾值 (0-1)
}

// API 使用量監控組件
export function ApiUsageMonitor({ 
  className = '', 
  showDetails = false,
  warningThreshold = 0.8 
}: ApiUsageMonitorProps) {
  const [usageData, setUsageData] = useState<ApiUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageData();
    
    // 每5分鐘更新一次使用量資料
    const interval = setInterval(fetchUsageData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/usage');
      
      if (!response.ok) {
        throw new Error('無法獲取 API 使用量資料');
      }
      
      const data = await response.json();
      setUsageData(data.usage || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取使用量資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 95) return { color: 'red', label: '已達上限' };
    if (percentage >= warningThreshold * 100) return { color: 'orange', label: '接近上限' };
    if (percentage >= 50) return { color: 'yellow', label: '使用中' };
    return { color: 'green', label: '正常' };
  };

  const formatResetTime = (resetTime?: Date) => {
    if (!resetTime) return '未知';
    
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    
    if (diff <= 0) return '已重置';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}小時${minutes}分鐘後重置`;
    }
    return `${minutes}分鐘後重置`;
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 dark:text-gray-400 ${className}`}>
        <BarChart3 className="h-4 w-4 animate-pulse" />
        <span className="text-sm">載入使用量資料...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-500 ${className}`}>
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  const hasWarnings = usageData.some(data => 
    getUsagePercentage(data.used, data.limit) >= warningThreshold * 100
  );

  return (
    <div className={className}>
      {/* 簡化顯示 */}
      {!showDetails && (
        <div className="flex items-center gap-2">
          <BarChart3 className={`h-4 w-4 ${hasWarnings ? 'text-orange-500' : 'text-green-500'}`} />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            API 使用量 {hasWarnings ? '⚠️' : '✅'}
          </span>
        </div>
      )}

      {/* 詳細顯示 */}
      {showDetails && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              API 使用量監控
            </h3>
          </div>

          <div className="space-y-3">
            {usageData.map((data) => {
              const percentage = getUsagePercentage(data.used, data.limit);
              const status = getUsageStatus(percentage);
              
              return (
                <div key={data.provider} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {data.provider}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      status.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      status.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                      status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        status.color === 'red' ? 'bg-red-500' :
                        status.color === 'orange' ? 'bg-orange-500' :
                        status.color === 'yellow' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{data.used} / {data.limit} 次請求</span>
                    {data.resetTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatResetTime(data.resetTime)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              最後更新: {new Date().toLocaleTimeString('zh-TW')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// API 使用量警告組件
export function ApiUsageWarning({ 
  provider, 
  percentage, 
  onClose 
}: { 
  provider: string; 
  percentage: number; 
  onClose: () => void; 
}) {
  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-1">
            API 使用量警告
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            {provider} API 使用量已達 {percentage.toFixed(1)}%，請注意控制查詢頻率以避免超出限制。
          </p>
          <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
            💡 建議：減少查詢頻率或等待使用量重置
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-orange-400 hover:text-orange-600 dark:hover:text-orange-200"
        >
          <span className="sr-only">關閉</span>
          ×
        </button>
      </div>
    </div>
  );
}

// Hook 版本的 API 使用量監控
export function useApiUsageMonitor() {
  const [usageData, setUsageData] = useState<ApiUsageData[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/usage');
        if (response.ok) {
          const data = await response.json();
          setUsageData(data.usage || []);
          
          // 檢查警告
          const newWarnings = data.usage
            .filter((item: ApiUsageData) => (item.used / item.limit) >= 0.8)
            .map((item: ApiUsageData) => item.provider);
          
          setWarnings(newWarnings);
        }
      } catch (error) {
        console.error('Failed to fetch API usage:', error);
      }
    };

    fetchUsage();
    const interval = setInterval(fetchUsage, 5 * 60 * 1000); // 每5分鐘檢查一次

    return () => clearInterval(interval);
  }, []);

  return { usageData, warnings };
}