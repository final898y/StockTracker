import { useEffect, useRef, useCallback } from 'react';
import { useWatchlistStore } from '@/stores';
import { useWatchlistPrices } from './use-watchlist-prices';

interface UseRealTimePricesOptions {
  enabled?: boolean;
  interval?: number; // 更新間隔（毫秒）
  maxRetries?: number;
  onError?: (error: Error) => void;
}

export function useRealTimePrices(options: UseRealTimePricesOptions = {}) {
  const {
    enabled = true,
    interval = 60 * 1000, // 預設1分鐘
    maxRetries = 3,
    onError,
  } = options;

  const { items } = useWatchlistStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<Record<string, number>>({});

  // 使用 watchlist prices hook 來獲取價格
  const {
    queries,
    isLoading,
    hasError,
    errors,
    refetch,
  } = useWatchlistPrices({
    enabled,
    refetchInterval: interval,
    staleTime: interval / 2, // 設定較短的 stale time 確保資料新鮮
  });

  // 手動刷新功能
  const manualRefresh = useCallback(async () => {
    try {
      await refetch();
      // 重置重試計數
      retryCountRef.current = {};
    } catch (error) {
      console.error('手動刷新價格失敗:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('手動刷新失敗'));
      }
    }
  }, [refetch, onError]);

  // 處理錯誤重試
  useEffect(() => {
    if (hasError && errors.length > 0) {
      errors.forEach(({ symbol, error }) => {
        const currentRetries = retryCountRef.current[symbol] || 0;
        
        if (currentRetries < maxRetries) {
          retryCountRef.current[symbol] = currentRetries + 1;
          console.warn(`${symbol} 價格更新失敗，將重試 (${currentRetries + 1}/${maxRetries}):`, error);
        } else {
          console.error(`${symbol} 價格更新失敗，已達最大重試次數:`, error);
          if (onError) {
            onError(new Error(`${symbol}: ${error}`));
          }
        }
      });
    }
  }, [hasError, errors, maxRetries, onError]);

  // 清理定時器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 當追蹤清單變化時重置重試計數
  useEffect(() => {
    const currentSymbols = items.map(item => item.asset.symbol);
    const previousSymbols = Object.keys(retryCountRef.current);
    
    // 移除不再追蹤的股票的重試計數
    previousSymbols.forEach(symbol => {
      if (!currentSymbols.includes(symbol)) {
        delete retryCountRef.current[symbol];
      }
    });
  }, [items]);

  return {
    // 狀態
    isLoading,
    hasError,
    errors,
    
    // 方法
    manualRefresh,
    
    // 統計資訊
    totalItems: items.length,
    successfulUpdates: queries.filter(q => q.data && !q.isError).length,
    failedUpdates: queries.filter(q => q.isError).length,
    
    // 最後更新時間
    lastUpdateTime: queries.reduce((latest, query) => {
      if (query.dataUpdatedAt > latest) {
        return query.dataUpdatedAt;
      }
      return latest;
    }, 0),
  };
}