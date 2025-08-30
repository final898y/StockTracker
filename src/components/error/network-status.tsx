'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface NetworkStatusProps {
  onStatusChange?: (isOnline: boolean) => void;
  showOfflineMessage?: boolean;
  className?: string;
}

export function NetworkStatus({ 
  onStatusChange, 
  showOfflineMessage = true, 
  className = '' 
}: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // 初始化網路狀態
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      onStatusChange?.(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      onStatusChange?.(false);
    };

    // 監聽網路狀態變化
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onStatusChange]);

  // 自動隱藏離線橫幅（重新連線後3秒）
  useEffect(() => {
    if (isOnline && showOfflineBanner) {
      const timer = setTimeout(() => {
        setShowOfflineBanner(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineBanner]);

  if (!showOfflineMessage) {
    return null;
  }

  return (
    <>
      {/* 網路狀態指示器 */}
      <div className={`flex items-center gap-2 ${className}`}>
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isOnline ? '已連線' : '離線'}
        </span>
      </div>

      {/* 離線橫幅 */}
      {showOfflineBanner && !isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2">
          <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">
              網路連線中斷，部分功能可能無法使用
            </span>
          </div>
        </div>
      )}

      {/* 重新連線橫幅 */}
      {showOfflineBanner && isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-2">
          <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">
              網路連線已恢復
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// Hook 版本的網路狀態檢測
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // 記錄曾經離線，用於顯示重連訊息
      if (wasOffline) {
        console.log('🌐 網路連線已恢復');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      console.log('🚫 網路連線中斷');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

// 離線模式提示組件
export function OfflineNotice({ className = '' }: { className?: string }) {
  const { isOnline } = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
            離線模式
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            目前處於離線狀態，顯示的可能是快取資料。請檢查網路連線以獲取最新資訊。
          </p>
        </div>
      </div>
    </div>
  );
}

// 網路狀態相關的工具函數
export const networkUtils = {
  // 檢查是否在線
  isOnline: () => navigator.onLine,
  
  // 測試網路連線
  testConnection: async (url = '/api/health'): Promise<boolean> => {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5秒超時
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  // 等待網路恢復
  waitForConnection: (timeout = 30000): Promise<boolean> => {
    return new Promise((resolve) => {
      if (navigator.onLine) {
        resolve(true);
        return;
      }

      const timeoutId = setTimeout(() => {
        window.removeEventListener('online', handleOnline);
        resolve(false);
      }, timeout);

      const handleOnline = () => {
        clearTimeout(timeoutId);
        window.removeEventListener('online', handleOnline);
        resolve(true);
      };

      window.addEventListener('online', handleOnline);
    });
  },
};